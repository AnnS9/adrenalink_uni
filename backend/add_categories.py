import sqlite3

connection = sqlite3.connect("data.db")
cur = connection.cursor()

# Insert categories
categories = [
    ("Mountain Biking", "/images/mountain_biking.jpg", "Explore rugged trails."),
    ("Surfing", "/images/surfing.jpg", "Ride the waves."),
    ("Kitesurfing", "/images/kitesurfing.jpg", "Harness the wind."),
    ("Snowboarding", "/images/snowboard.jpg", "Shred the slopes."),
    ("Ziplining", "/images/zipline.jpg", "Fly through the trees."),
    ("Rock Climbing", "/images/climb.jpg", "Conquer vertical terrain.")
]

cur.executemany("INSERT INTO categories (name, image, description) VALUES (?, ?, ?)", categories)

connection.commit()
connection.close()

print("✅ Categories added.")