import sqlite3

connection = sqlite3.connect("data.db")
cur = connection.cursor()

cur.execute("DELETE FROM users")  # This deletes all rows in the users table

connection.commit()
connection.close()

print("✅ All users deleted.")