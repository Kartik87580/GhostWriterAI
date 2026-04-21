"""
One-time migration script: adds is_verified and otp columns to the users table.
Run this once from your backend directory:
  python migrate.py
"""
import os
from dotenv import load_dotenv
import psycopg2
from urllib.parse import urlparse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
    print("❌ This script only works with a PostgreSQL (Neon) DATABASE_URL.")
    exit(1)

# Parse connection URL
result = urlparse(DATABASE_URL)
conn = psycopg2.connect(
    dbname=result.path[1:],
    user=result.username,
    password=result.password,
    host=result.hostname,
    port=result.port,
    sslmode="require"
)
conn.autocommit = True
cur = conn.cursor()

migrations = [
    ("is_verified", "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;"),
    ("otp",         "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR;"),
    ("blogs.user_id","ALTER TABLE blogs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);"),
]

for name, sql in migrations:
    try:
        cur.execute(sql)
        print(f"✅ Applied migration: {name}")
    except Exception as e:
        print(f"⚠️  Could not apply '{name}': {e}")

cur.close()
conn.close()
print("\n🎉 Migration complete! Restart your uvicorn server now.")
