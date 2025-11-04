import sqlite3

# Path to database file
db_path = 'instance/data.db'

# Connect to SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# table statements
alter_statements = [
    "ALTER TABLE users ADD COLUMN full_name TEXT;",
    "ALTER TABLE users ADD COLUMN location TEXT;",
    "ALTER TABLE users ADD COLUMN profile_picture TEXT;",
    "ALTER TABLE users ADD COLUMN activities TEXT;"
]

for stmt in alter_statements:
    try:
        cursor.execute(stmt)
        print(f"Executed: {stmt}")
    except sqlite3.OperationalError as e:
        print(f"Skipped: {stmt} — Reason: {e}")


try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        place_id INTEGER NOT NULL,
        UNIQUE(user_id, place_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (place_id) REFERENCES places(id)
    );
    """)
    print("Created user_favorites table (if not exists).")
except sqlite3.OperationalError as e:
    print(f"Failed to create user_favorites table: {e}")

conn.commit()
conn.close()
print(" Migration complete.")
