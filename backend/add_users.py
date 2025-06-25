import sqlite3
from werkzeug.security import generate_password_hash
# Import the 'create_app' function from your main run.py file
from run import create_app

print("Starting add_users.py script...")

# Create an instance of your Flask app to get its context
app = create_app()

# Use the application context to connect to the correct database
with app.app_context():
    # Now that we have the context, we can import get_db
    from db import get_db
    
    # Get the database connection
    db = get_db()
    
    # --- Data to be added ---
    # You can easily add more users to this list
    users_to_add = [
        {
            "username": "admin",
            "email": "admin@adrenalink.com",
            "password": "admin123", # Plain text password
            "role": "admin"
        },
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "role": "client"
        }
        # Add more user dictionaries here...
    ]
    
    # --- Loop through the users and add them if they don't exist ---
    for user_data in users_to_add:
        email = user_data["email"]
        
        # 1. Check if a user with this email already exists
        existing_user = db.execute(
            "SELECT id FROM users WHERE email = ?", (email,)
        ).fetchone()
        
        # 2. If no user is found, proceed with insertion
        if existing_user is None:
            print(f"Attempting to add user: {email}...")
            
            # Hash the password before storing it
            hashed_password = generate_password_hash(user_data["password"])
            
            db.execute(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                (user_data["username"], email, hashed_password, user_data["role"])
            )
            db.commit()
            print(f"✅ User {email} added successfully.")
        else:
            # 3. If user already exists, skip them
            print(f"⚠️ User with email {email} already exists, skipping.")

print("\nadd_users.py script finished.")

