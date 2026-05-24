import os
import sqlite3
import json
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
CORS(app)

DB_PATH = '/data/database.db' if (os.path.exists('/data') or os.environ.get('RENDER')) else 'database.db'

# Fallback luxury default products (Original list)
DEFAULT_PRODUCTS = [
    {
        "id": "p1",
        "title": "Cashmere Wool Overcoat",
        "department": "mens",
        "category": "Outerwear",
        "price": 340.00,
        "rating": 4.9,
        "reviewsCount": 42,
        "tag": "Bestseller",
        "stock": 3,
        "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
        "desc": "Tailored to perfection, our signature Cashmere Wool Overcoat boasts double-faced structure, premium horn buttons, and a silhouette designed to command attention while insulating maximum comfort.",
        "details": "90% Organic Wool, 10% Cashmere. Horn button closure. Dual internal breast pockets. Dry clean only. Tailored fit.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p2",
        "title": "Bespoke Italian Silk Shirt",
        "department": "mens",
        "category": "Tops",
        "price": 180.00,
        "rating": 4.8,
        "reviewsCount": 29,
        "tag": "New",
        "stock": 8,
        "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
        "desc": "Luminous, light, and tailored to fall elegantly. Woven from 100% fine Italian mulberry silk, this button-down features a gold-tone neck accent and classic barrel cuffs.",
        "details": "100% Italian Mulberry Silk. Pearl buttons. Semi-spread collar. Dry clean only. Fitted cut.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p3",
        "title": "Tailored Wool Trousers",
        "department": "mens",
        "category": "Bottoms",
        "price": 160.00,
        "rating": 4.7,
        "reviewsCount": 31,
        "tag": "",
        "stock": 5,
        "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
        "desc": "Designed with an adjustable side tab waist regulator and clean pressed pleats, these trousers represent the apex of refined business wear.",
        "details": "100% Fine Merino Wool. Adjustable brass buckle side tabs. Double welt back pockets. Regular fit.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p4",
        "title": "Linen Summer Blazer",
        "department": "mens",
        "category": "Outerwear",
        "price": 260.00,
        "rating": 4.6,
        "reviewsCount": 18,
        "tag": "Classic",
        "stock": 4,
        "image": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop",
        "desc": "A lightweight unstructured jacket constructed from pure Belgian flax linen. Perfect for summer weddings, evening drapes, and weekend luxury.",
        "details": "100% Belgian Linen. Unlined structure. Two patch pockets. Double vents. Classic fit.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p5",
        "title": "Mulberry Silk Wrap Dress",
        "department": "womens",
        "category": "Tops",
        "price": 290.00,
        "rating": 4.9,
        "reviewsCount": 56,
        "tag": "Atelier",
        "stock": 2,
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        "desc": "Graceful fluid drapes contour the frame in our premium wrap dress. Highlighted by elegant sleeve pleats and a luxurious gold-tipped waist sash tie.",
        "details": "100% Pure Mulberry Silk. Wrap sash waist closure. Elegant bishop sleeves. Hand wash cold. Regular fluid drape.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p6",
        "title": "Double-Breasted Trench Coat",
        "department": "womens",
        "category": "Outerwear",
        "price": 320.00,
        "rating": 4.9,
        "reviewsCount": 38,
        "tag": "Bestseller",
        "stock": 4,
        "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
        "desc": "Protect against wind and elements in elevated style. This weather-resistant cotton-gabardine trench includes detailed epaulettes, deep gold buckles, and a structured collar.",
        "details": "100% Cotton Gabardine, Satin Lined. Water-resistant. D-ring waist belt. Dry clean only. Oversized drape.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p7",
        "title": "Cashmere Ribbed Knitwear",
        "department": "womens",
        "category": "Tops",
        "price": 210.00,
        "rating": 4.8,
        "reviewsCount": 47,
        "tag": "Soft Touch",
        "stock": 9,
        "image": "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop",
        "desc": "Meticulously ribbed knit sweater featuring an elegant funnel neck. Soft-touch insulation utilizing 100% fine Mongolian cashmere.",
        "details": "100% Mongolian Cashmere. Ribbed collar, cuffs, and hem. Dry clean only. Classic regular fit.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p8",
        "title": "Pleated Crepe Skirt",
        "department": "womens",
        "category": "Bottoms",
        "price": 150.00,
        "rating": 4.7,
        "reviewsCount": 22,
        "tag": "",
        "stock": 6,
        "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        "desc": "Sharp accordion pleating adds structured movement. Created in a high-waisted fluid crepe fabric with a hidden luxury side zipper.",
        "details": "70% Triacetate, 30% Polyester. Side invisible zipper. Regular midi length. Dry clean recommended.",
        "sizes": "S,M,L,XL"
    },
    {
        "id": "p9",
        "title": "Organic Cotton Knit Jumper",
        "department": "kids",
        "category": "Tops",
        "price": 90.00,
        "rating": 4.8,
        "reviewsCount": 15,
        "tag": "Soft Knit",
        "stock": 5,
        "image": "https://images.unsplash.com/photo-1621451537084-482c730e374a?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1621451537084-482c730e374a?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
        "desc": "Super-soft organic knit cotton jumper. Features wood buttons at the neck seam for comfortable wear, hypoallergenic and dye-free organic fibers.",
        "details": "100% Organic GOTS Certified Cotton. Natural wood buttons. Machine washable. Age-based standard sizing.",
        "sizes": "2Y,4Y,6Y,8Y"
    },
    {
        "id": "p10",
        "title": "Denim Buttoned Jacket",
        "department": "kids",
        "category": "Outerwear",
        "price": 110.00,
        "rating": 4.9,
        "reviewsCount": 19,
        "tag": "Sturdy",
        "stock": 3,
        "image": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop",
        "desc": "Heavy-grade premium indigo denim jacket. Built to endure playful adventure while maintaining double stitched luxury structure.",
        "details": "100% Premium Cotton Denim. Indigo copper hardware. Snap front fasteners. Machine washable.",
        "sizes": "2Y,4Y,6Y,8Y"
    },
    {
        "id": "p11",
        "title": "Linen Pocket Overalls",
        "department": "kids",
        "category": "Bottoms",
        "price": 95.00,
        "rating": 4.6,
        "reviewsCount": 12,
        "tag": "Summer Air",
        "stock": 7,
        "image": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop,https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
        "desc": "Breathable and extremely playful flax linen overalls featuring deep front cargo pockets. Pre-washed for maximum soft touch on delicate skin.",
        "details": "100% Pre-washed Flax Linen. Adjustable button shoulder straps. Machine wash cold.",
        "sizes": "2Y,4Y,6Y,8Y"
    },
    {
        "id": "p12",
        "title": "Tiered Cotton Summer Dress",
        "department": "kids",
        "category": "Tops",
        "price": 85.00,
        "rating": 4.7,
        "reviewsCount": 14,
        "tag": "New Arrivals",
        "stock": 2,
        "image": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
        "images": "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
        "desc": "A gorgeous airy dress constructed in tier panels. Finished with detailed gold embroidery borders around the cuffs and neck hem.",
        "details": "100% Fine Organic Cotton Voile. Back keyhole enclosure. Machine wash delicate.",
        "sizes": "2Y,4Y,6Y,8Y"
    }
]

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db_exists = os.path.exists(DB_PATH)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Product Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            rating REAL DEFAULT 5.0,
            reviewsCount INTEGER DEFAULT 0,
            tag TEXT DEFAULT '',
            stock INTEGER DEFAULT 0,
            image TEXT NOT NULL,
            images TEXT NOT NULL,
            desc TEXT NOT NULL,
            details TEXT NOT NULL,
            sizes TEXT NOT NULL
        )
    ''')
    
    # 2. Order Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            order_details TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Pending',
            estimated_delivery TEXT
        )
    ''')
    
    try:
        cursor.execute("ALTER TABLE orders ADD COLUMN estimated_delivery TEXT")
    except sqlite3.OperationalError:
        pass
    
    # 3. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            phone_number TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    
    # Seed Products if empty AND database was just created
    if not db_exists:
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0:
            for p in DEFAULT_PRODUCTS:
                cursor.execute('''
                    INSERT INTO products (id, title, department, category, price, rating, reviewsCount, tag, stock, image, images, desc, details, sizes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (p['id'], p['title'], p['department'], p['category'], p['price'], p['rating'], p['reviewsCount'], p['tag'], p['stock'], p['image'], p['images'], p['desc'], p['details'], p['sizes']))
            conn.commit()
            print("Database initialized and successfully seeded with 12 luxury products!")
    
    conn.close()

# Initialize DB on import/startup
init_db()

# --- WEB PAGES ---
@app.route('/')
def index():
    return render_template('index.html')

# Send logo, app.js and style.css correctly
@app.route('/<path:path>')
def send_static(path):
    # If the user requests app.js, style.css, or logo.png from the root directory
    if path in ['app.js', 'style.css', 'logo.png', 'tunnel_url.txt']:
        return send_from_directory('.', path)
    return send_from_directory('.', path)

# --- REST API ENDPOINTS ---

# 1. GET ALL PRODUCTS
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")
    rows = cursor.fetchall()
    conn.close()
    
    products = []
    for r in rows:
        # Convert comma-separated images and sizes to lists for UI compatibility
        products.append({
            "id": r["id"],
            "title": r["title"],
            "department": r["department"],
            "category": r["category"],
            "price": r["price"],
            "rating": r["rating"],
            "reviewsCount": r["reviewsCount"],
            "tag": r["tag"],
            "stock": r["stock"],
            "image": r["image"],
            "images": r["images"].split(',') if r["images"] else [r["image"]],
            "desc": r["desc"],
            "details": r["details"],
            "sizes": r["sizes"].split(',')
        })
    return jsonify(products)

# 2. CREATE PRODUCT (ADMIN CRUD)
@app.route('/api/products', methods=['POST'])
def add_product():
    import time
    conn = get_db_connection()
    cursor = conn.cursor()
    
    product_id = f"p_{int(time.time() * 1000)}"
    
    # Check if this is a file upload (multipart/form-data)
    file = None
    if 'image' in request.files:
        file = request.files['image']
    elif 'productImage' in request.files:
        file = request.files['productImage']
        
    if file:
        title = request.form.get('title', 'Curated Garment')
        dept = request.form.get('department', 'mens')
        category = request.form.get('category', 'Tops')
        price = float(request.form.get('price', 100.0))
        stock = int(request.form.get('stock', 5))
        desc = request.form.get('desc', '')
        details = request.form.get('details', '')
        
        # Save image file to static/uploads/
        uploads_dir = os.path.join('.', 'static', 'uploads')
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)
            
        # Clean up filename to avoid directory traversal
        original_ext = os.path.splitext(file.filename)[1]
        filename = f"{product_id}{original_ext}"
        filepath = os.path.join(uploads_dir, filename)
        file.save(filepath)
        
        image_url = f"/static/uploads/{filename}"
    else:
        # Fallback to JSON payload if any
        data = request.json or {}
        title = data.get('title', 'Curated Garment')
        dept = data.get('department', 'mens')
        category = data.get('category', 'Tops')
        price = float(data.get('price', 100.0))
        stock = int(data.get('stock', 5))
        desc = data.get('desc', '')
        details = data.get('details', '')
        image_url = data.get('image', '')

    images_str = image_url
    sizes_str = '2Y,4Y,6Y,8Y' if dept == 'kids' else 'S,M,L,XL'
    
    try:
        cursor.execute('''
            INSERT INTO products (id, title, department, category, price, rating, reviewsCount, tag, stock, image, images, desc, details, sizes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product_id,
            title,
            dept,
            category,
            price,
            5.0, # default rating
            0,   # default reviewsCount
            'New', # tag
            stock,
            image_url,
            images_str,
            desc,
            details,
            sizes_str
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Garment successfully uploaded and published!"}), 201
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# 3. DELETE PRODUCT (ADMIN CRUD)
@app.route('/api/products/<id>', methods=['DELETE'])
def delete_product(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Garment successfully deleted!"})

# 4. RESET PRODUCTS TO DEFAULTS
@app.route('/api/products/reset', methods=['POST'])
def reset_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products")
    for p in DEFAULT_PRODUCTS:
        cursor.execute('''
            INSERT INTO products (id, title, department, category, price, rating, reviewsCount, tag, stock, image, images, desc, details, sizes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p['id'], p['title'], p['department'], p['category'], p['price'], p['rating'], p['reviewsCount'], p['tag'], p['stock'], p['image'], p['images'], p['desc'], p['details'], p['sizes']))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Catalog successfully reset to factory defaults!"})

# 5. GET ALL ORDERS (ADMIN PORTAL)
@app.route('/api/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY rowid DESC")
    rows = cursor.fetchall()
    conn.close()
    
    orders = []
    for r in rows:
        orders.append({
            "order_id": r["order_id"],
            "customer_name": r["customer_name"],
            "customer_phone": r["customer_phone"],
            "delivery_address": r["delivery_address"],
            "order_details": json.loads(r["order_details"]),
            "total_amount": r["total_amount"],
            "status": r["status"],
            "estimated_delivery": r["estimated_delivery"] if "estimated_delivery" in r.keys() else None
        })
    return jsonify(orders)

# 6. POST NEW ORDER (PAY ON DELIVERY)
@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    order_id = data.get('order_id')
    customer_name = data.get('customer_name')
    customer_phone = data.get('customer_phone')
    delivery_address = data.get('delivery_address')
    order_details = json.dumps(data.get('order_details', []))
    total_amount = float(data.get('total_amount', 0.0))
    status = 'Pending'
    
    from datetime import datetime, timedelta
    estimated_delivery = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
    
    try:
        # Save order
        cursor.execute('''
            INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, order_details, total_amount, status, estimated_delivery)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (order_id, customer_name, customer_phone, delivery_address, order_details, total_amount, status, estimated_delivery))
        
        # Update product stock levels
        for item in data.get('order_details', []):
            product_title = item.get('title')
            qty = int(item.get('qty', 1))
            cursor.execute("UPDATE products SET stock = MAX(0, stock - ?) WHERE title = ?", (qty, product_title))
            
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Order created successfully!", "order_id": order_id}), 201
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# 7. FULFILL ORDER (MARK DELIVERED)
@app.route('/api/orders/<id>/fulfill', methods=['PUT'])
def fulfill_order(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT status FROM orders WHERE order_id = ?", (id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Order not found"}), 404
        
    try:
        cursor.execute("UPDATE orders SET status = 'Delivered' WHERE order_id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "status": "Delivered"})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# 8. CLEAR ALL ORDERS (ADMIN ONLY)
@app.route('/api/orders/clear', methods=['POST'])
def clear_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM orders")
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Order history cleared!"})

# 9. CUSTOMER ORDER TRACKING
@app.route('/api/orders/track/<phone_number>', methods=['GET'])
def track_orders(phone_number):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders WHERE customer_phone = ? ORDER BY rowid DESC", (phone_number.strip(),))
    rows = cursor.fetchall()
    conn.close()
    
    orders = []
    for r in rows:
        orders.append({
            "order_id": r["order_id"],
            "customer_name": r["customer_name"],
            "customer_phone": r["customer_phone"],
            "delivery_address": r["delivery_address"],
            "order_details": json.loads(r["order_details"]),
            "total_amount": r["total_amount"],
            "status": r["status"],
            "estimated_delivery": r["estimated_delivery"]
        })
    return jsonify(orders)

# 10. CUSTOMER LOGIN & REGISTER
@app.route('/api/login', methods=['POST'])
def customer_login():
    data = request.json
    phone = data.get('phone_number')
    password = data.get('password')
    action = data.get('action', 'signin')
    
    if not phone or not password:
        return jsonify({"success": False, "message": "Phone number and password are required."}), 400
        
    phone = phone.strip()
    password = password.strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE phone_number = ?", (phone,))
        user = cursor.fetchone()
        
        if action == 'signup':
            if user:
                conn.close()
                return jsonify({"success": False, "message": "An account with this phone number already exists. Please Sign In."}), 400
            
            # Hash password and save
            from werkzeug.security import generate_password_hash
            hashed_pw = generate_password_hash(password)
            cursor.execute("INSERT INTO users (phone_number, password) VALUES (?, ?)", (phone, hashed_pw))
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "Account created and logged in successfully", "phone_number": phone}), 201
            
        else: # signin
            if not user:
                conn.close()
                return jsonify({"success": False, "message": "No account found with this phone number. Please Create Account first."}), 404
            
            # Verify password hash
            from werkzeug.security import check_password_hash
            # Support fallback for unhashed passwords (in case there are existing seeded users)
            is_valid = False
            try:
                is_valid = check_password_hash(user['password'], password)
            except Exception:
                is_valid = (user['password'] == password)
                
            if is_valid:
                conn.close()
                return jsonify({"success": True, "message": "Logged in successfully", "phone_number": phone}), 200
            else:
                conn.close()
                return jsonify({"success": False, "message": "Incorrect password. Please try again."}), 401
                
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
