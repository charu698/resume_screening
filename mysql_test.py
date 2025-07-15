import mysql.connector

print("Trying MySQL connection...")

try:
    db = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="0987",
        database="resume_screening",
        use_pure=True,              # Force use of pure Python implementation
        connection_timeout=10,      # Prevent hanging
        port=3306                   # Ensure correct port
)

    print("✅ Connected to MySQL!")
    db.close()
except mysql.connector.Error as err:
    print("❌ Connection failed:", err)
