import os
import sqlite3
from pathlib import Path
from datetime import timedelta
from flask import Flask, g, jsonify, request, current_app, session, Blueprint
from flask_cors import CORS
from auth import require_admin
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

community_bp = Blueprint("community", __name__, url_prefix="/api/community")

def get_db():
    if "db" not in g:
        db_path = current_app.config["DATABASE"]
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

def _split_origins(val):
    if not val:
        return []
    return [o.strip() for o in val.split(",") if o.strip()]

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    is_production = os.getenv("FLASK_ENV", "production") == "production"
    origins_env = os.getenv("CORS_ORIGINS", "")
    allowed_origins = _split_origins(origins_env) or [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
 
    
    db_env = os.getenv("DATABASE", "")
    default_db = os.path.join(app.instance_path, "data.db")
    db_path = os.path.abspath(db_env if db_env else default_db)
    Path(os.path.dirname(db_path)).mkdir(parents=True, exist_ok=True)

    app.config.from_mapping(
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY", "change-me"),
        DATABASE=db_path,
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
        SESSION_COOKIE_SAMESITE="None" if is_production else "Lax",
        SESSION_COOKIE_SECURE=True if is_production else False,
        SESSION_COOKIE_HTTPONLY=True,
    )
    if is_production:
        allowed_origins.append("https://adrenalink-uni-1.onrender.com")
    
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    @app.teardown_appcontext
    def close_db(e=None):
        db = g.pop("db", None)
        if db:
            db.close()

    @app.get("/api/health")
    def health():
        return {"status": "ok", "database": app.config["DATABASE"]}, 200

    with app.app_context():
        from db import init_app
        init_app(app)
        from auth import auth_bp
        from admin import admin_bp
        app.register_blueprint(auth_bp)
        app.register_blueprint(admin_bp)
        app.register_blueprint(community_bp)

    @app.route("/api/categories", methods=["GET"])
    def get_all_categories():
        db = get_db()
        categories = db.execute("SELECT id, name, image, description FROM categories").fetchall()
        return jsonify([dict(row) for row in categories])

    @app.route("/api/places", methods=["GET"])
    def get_places():
        db = get_db()
        places = db.execute("SELECT * FROM places").fetchall()
        out = []
        for p in places:
            avg = db.execute(
                "SELECT AVG(rating) as avg_rating, COUNT(*) as num_reviews FROM reviews WHERE place_id = ?",
                (p["id"],),
            ).fetchone()
            avg_rating = round(avg["avg_rating"], 2) if avg["avg_rating"] else 0
            num_reviews = avg["num_reviews"]
            out.append({**dict(p), "average_rating": avg_rating, "num_reviews": num_reviews})
        return jsonify(out)

    @app.route("/api/category/<int:id>", methods=["GET"])
    def get_category(id):
        db = get_db()
        category = db.execute("SELECT * FROM categories WHERE id = ?", (id,)).fetchone()
        if not category:
            return jsonify({"error": "Category not found"}), 404
        places = db.execute("SELECT * FROM places WHERE category_id = ?", (id,)).fetchall()
        places_out = []
        for p in places:
            avg = db.execute(
                "SELECT AVG(rating) as avg_rating, COUNT(*) as num_reviews FROM reviews WHERE place_id = ?",
                (p["id"],),
            ).fetchone()
            avg_rating = round(avg["avg_rating"], 2) if avg["avg_rating"] else 0
            num_reviews = avg["num_reviews"]
            places_out.append({**dict(p), "average_rating": avg_rating, "num_reviews": num_reviews})
        return jsonify(
            {
                "id": category["id"],
                "name": category["name"],
                "image": category["image"],
                "description": category["description"],
                "places": places_out,
            }
        )

    @app.route("/api/user/favorites", methods=["GET"])
    def get_favorite_places():
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        db = get_db()
        favorites = db.execute(
            """
            SELECT p.id, p.name, p.location, p.rating, p.image
            FROM user_favorites uf
            JOIN places p ON uf.place_id = p.id
            WHERE uf.user_id = ?
            """,
            (user_id,),
        ).fetchall()
        return jsonify([dict(f) for f in favorites])

    @app.route("/api/user/favorites", methods=["POST"])
    def add_favorite_place():
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json(force=True) or {}
        place_id = data.get("placeId")
        if not place_id:
            return jsonify({"error": "Missing placeId"}), 400
        db = get_db()
        exists = db.execute(
            "SELECT 1 FROM user_favorites WHERE user_id = ? AND place_id = ?", (user_id, place_id)
        ).fetchone()
        if exists:
            return jsonify({"message": "Already in favorites"}), 200
        db.execute("INSERT INTO user_favorites (user_id, place_id) VALUES (?, ?)", (user_id, place_id))
        db.commit()
        return jsonify({"message": "Added to favorites"}), 201

    @app.route("/api/user/favorites", methods=["DELETE"])
    def remove_favorite_place():
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json(force=True) or {}
        place_id = data.get("placeId")
        if not place_id:
            return jsonify({"error": "Missing placeId"}), 400
        db = get_db()
        db.execute("DELETE FROM user_favorites WHERE user_id = ? AND place_id = ?", (user_id, place_id))
        db.commit()
        return jsonify({"message": "Removed from favorites"}), 200

    @app.route("/api/place/<int:id>", methods=["GET"])
    def get_place(id):
        db = get_db()
        place = db.execute("SELECT * FROM places WHERE id = ?", (id,)).fetchone()
        if not place:
            return jsonify({"error": "Place not found"}), 404
        reviews = db.execute(
            """
            SELECT r.id, r.rating, r.text, r.created_at,
                   COALESCE(u.full_name, u.username, 'Anonymous') AS author,
                   u.full_name,
                   u.id AS user_id
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
            """,
            (id,),
        ).fetchall()
        avg = db.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as num_reviews FROM reviews WHERE place_id = ?",
            (id,),
        ).fetchone()
        avg_rating = round(avg["avg_rating"], 2) if avg["avg_rating"] else 0
        num_reviews = avg["num_reviews"]
        user_id = session.get("user_id")
        is_favorited = False
        if user_id:
            fav = db.execute(
                "SELECT 1 FROM user_favorites WHERE user_id = ? AND place_id = ?", (user_id, id)
            ).fetchone()
            if fav:
                is_favorited = True
        return jsonify(
            {
                **dict(place),
                "reviews": [dict(r) for r in reviews],
                "average_rating": avg_rating,
                "num_reviews": num_reviews,
                "is_favorited": is_favorited,
            }
        )

    @app.route("/api/place/<int:id>/review", methods=["POST"])
    def add_review(id):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json(force=True) or {}
        text = data.get("text")
        rating = data.get("rating")
        if not text or rating is None or not (1 <= rating <= 5):
            return jsonify({"error": "Invalid review data"}), 400
        db = get_db()
        exists = db.execute(
            "SELECT 1 FROM reviews WHERE place_id = ? AND user_id = ?", (id, user_id)
        ).fetchone()
        if exists:
            return jsonify({"error": "You have already reviewed this place"}), 400
        cur = db.execute(
            "INSERT INTO reviews (place_id, user_id, text, rating) VALUES (?, ?, ?, ?)",
            (id, user_id, text, rating),
        )
        db.commit()
        review_id = cur.lastrowid
        avg = db.execute(
            "SELECT AVG(rating) as avg_rating FROM reviews WHERE place_id = ?", (id,)
        ).fetchone()
        avg_rating = round(avg["avg_rating"], 2) if avg["avg_rating"] else 0
        db.execute("UPDATE places SET rating = ? WHERE id = ?", (avg_rating, id))
        db.commit()
        review = db.execute(
            """
            SELECT r.id, r.rating, r.text, r.created_at,
                   COALESCE(u.full_name, u.username, 'Anonymous') AS author,
                   u.full_name,
                   u.id AS user_id
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
            """,
            (review_id,),
        ).fetchone()
        review_dict = dict(review)
        review_dict["place_avg_rating"] = avg_rating
        return jsonify(review_dict), 201

    @app.route("/api/review/<int:review_id>", methods=["DELETE"])
    @require_admin
    def delete_review(review_id):
        db = get_db()
        db.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
        db.commit()
        return jsonify({"message": "Review deleted"}), 200

    @app.route("/api/users/<int:user_id>", methods=["GET"])
    def get_user_public(user_id):
        db = get_db()
        user = db.execute(
            "SELECT id, username, full_name, profile_picture, location, activities FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        u = dict(user)
        if u.get("activities"):
            u["activities"] = [a.strip() for a in u["activities"].split(",")]
        else:
            u["activities"] = []
        return jsonify(u)

    @app.route("/api/check-auth", methods=["GET"])
    def check_auth():
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"logged_in": False})
        db = get_db()
        user = db.execute("SELECT id, username, role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            return jsonify({"logged_in": False})
        return jsonify({"logged_in": True, "user": {"id": user["id"], "username": user["username"], "role": user["role"]}})

    @app.route("/api/search", methods=["GET"])
    def search_places():
        query = request.args.get("q", "").lower()
        db = get_db()
        results = db.execute(
            """
            SELECT id, name, location, description
            FROM places
            WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(location) LIKE ?
            """,
            (f"%{query}%", f"%{query}%", f"%{query}%"),
        ).fetchall()
        return jsonify([dict(r) for r in results])
    
    @app.get("/api/profile/me")
    def profile_me():
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401

        db = get_db()
        user = db.execute(
            """
            SELECT id, username, full_name, email, role,
                profile_picture, location, activities
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        out = dict(user)
        # normalize activities to string for your current UI
        if out.get("activities") and isinstance(out["activities"], str):
            out["activities"] = out["activities"]
        elif out.get("activities") is None:
            out["activities"] = ""

        return jsonify(out), 200
        
    return app

@community_bp.get("")
def get_posts():
    db = get_db()
    posts = db.execute("SELECT * FROM forum_posts ORDER BY created_at DESC").fetchall()
    return jsonify({"posts": [dict(p) for p in posts]})

@community_bp.post("")
def create_post():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(force=True) or {}
    title = data.get("title", "").strip()
    body = data.get("body", "").strip()
    category = data.get("category", "").strip()
    if not title or not body or not category:
        return jsonify({"error": "All fields are required"}), 400
    db = get_db()
    user = db.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    post_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO forum_posts (id, category, title, body, username) VALUES (?, ?, ?, ?, ?)",
        (post_id, category, title, body, user["username"]),
    )
    db.commit()
    new_post = db.execute("SELECT * FROM forum_posts WHERE id = ?", (post_id,)).fetchone()
    return jsonify({"post": dict(new_post)}), 201

@community_bp.get("/<string:post_id>")
def get_post(post_id):
    db = get_db()
    post = db.execute("SELECT * FROM forum_posts WHERE id = ?", (post_id,)).fetchone()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    comments = db.execute(
        "SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at DESC", (post_id,)
    ).fetchall()
    return jsonify({**dict(post), "comments": [dict(c) for c in comments]})

@community_bp.post("/<string:post_id>/comments")
def add_comment(post_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(force=True) or {}
    body = data.get("body", "").strip()
    if not body:
        return jsonify({"error": "Comment cannot be empty"}), 400
    db = get_db()
    user = db.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.execute(
        "INSERT INTO forum_comments (post_id, username, body) VALUES (?, ?, ?)",
        (post_id, user["username"], body),
    )
    db.commit()
    return jsonify({"message": "Comment added"}), 201

@community_bp.delete("/<string:post_id>")
@require_admin
def delete_post(post_id):
    db = get_db()
    db.execute("DELETE FROM forum_posts WHERE id = ?", (post_id,))
    db.commit()
    return jsonify({"message": "Post deleted"}), 200

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
