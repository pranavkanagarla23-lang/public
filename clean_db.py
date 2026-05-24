import sqlite3
import os

DB_PATH = 'database.db'

def wipe_database():
    print("=========================================================")
    print("       SHANMUKHA FASHIONS - DATABASE CLEANING UTILITY")
    print("=========================================================")
    print()
    
    if os.path.exists(DB_PATH):
        try:
            # Connect to DB
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Wipe products and orders
            cursor.execute("DELETE FROM products")
            cursor.execute("DELETE FROM orders")
            conn.commit()
            conn.close()
            
            print("[SUCCESS] All dummy products and order history have been cleared.")
            print("          Your SQLite database is now completely fresh and ready!")
            print("          You can now start adding your actual inventory through the Owner Dashboard.")
        except Exception as e:
            print(f"[ERROR] Could not wipe database: {e}")
    else:
        print("[INFO] Database file does not exist yet. It will be created fresh on startup.")

if __name__ == '__main__':
    wipe_database()
