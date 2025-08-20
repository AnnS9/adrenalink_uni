import os
import sqlite3
from flask import Flask, g, jsonify, request, current_app, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

# --- Database ---
def get_db():
    if 'db' not in g:
        db_path = os.path.join(current_app.instance_path, 'data.db')
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

# --- Flask App Factory ---
def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # Config
    app.config.from_mapping(
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'your-default-secret-key'),
        DATABASE=os.path.join(app.instance_path, 'data.db'),
        PERMANENT_SESSION_LIFETIME=timedelta(days=7)
    )

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Close DB on teardown
    @app.teardown_appcontext
    def close_db(e=None):
        db = g.pop('db', None)
        if db:
            db.close()

    # --- Initialize DB & Blueprints ---
    with app.app_context():
        from db import init_app
        init_app(app)
        from auth import auth_bp, require_admin
        from admin import admin_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(admin_bp)

    # --- Category & Place Routes ---
    @app.route('/api/categories', methods=['GET'])
    def get_all_categories():
        db = get_db()
        categories = db.execute("SELECT id, name, image, description FROM categories").fetchall()
        return jsonify([dict(row) for row in categories])

    @app.route('/api/places', methods=['GET'])
    def get_places():
        db = get_db()
        places = db.execute("SELECT * FROM places").fetchall()
        return jsonify([dict(row) for row in places])

    @app.route('/api/category/<int:id>', methods=['GET'])
    def get_category(id):
        db = get_db()
        category = db.execute("SELECT * FROM categories WHERE id = ?", (id,)).fetchone()
        if not category:
            return jsonify({"error": "Category not found"}), 404
        places = db.execute("SELECT * FROM places WHERE category_id = ?", (id,)).fetchall()
        return jsonify({
            "id": category["id"],
            "name": category["name"],
            "image": category["image"],
            "description": category["description"],
            "places": [dict(p) for p in places]
        })

    # --- User Favorites ---
    @app.route('/api/user/favorites', methods=['GET'])
    def get_favorite_places():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        db = get_db()
        favorites = db.execute("""
            SELECT p.id, p.name, p.location, p.rating, p.image
            FROM user_favorites uf
            JOIN places p ON uf.place_id = p.id
            WHERE uf.user_id = ?
        """, (user_id,)).fetchall()
        return jsonify([dict(fav) for fav in favorites])

    @app.route('/api/user/favorites', methods=['POST'])
    def add_favorite_place():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json(force=True) or {}
        place_id = data.get('placeId')
        if not place_id:
            return jsonify({'error': 'Missing placeId'}), 400

        db = get_db()
        exists = db.execute("SELECT 1 FROM user_favorites WHERE user_id = ? AND place_id = ?", (user_id, place_id)).fetchone()
        if exists:
            return jsonify({'message': 'Already in favorites'}), 200

        db.execute("INSERT INTO user_favorites (user_id, place_id) VALUES (?, ?)", (user_id, place_id))
        db.commit()
        return jsonify({'message': 'Added to favorites'}), 201

    # --- Place & Review Routes ---
    @app.route('/api/place/<int:id>', methods=['GET'])
    def get_place(id):
        db = get_db()
        place = db.execute("SELECT * FROM places WHERE id = ?", (id,)).fetchone()
        if not place:
            return jsonify({"error": "Place not found"}), 404
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
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json(force=True) or {}
        text = data.get('text')
        rating = data.get('rating')
        if not text or rating is None:
            return jsonify({'error': 'Incomplete review data'}), 400

        db = get_db()
        cursor = db.execute(
            "INSERT INTO reviews (place_id, user_id, text, rating) VALUES (?, ?, ?, ?)",
            (id, user_id, text, rating)
        )
        db.commit()
        review_id = cursor.lastrowid

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

    # --- Auth Check ---
    @app.route('/api/check-auth', methods=['GET'])
    def check_auth():
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'logged_in': False})

        db = get_db()
        user = db.execute("SELECT id, username, role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({'logged_in': False})

        return jsonify({
            'logged_in': True,
            'user': {'id': user['id'], 'username': user['username'], 'role': user['role']}
        })

    # --- Community Posts ---
    @app.route("/api/community/<category_name>", methods=["GET", "POST"])
    def community_posts(category_name):
        db = get_db()

        # Normalize category name
        normalized_name = category_name.replace("-", " ").lower()
        category = db.execute(
            "SELECT id FROM categories WHERE LOWER(name) = ?",
            (normalized_name,)
        ).fetchone()

        if not category:
            return jsonify({"posts": []})

        category_id = category["id"]

        if request.method == "POST":
            user_id = session.get('user_id')
            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401

            data = request.get_json(force=True) or {}
            title = data.get("title")
            body = data.get("body")

            if not title or not body:
                return jsonify({"error": "Missing fields"}), 400

            cursor = db.execute(
                "INSERT INTO posts (title, body, user_id, category_id) VALUES (?, ?, ?, ?)",
                (title, body, user_id, category_id)
            )
            db.commit()
            new_id = cursor.lastrowid

            return jsonify({
                "post": {
                    "id": new_id,
                    "title": title,
                    "body": body,
                    "user_id": user_id
                }
            }), 201

        # GET → fetch posts
        posts = db.execute(
            """
            SELECT p.id, p.title, p.body, p.created_at, u.username AS author
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.category_id = ?
            ORDER BY p.created_at DESC
            """,
            (category_id,)
        ).fetchall()

        return jsonify([dict(p) for p in posts])

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
