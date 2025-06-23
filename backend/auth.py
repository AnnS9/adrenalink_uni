from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()

    if user:
        if check_password_hash(user['password'], password):
            session.permanent = True
            session['user_id'] = user['id']
            session['role'] = user['role']

            return jsonify({
                "message": "Login successful",
                "logged_in": True,
                "user_role": user['role']
            })

    return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/api/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    role = session.get('role')

    if user_id:
        return jsonify({
            "logged_in": True,
            "user_role": role
        })
        
    return jsonify({"logged_in": False})


@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})
