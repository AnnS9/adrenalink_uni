import sqlite3
from functools import wraps
from typing import List, Tuple, Dict, Any
from flask import Blueprint, jsonify, request, session, abort
from werkzeug.security import generate_password_hash
from db import get_db

# Blueprint

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")



def admin_required(f):
    """Decorator that ensures the requester has an admin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            abort(403)  # Forbidden
        return f(*args, **kwargs)

    return decorated_function


def _error(message: str, status: int = 400):
    """Consistent error response helper."""
    return jsonify({"error": message}), status


def _validate_fields(data: Dict[str, Any], required: List[str]) -> Tuple[bool, List[str]]:
    """Return True/[] if all required fields are present & non‑empty, else False/missing list."""
    missing = [field for field in required if not data.get(field)]
    return (len(missing) == 0, missing)



# READ (GET)

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():
    db = get_db()
    users = db.execute(
        "SELECT id, email, username, role FROM users ORDER BY id"
    ).fetchall()
    return jsonify([dict(row) for row in users])


@admin_bp.route("/places", methods=["GET"])
@admin_required
def get_places():
    db = get_db()
    places = db.execute(
        """
        SELECT p.*, c.name AS category_id
        FROM places p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id
        """
    ).fetchall()
    return jsonify([dict(row) for row in places])


@admin_bp.route("/categories", methods=["GET"])
@admin_required
def get_categories():
    db = get_db()
    cats = db.execute("SELECT * FROM categories ORDER BY id").fetchall()
    return jsonify([dict(row) for row in cats])



# CREATE (POST)

@admin_bp.route("/users", methods=["POST"])
@admin_required
def add_user():
    data = request.get_json(force=True, silent=True) or {}
    required = ["username", "email", "password"]
    ok, missing = _validate_fields(data, required)
    if not ok:
        return _error(f"Missing required field(s): {', '.join(missing)}")

    username, email, password = (
        data["username"].strip(),
        data["email"].strip(),
        data["password"],
    )
    role = data.get("role", "client").strip() or "client"

    hashed_pw = generate_password_hash(password)
    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            (username, email, hashed_pw, role),
        )
        db.commit()
        return jsonify({"message": "User added successfully."}), 201
    except sqlite3.IntegrityError:
        return _error("Username or email already exists", 409)


@admin_bp.route("/categories", methods=["POST"])
@admin_required
def add_category():
    data = request.get_json(force=True, silent=True) or {}
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
            (name, description, image),
        )
        db.commit()
        return jsonify({"message": "Category added successfully."}), 201
    except sqlite3.IntegrityError:
        return _error("Category name already exists", 409)


@admin_bp.route("/places", methods=["POST"])
@admin_required
def add_place():
    data = request.get_json(force=True, silent=True) or {}
    required = ["name", "category_id"]
    ok, missing = _validate_fields(data, required)
    if not ok:
        return _error(f"Missing required field(s): {', '.join(missing)}")

    fields = (
        data["name"].strip(),
        data.get("description", "").strip() or None,
        data.get("location", "").strip() or None,
        data.get("image", "").strip() or None,
        float(data.get("rating")) if data.get("rating") else None,
        float(data.get("latitude")) if data.get("latitude") else None,
        float(data.get("longitude")) if data.get("longitude") else None,
        int(data["category_id"]),
    )

    db = get_db()
    
    category = db.execute(
        "SELECT id FROM categories WHERE id = ?", (fields[-1],)
    ).fetchone()
    if category is None:
        return _error("Category not found", 404)

    db.execute(
        """
        INSERT INTO places
        (name, description, location, image, rating, latitude, longitude, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        fields,
    )
    db.commit()
    return jsonify({"message": "Place added successfully."}), 201



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

    return jsonify({"message": f"{table.rstrip('s').capitalize()} updated."})


@admin_bp.route("/users/<int:item_id>", methods=["PUT"])
@admin_required
def update_user(item_id):
    data = request.get_json(force=True, silent=True) or {}
    if "password" in data:
        data["password"] = generate_password_hash(data["password"])
    return _generic_update("users", item_id, data)


@admin_bp.route("/categories/<int:item_id>", methods=["PUT"])
@admin_required
def update_category(item_id):
    data = request.get_json(force=True, silent=True) or {}
    return _generic_update("categories", item_id, data)


@admin_bp.route("/places/<int:item_id>", methods=["PUT"])
@admin_required
def update_place(item_id):
    data = request.get_json(force=True, silent=True) or {}
    return _generic_update("places", item_id, data)



# DELETE


@admin_bp.route("/users/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_user(item_id):
    db = get_db()
    db.execute("DELETE FROM users WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"message": "User deleted."})


@admin_bp.route("/categories/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_category(item_id):
    db = get_db()
    db.execute("DELETE FROM categories WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"message": "Category deleted."})


@admin_bp.route("/places/<int:item_id>", methods=["DELETE"])
@admin_required
def delete_place(item_id):
    db = get_db()
    db.execute("DELETE FROM places WHERE id = ?", (item_id,))
    db.commit()
    return jsonify({"message": "Place deleted."})