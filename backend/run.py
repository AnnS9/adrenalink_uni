import os
import sqlite3
from auth import require_admin
from flask import Flask, g, jsonify, request, current_app, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash
from datetime import timedelta


def get_db():
    if 'db' not in g:
        db_path = os.path.join(current_app.instance_path, 'data.db')
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

# Main App Creation Factory
def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'your-default-secret-key'),
        DATABASE=os.path.join(app.instance_path, 'data.db'),
    )

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    @app.teardown_appcontext
    def close_db(e=None):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    # Register blueprints
    with app.app_context():
        from db import init_app
        init_app(app)
        
        from auth import auth_bp
        from admin import admin_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(admin_bp)

    # Routes
    @app.route('/api/categories', methods=['GET'])
    def get_all_categories():
        db = get_db()
        categories = db.execute("SELECT * FROM categories").fetchall()
        return jsonify([dict(row) for row in categories])

    @app.route('/api/places', methods=['GET'])
    def get_places():
        db = get_db()
        places = db.execute(
            "SELECT id, name, description, location, image, rating, category_id, latitude, longitude FROM places"
        ).fetchall()
        return jsonify([dict(row) for row in places])
        
    @app.route('/api/category/<int:id>', methods=['GET'])
    def get_category(id):
        db = get_db()
        category = db.execute("SELECT * FROM categories WHERE id = ?", (id,)).fetchone()
        places = db.execute("SELECT * FROM places WHERE category_id = ?", (id,)).fetchall()
        if category:
            return jsonify({
                "id": category["id"], "name": category["name"], "image": category["image"],
                "description": category["description"], "places": [dict(p) for p in places]
            })
        return jsonify({"error": "Category not found"}), 404
    
    @app.route('/api/user/<int:user_id>/favorites', methods=['POST'])
    def add_favorite_place(user_id):
        db = get_db()
        data = request.get_json()
        place_id = data.get('placeId')

        if not place_id:
            return jsonify({'error': 'Missing placeId in request body'}), 400

        try:
            
            existing = db.execute(
                "SELECT 1 FROM user_favorites WHERE user_id = ? AND place_id = ?",
                (user_id, place_id)
            ).fetchone()
            if existing:
                return jsonify({'message': 'Place already in favorites'}), 200

            # Insert new favorite
            db.execute(
                "INSERT INTO user_favorites (user_id, place_id) VALUES (?, ?)",
                (user_id, place_id)
            )
            db.commit()

            return jsonify({'message': 'Place added to favorites'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/place/<int:id>', methods=['GET'])
    def get_place(id):
        db = get_db()
        place = db.execute("SELECT * FROM places WHERE id = ?", (id,)).fetchone()
        if not place:
            return jsonify({"error": f"Place with ID {id} not found"}), 404

        reviews = db.execute("""
            SELECT r.id, r.rating, r.text, r.created_at, u.username AS author
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
        """, (id,)).fetchall()
        
        return jsonify({**dict(place), "reviews": [dict(r) for r in reviews]})

    @app.route('/api/place/<int:id>/review', methods=['POST'])
    def add_review(id):
        db = get_db()

        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        text = data.get('text')
        rating = data.get('rating')

        if not all([text, rating]):
            return jsonify({'error': 'Incomplete review data'}), 400

        # Insert new review
        cursor = db.execute(
            "INSERT INTO reviews (place_id, user_id, text, rating) VALUES (?, ?, ?, ?)",
            (id, user_id, text, rating)
        )
        db.commit()
        review_id = cursor.lastrowid  # get the ID of the inserted review

        # Fetch the inserted review with username and timestamp
        review = db.execute("""
            SELECT r.id, r.rating, r.text, r.created_at, u.username AS author
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        """, (review_id,)).fetchone()

        return jsonify(dict(review)), 201
    
    @app.route('/api/review/<int:review_id>', methods=['DELETE'])
    @require_admin
    def delete_review(review_id):
        db = get_db()
        db.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
        db.commit()
        return jsonify({"message": "Review deleted"}), 200
    
    return app        
# Main execution block
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)


