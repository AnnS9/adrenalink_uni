import sqlite3
from werkzeug.security import generate_password_hash
# 1. Import the 'create_app' function from your main run.py file
from run import create_app

print("Starting add_users.py script...")

# 2. Create an instance of your Flask app to get its context
app = create_app()

# 3. Use the application context to connect to the correct database
with app.app_context():
    # Now that we have the context, we can import get_db
    from db import get_db
    
    # Get the database connection
    db = get_db()
    
    # --- Your existing logic for adding users goes here ---
    try:
        print("Attempting to add admin user...")
        admin_password = generate_password_hash('admin123')
        
        db.execute(
            "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
            ('admin', 'admin@adrenalink.com', admin_password, 'admin')
        )
        db.commit()
        print("✅ Admin user added successfully.")
    except sqlite3.IntegrityError:
        print("⚠️ Admin user already exists, skipping.")
        
    # You can add more users here...

print("add_users.py script finished.")
