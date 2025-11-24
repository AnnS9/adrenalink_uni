import sqlite3
from functools import wraps
from typing import List, Tuple, Dict, Any
from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash
from db import get_db

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function


def _error(message: str, status: int = 400):
    return jsonify({"error": message}), status


def _validate_fields(data: Dict[str, Any], required: List[str]) -> Tuple[bool, List[str]]:
    missing = [field for field in required if not data.get(field)]
    return (len(missing) == 0, missing)


# READ
@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    db = get_db()
    users = db.execute("SELECT id, email, username, role FROM users ORDER BY id").fetchall()
    return jsonify([dict(row) for row in users]), 200


@admin_bp.route("/places", methods=["GET"])
@admin_required
def get_places():
    db = get_db()
    places = db.execute("""
        SELECT p.*, c.name AS category_name
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id
    """).fetchall()
    return jsonify([dict(row) for row in places]), 200


@admin_bp.route("/categories", methods=["GET"])
@admin_required
def get_categories():
    db = get_db()
    cats = db.execute("SELECT * FROM categories ORDER BY id").fetchall()
    return jsonify([dict(row) for row in cats]), 200


# CREATE
@admin_bp.route("/users", methods=["POST"])
@admin_required
def add_user():
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)

    required = ["username", "email", "password"]
    ok, missing = _validate_fields(data, required)
    if not ok:
        return _error(f"Missing required field(s): {', '.join(missing)}")

    username, email, password = data["username"].strip(), data["email"].strip(), data["password"]
    role = data.get("role", "client").strip() or "client"
    hashed_pw = generate_password_hash(password)

    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            (username, email, hashed_pw, role)
        )
        db.commit()
        return jsonify({"message": "User added successfully."}), 201
    except sqlite3.IntegrityError:
        return _error("Username or email already exists", 409)
    except Exception as e:
        return _error(str(e), 500)


@admin_bp.route("/categories", methods=["POST"])
@admin_required
def add_category():
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)

    required = ["name"]
    ok, missing = _validate_fields(data, required)
    if not ok:
        return _error(f"Missing required field(s): {', '.join(missing)}")

    name = data["name"].strip()
    description = data.get("description", "").strip() or None
    image = data.get("image", "").strip() or None

    db = get_db()
    try:
        db.execute(
            "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)",
            (name, description, image)
        )
        db.commit()
        return jsonify({"message": "Category added successfully."}), 201
    except sqlite3.IntegrityError:
        return _error("Category name already exists", 409)
    except Exception as e:
        return _error(str(e), 500)


@admin_bp.route("/places", methods=["POST"])
@admin_required
def add_place():
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)

    required = ["name", "category_id"]
    ok, missing = _validate_fields(data, required)
    if not ok:
        return _error(f"Missing required field(s): {', '.join(missing)}")

    try:
        rating = float(data["rating"]) if data.get("rating") not in (None, "") else None
        latitude = float(data["latitude"]) if data.get("latitude") not in (None, "") else None
        longitude = float(data["longitude"]) if data.get("longitude") not in (None, "") else None
        category_id = int(data["category_id"])
    
    except ValueError:
        return _error("Invalid numeric value", 400)

    name = data["name"].strip()
    description = data.get("description", "").strip() or None
    location = data.get("location", "").strip() or None
    image = data.get("image", "").strip() or None

    db = get_db()
    category = db.execute("SELECT id FROM categories WHERE id = ?", (category_id,)).fetchone()
    if category is None:
        return _error("Category not found", 404)

    try:
        db.execute("""
            INSERT INTO places
            (name, description, location, image, rating, latitude, longitude, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, description, location, image, rating, latitude, longitude, category_id))
        db.commit()
        return jsonify({"message": "Place added successfully."}), 201
    except sqlite3.IntegrityError:
        return _error("Place with this name already exists", 409)
    except Exception as e:
        return _error(str(e), 500)



# UPDATE (PUT)
def _generic_update(table: str, item_id: int, data: Dict[str, Any]):
    if not data:
        return _error("No data provided for update")

    db = get_db()
    keys = list(data.keys())
    values = [data[k] for k in keys] + [item_id]
    set_clause = ", ".join(f"{k} = ?" for k in keys)

    try:
        db.execute(f"UPDATE {table} SET {set_clause} WHERE id = ?", values)
        db.commit()
    except sqlite3.IntegrityError as e:
        return _error(str(e), 409)
    except Exception as e:
        return _error(str(e), 500)

    return jsonify({"message": f"{table.rstrip('s').capitalize()} updated."}), 200


@admin_bp.route("/users/<int:item_id>", methods=["PUT"])
@admin_required
def update_user(item_id):
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)

    if "password" in data:
        data["password"] = generate_password_hash(data["password"])
    return _generic_update("users", item_id, data)


@admin_bp.route("/categories/<int:item_id>", methods=["PUT"])
@admin_required
def update_category(item_id):
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)
    return _generic_update("categories", item_id, data)


@admin_bp.route("/places/<int:item_id>", methods=["PUT"])
@admin_required
def update_place(item_id):
    try:
        data = request.get_json(force=True)
    except Exception:
        return _error("Invalid JSON payload", 400)
    return _generic_update("places", item_id, data)


# DELETE
@admin_bp.route("/users/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_user(item_id):
    try:
        db = get_db()
        db.execute("DELETE FROM users WHERE id = ?", (item_id,))
        db.commit()
        return jsonify({"message": "User deleted."}), 200
    except Exception as e:
        return _error(str(e), 500)


@admin_bp.route("/categories/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_category(item_id):
    try:
        db = get_db()
        db.execute("DELETE FROM categories WHERE id = ?", (item_id,))
        db.commit()
        return jsonify({"message": "Category deleted."}), 200
    except Exception as e:
        return _error(str(e), 500)


@admin_bp.route("/places/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_place(item_id):
    try:
        db = get_db()
        db.execute("DELETE FROM places WHERE id = ?", (item_id,))
        db.commit()
        return jsonify({"message": "Place deleted."}), 200
    except Exception as e:
        return _error(str(e), 500)
