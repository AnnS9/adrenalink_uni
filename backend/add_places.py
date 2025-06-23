import sqlite3

connection = sqlite3.connect("data.db")
cur = connection.cursor()

# Mountain Biking
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Cannock Chase", "UK", 4.6, "/images/places/cannock_chase.jpg", 1))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Moab Trails", "USA", 4.9, "/images/places/moab.jpg", 1))

# Surfing
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Bondi Beach", "Australia", 4.7, "/images/places/bondi.jpg", 2))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Pipeline", "Hawaii", 4.8, "/images/places/pipeline.jpg", 2))

# Kitesurfing
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Tarifa", "Spain", 4.7, "/images/places/tarifa.jpg", 3))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Maui", "Hawaii", 4.9, "/images/places/maui_kite.jpg", 3))

# Snowboarding
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Whistler", "Canada", 4.9, "/images/places/whistler.jpg", 4))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Verbier", "Switzerland", 4.8, "/images/places/verbier.jpg", 4))

# Ziplining
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Monteverde", "Costa Rica", 4.7, "/images/places/monteverde.jpg", 5))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Arenal", "Costa Rica", 4.8, "/images/places/arenal.jpg", 5))

# Rock Climbing
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Yosemite", "USA", 5.0, "/images/places/yosemite.jpg", 6))
cur.execute("INSERT INTO places (name, location, rating, image, category_id) VALUES (?, ?, ?, ?, ?)",
            ("Kalymnos", "Greece", 4.8, "/images/places/kalymnos.jpg", 6))

connection.commit()
connection.close()

print("✅ Places added successfully.")