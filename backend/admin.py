from flask import Blueprint, jsonify, session, abort
from functools import wraps
from db import get_db

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            abort(403)
        return f(*args, **kwargs)
    return decorated_function


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
        SELECT p.id, p.name, p.location, c.name as category_name
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
