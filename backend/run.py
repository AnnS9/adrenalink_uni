import os
from flask import Flask, jsonify

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # This sets up the configuration, including the database path
    app.config.from_mapping(
        SECRET_KEY='dev', # Change this to a random string for production
        DATABASE=os.path.join(app.instance_path, 'data.db'),
    )

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Import and register the database functions
    from db import init_app
    init_app(app)

    # Import and register your blueprints inside the factory
    from auth import auth_bp
    from admin import admin_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    # --- Your Public Routes Can Go Here ---
    # (Your other routes for categories, places, etc., should be added back here)
    @app.route('/api/public-test')
    def public_test():
        return jsonify(message="Public route is working!")
        
    return app

# This block runs ONLY when you execute 'python run.py' in the terminal
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)