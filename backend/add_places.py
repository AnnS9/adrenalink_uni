import sqlite3

connection = sqlite3.connect("./instance/data.db")
cur = connection.cursor()

# Clear existing UK places first (optional)
cur.execute("DELETE FROM places WHERE location = 'UK'")

# UK Places
places_uk = [
    ("Cannock Chase", "UK", 0, "/images/places/cannock_chase.jpg", 1, 52.7167, -1.9833, "Beautiful forest with trails and wildlife."),
    ("Dalby Forest", "UK", 0, "/images/places/dalby_forest.jpg", 1, 54.2312, -0.8812, "Popular forest for walking, cycling, and adventure."),
    ("Lake District", "UK", 0, "/images/places/lake_district.jpg", 1, 54.4609, -3.0886, "Famous national park with lakes, hills, and hiking."),
    ("Peak District", "UK", 0, "/images/places/peak_district.jpg", 1, 53.3676, -1.6873, "National park with valleys, caves, and climbing spots."),
    ("Snowdonia", "UK", 0, "/images/places/snowdonia.jpg", 1, 53.0685, -4.0760, "Mountainous region in Wales with stunning scenery."),
    ("Exmoor", "UK", 0, "/images/places/exmoor.jpg", 1, 51.2000, -3.7500, "National park with moorlands and coastline."),
    ("New Forest", "UK", 0, "/images/places/new_forest.jpg", 1, 50.8500, -1.6000, "Ancient forest with wildlife and walking trails."),
# 2 - Surfing
    ("Fistral Beach", "UK", 0, "/images/places/fistral_beach.jpg", 2, 50.4180, -5.0826, "Cornwall's most famous surfing beach."),
    ("Porthcawl Beach", "UK", 0, "/images/places/porthcawl.jpg", 2, 51.4865, -3.6617, "Popular surfing spot in South Wales."),

    # 3 - Kitesurfing / Windsurfing
    ("West Wittering", "UK", 0, "/images/places/west_wittering.jpg", 3, 50.7878, -0.8914, "Wide sandy beach popular for kitesurfing."),
    ("Hayling Island", "UK", 0, "/images/places/hayling_island.jpg", 3, 50.8300, -0.9780, "Great spot for wind and kite sports."),

    # 4 - Snowboarding / Winter Sports
    ("Glenshee Ski Centre", "UK", 0, "/images/places/glenshee.jpg", 4, 56.8667, -3.3333, "Scotland's largest ski resort with slopes and snowboarding."),
    ("Nevis Range", "UK", 0, "/images/places/nevis_range.jpg", 4, 56.8167, -5.0033, "Skiing and snowboarding in the Scottish Highlands."),

    # 5 - Ziplining / Adventure Parks
    ("Go Ape Alice Holt", "UK", 0, "/images/places/go_ape_alice_holt.jpg", 5, 51.1475, -0.8575, "Adventure park with treetop rope courses."),
    ("Go Ape Cannock Chase", "UK", 0, "/images/places/go_ape_cannock.jpg", 5, 52.7167, -1.9833, "Treetop adventure with zip lines."),

    # 6 - Rock Climbing
    ("Hathersage", "UK", 0, "/images/places/hathersage.jpg", 6, 53.3500, -1.6800, "Popular climbing area in Peak District."),
    ("Stanage Edge", "UK", 0, "/images/places/stanage_edge.jpg", 6, 53.3570, -1.6020, "Famous gritstone climbing edge in the Peak District."),

]

for place in places_uk:
    cur.execute(
        "INSERT INTO places (name, location, rating, image, category_id, latitude, longitude, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        place
    )

connection.commit()
connection.close()

print("✅ UK Places added successfully.")
