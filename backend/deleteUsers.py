import sqlite3

connection = sqlite3.connect("data.db")
cur = connection.cursor()

cur.execute("DELETE FROM users")  

connection.commit()
connection.close()

print(" All users deleted.")