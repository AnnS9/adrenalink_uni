import os
import sqlite3
from flask import Flask, g, jsonify, request, current_app
from flask_cors import CORS
from werkzeug.security import generate_password_hash
from datetime import timedelta

# This function will be imported by your blueprints.
def get_db():
    if 'db' not in g:
        db_path = os.path.join(current_app.instance_path, 'data.db')
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

# Main App Creation Factory
def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    # --- This is the corrected configuration ---
    app.config.from_mapping(
        SECRET_KEY='Adrenaline25', # Change this for production
        DATABASE=os.path.join(app.instance_path, 'data.db'), # This line has been restored
    )
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app, supports_credentials=True)

    @app.teardown_appcontext
    def close_db(e=None):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    # Import blueprints inside the factory to avoid circular imports
    with app.app_context():
        from db import init_app
        init_app(app)
        
        from auth import auth_bp
        from admin import admin_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(admin_bp)

    # --- All Your Public Routes Restored ---
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
                "id": category["id"],
                "name": category["name"],
                "image": category["image"],
                "description": category["description"],
                "places": [dict(p) for p in places]
            })
        return jsonify({"error": "Category not found"}), 404

    @app.route('/api/signup', methods=['POST'])
    def signup():
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({"error": "Missing required fields"}), 400
            
        hashed_password = generate_password_hash(password)
        role = data.get('role', 'client')

        db = get_db()
        try:
            db.execute(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                (username, email, hashed_password, role)
            )
            db.commit()
            return jsonify({"message": "User registered successfully"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"error": "Username or email already exists"}), 400

    return app

# To run the app: python run.py
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)