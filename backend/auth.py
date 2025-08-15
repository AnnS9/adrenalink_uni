import sqlite3
from functools import wraps
from flask import session, jsonify
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
from db import get_db

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/signup', methods=['POST'])
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

        new_user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not new_user:
            return jsonify({"error": "Failed to create user."}), 500

        session.permanent = True
        session['user_id'] = new_user['id']
        session['role'] = new_user['role']
        
        return jsonify({
            "message": "Signup successful, user is now logged in.",
            "user": {
                "id": new_user['id'],
                "role": new_user['role'],
                "email": new_user['email']
            }
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409


@auth_bp.route('/login', methods=['POST'])
def login_user():  # Renamed to avoid conflict
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user and check_password_hash(user['password'], password):
        session.permanent = True
        session['user_id'] = user['id']
        session['role'] = user['role']

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "role": user['role'],
                "email": user['email'],
                "username": user['username']  
            }
        })

    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    role = session.get('role')

    if user_id:
        return jsonify({"logged_in": True, "user_role": role})
        
    return jsonify({"logged_in": False})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})


@auth_bp.route('/adrenaid', methods=['GET'])
def get_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    db = get_db()
    user = db.execute(
        "SELECT id, username, email, full_name, location, profile_picture, activities FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()
    return jsonify(dict(user)) if user else jsonify({"error": "Not found"}), 404


@auth_bp.route('/adrenaid', methods=['PUT'])
def update_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    db = get_db()
    db.execute(
        """
        UPDATE users SET full_name=?, location=?, profile_picture=?, activities=? 
        WHERE id=?
        """,
        (
            data.get('full_name'),
            data.get('location'),
            data.get('profile_picture'),
            ','.join(data.get('activities', [])),
            user_id
        )
    )
    db.commit()
    return jsonify({"message": "Profile updated"})


@auth_bp.route('/profile', methods=['DELETE'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    db = get_db()
    db.execute("DELETE FROM users WHERE id=?", (user_id,))
    db.commit()
    session.clear()
    return jsonify({"message": "Account deleted"})

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('role') != 'admin':
            return jsonify({"error": "Forbidden: Admins only"}), 403
        return f(*args, **kwargs)
    return decorated_function