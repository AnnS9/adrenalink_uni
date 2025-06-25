from flask import Blueprint, jsonify, session, abort, request
from functools import wraps
from db import get_db
from werkzeug.security import generate_password_hash
import sqlite3

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

# --- GET routes to fetch data for tables ---

@admin_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    conn = get_db()
    users = conn.execute("SELECT id, email, role FROM users ORDER BY id").fetchall()
    users_list = [dict(user) for user in users]
    return jsonify(users_list)

@admin_bp.route('/api/admin/places', methods=['GET'])
@admin_required
def get_all_places():
    conn = get_db()
    places = conn.execute("""
        SELECT p.id, p.name, p.location, p.latitude, p.longitude, c.name as category_name
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id
    """).fetchall()
    places_list = [dict(place) for place in places]
    return jsonify(places_list)

@admin_bp.route('/api/admin/categories', methods=['GET'])
@admin_required
def get_all_categories():
    conn = get_db()
    categories = conn.execute("SELECT id, name FROM categories ORDER BY id").fetchall()
    categories_list = [dict(category) for category in categories]
    return jsonify(categories_list)


# --- POST routes to add new data ---

@admin_bp.route('/api/admin/users', methods=['POST'])
@admin_required
def add_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')

    if not all([username, email, password]):
        return jsonify({"error": "Username, email, and password are required fields."}), 400

    hashed_password = generate_password_hash(password)
    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            (username, email, hashed_password, role)
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "User with this username or email already exists."}), 409
    
    return jsonify({"message": "User added successfully"}), 201


@admin_bp.route('/api/admin/places', methods=['POST'])
@admin_required
def add_place():
    data = request.json
    name = data.get('name')
    category_id = data.get('category_id')

    if not all([name, category_id]):
         return jsonify({"error": "Name and Category ID are required fields."}), 400

    db = get_db()
    db.execute(
        """INSERT INTO places (name, description, location, image, rating, category_id, latitude, longitude) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (name, 
         data.get('description'), 
         data.get('location'), 
         data.get('image'), 
         data.get('rating'), 
         category_id,
         data.get('latitude'),
         data.get('longitude')
        )
    )
    db.commit()
    return jsonify({"message": "Place added successfully"}), 201


@admin_bp.route('/api/admin/categories', methods=['POST'])
@admin_required
def add_category():
    data = request.json
    name = data.get('name')

    if not name:
         return jsonify({"error": "Name is a required field."}), 400

    db = get_db()
    try:
        db.execute(
            "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
            (name, data.get('description'), data.get('image'))
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "A category with this name already exists."}), 409
        
    return jsonify({"message": "Category added successfully"}), 201
