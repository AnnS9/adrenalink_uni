import sqlite3
from werkzeug.security import generate_password_hash

from run import create_app

print("Starting add_users.py script...")


app = create_app()


with app.app_context():
    
    from db import get_db
    
 
    db = get_db()
    
  
    users_to_add = [
        {
            "username": "admintest",
            "email": "admintest@adrenalink.com",
            "password": "admin123", 
            "role": "admin"
        },
        {
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "role": "client"
        }
      
    ]
    
  
    for user_data in users_to_add:
        email = user_data["email"]
        
        
        existing_user = db.execute(
            "SELECT id FROM users WHERE email = ?", (email,)
        ).fetchone()
        
       
        if existing_user is None:
            print(f"Attempting to add user: {email}...")
            
            # Hash the password before storing it
            hashed_password = generate_password_hash(user_data["password"])
            
            db.execute(
                "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                (user_data["username"], email, hashed_password, user_data["role"])
            )
            db.commit()
            print(f" User {email} added successfully.")
        else:
           
            print(f" User with email {email} already exists, skipping.")

print("\nadd_users.py script finished.")

