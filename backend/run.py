import os
import sqlite3
import shutil
from pathlib import Path
from datetime import timedelta
from flask import Flask, g, jsonify, request, current_app, session, Blueprint
from flask_cors import CORS
from auth import require_admin
from sentence_transformers import SentenceTransformer, util
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

community_bp = Blueprint("community", __name__, url_prefix="/api/community")

def get_db():
    if 'db' not in g:
        db_path = current_app.config.get('DATABASE') or os.path.join(current_app.instance_path, 'data.db')
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

def _split_origins(val):
    if not val:
        return []
    return [o.strip() for o in val.split(",") if o.strip()]

def bootstrap_db_from_bundled(app):
    target = Path(app.config["DATABASE"])
    if target.exists():
        return
    bundled = Path(__file__).parent / "instance" / "data.db"
    if bundled.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(bundled, target)

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    is_production = os.getenv("FLASK_ENV", "production") == "production"
    frontend_env = os.getenv("CORS_ORIGINS", "")
    default_local_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    allowed_origins = _split_origins(frontend_env) or default_local_origins

    db_env = os.getenv("DATABASE", "")
    db_path = db_env or os.path.join(app.instance_path, "data.db")

    app.config.from_mapping(
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY", "change-me"),
        DATABASE=db_path,
        PERMANENT_SESSION_LIFETIME=timedelta(days=7),
    )

    if not db_env:
        try:
            os.makedirs(app.instance_path, exist_ok=True)
        except OSError:
            pass

    bootstrap_db_from_bundled(app)

    app.config.update(
        SESSION_COOKIE_SAMESITE="None" if is_production else "Lax",
        SESSION_COOKIE_SECURE=True if is_production else False,
        SESSION_COOKIE_HTTPONLY=True,
    )

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

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
