import os
import psycopg2
import psycopg2.extras
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
load_dotenv()

# Configure Cloudinary if URL is provided
if os.environ.get('CLOUDINARY_URL'):
    pass # automatically picked up by SDK

import json
from flask import Flask, request, jsonify, render_template, send_from_directory, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'dev-fallback-secret-key')

CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": [
            "https://shanmukha-fashions.onrender.com",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ]
    }
})

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="memory://"
)

DB_PATH = '/data/database.db' if (os.path.exists('/data') or os.environ.get('RENDER')) else 'database.db'
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'shanmukha2026')

# Startup Checks
if not os.environ.get('DATABASE_URL'):
    print("WARNING: DATABASE_URL environment variable is missing!", flush=True)
if not os.environ.get('CLOUDINARY_URL'):
    print("WARNING: CLOUDINARY_URL environment variable is missing!", flush=True)

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
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"Database Connection Error: {e}", flush=True)
        raise e

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT to_regclass('products')")
    db_exists = cursor.fetchone()[0] is not None
    
    # 1. Product Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id VARCHAR PRIMARY KEY,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            category TEXT NOT NULL,
            mrp NUMERIC,
            price NUMERIC NOT NULL,
            rating NUMERIC DEFAULT 5.0,
            reviewsCount INTEGER DEFAULT 0,
            tag TEXT DEFAULT '',
            stock INTEGER DEFAULT 0,
            image TEXT NOT NULL,
            images TEXT NOT NULL,
            "desc" TEXT NOT NULL,
            details TEXT NOT NULL,
            sizes TEXT NOT NULL
        )
    ''')
    
    # 2. Order Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            order_id VARCHAR PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            order_details TEXT NOT NULL,
            total_amount NUMERIC NOT NULL,
            status TEXT DEFAULT 'Pending',
            estimated_delivery TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    
    # 3. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            phone_number VARCHAR PRIMARY KEY,
            password TEXT NOT NULL
        )
    ''')
    
    # 4. Add mrp column to products if it doesn't exist
    cursor.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC")

    conn.commit()
    
    # Seed Products if empty AND database was just created
    if not db_exists:
        cursor.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0:
            for p in DEFAULT_PRODUCTS:
                cursor.execute('''
                    INSERT INTO products (id, title, department, category, mrp, price, rating, reviewsCount, tag, stock, image, images, "desc", details, sizes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (p['id'], p['title'], p['department'], p['category'], p.get('mrp'), p['price'], p['rating'], p['reviewsCount'], p['tag'], p['stock'], p['image'], p['images'], p['desc'], p['details'], p['sizes']))
            conn.commit()
            print("Database initialized and successfully seeded with 12 luxury products!")
    
    conn.close()

# Initialize DB on import/startup
init_db()

# --- WEB PAGES ---
@app.route('/')
def index():
    return render_template('index.html')

# --- REST API ENDPOINTS ---
from functools import wraps

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("admin"):
            return jsonify({"success": False, "message": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper

@app.post("/api/admin/login")
@limiter.limit("3 per minute")
def admin_login():
    data = request.json or {}
    pin = data.get('pin')
    
    # We use werkzeug for secure password checking in production, or fallback for old seeds
    import werkzeug.security
    # In a real system, you'd check a hashed password. 
    # For now, we compare against the environment variable.
    if pin == ADMIN_PASSWORD:
        session["admin"] = True
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid PIN"}), 401

@app.post("/api/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return jsonify({"success": True})




# 1. GET ALL PRODUCTS
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
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
            "mrp": float(r["mrp"]) if r["mrp"] is not None else None,
            "price": float(r["price"]) if r["price"] is not None else 0.0,
            "rating": float(r["rating"]) if r["rating"] is not None else 0.0,
            "reviewsCount": r["reviewscount"],
            "tag": r["tag"],
            "stock": r["stock"],
            "image": r["image"],
            "images": r["images"].split(',') if r["images"] else [r["image"]],
            "desc": r["desc"],
            "details": r["details"],
            "sizes": r["sizes"].split(',') if r["sizes"] else []
        })
    return jsonify(products)

# 2. CREATE PRODUCT (ADMIN CRUD)
@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
        
    import time
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
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
        mrp_raw = request.form.get('mrp')
        mrp = float(mrp_raw) if mrp_raw else None
        stock = int(request.form.get('stock', 5))
        desc = request.form.get('desc', '')
        details = request.form.get('details', '')
        sizes_val = request.form.get('sizes')
        
        # Upload to Cloudinary
        if os.environ.get('CLOUDINARY_URL'):
            upload_result = cloudinary.uploader.upload(file)
            image_url = upload_result['secure_url']
        else:
            # Fallback if Cloudinary is not configured
            image_url = "https://via.placeholder.com/500"
    else:
        # Fallback to JSON payload if any
        data = request.get_json(silent=True) or request.form or {}
        title = data.get('title', 'Curated Garment')
        dept = data.get('department', 'mens')
        category = data.get('category', 'Tops')
        price = float(data.get('price', 100.0))
        mrp_raw = data.get('mrp')
        mrp = float(mrp_raw) if mrp_raw else None
        stock = int(data.get('stock', 5))
        desc = data.get('desc', '')
        details = data.get('details', '')
        image_url = data.get('image', '')
        sizes_val = data.get('sizes')

    images_str = image_url
    fallback_sizes = '2Y,4Y,6Y,8Y' if dept == 'kids' else 'S,M,L,XL'
    sizes_str = sizes_val if sizes_val else "One Size"
    sizes_str = sizes_val if sizes_val is not None else fallback_sizes
    
    try:
        cursor.execute('''
            INSERT INTO products (id, title, department, category, mrp, price, rating, reviewsCount, tag, stock, image, images, "desc", details, sizes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            product_id,
            title,
            dept,
            category,
            mrp,
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
        conn.rollback() if conn else None
        print(f"Backend Error: {e}", flush=True)
        return jsonify({"success": False, "message": str(e)}), 500

# 3. DELETE PRODUCT (ADMIN CRUD)
@app.route('/api/products/<id>', methods=['DELETE'])
@admin_required
def delete_product(id):
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("DELETE FROM products WHERE id = %s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Garment successfully deleted!"})

# 4. RESET PRODUCTS TO DEFAULTS
@app.route('/api/products/reset', methods=['POST'])
@admin_required
def reset_products():
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("DELETE FROM products")
    for p in DEFAULT_PRODUCTS:
        cursor.execute('''
            INSERT INTO products (id, title, department, category, mrp, price, rating, reviewsCount, tag, stock, image, images, "desc", details, sizes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (p['id'], p['title'], p['department'], p['category'], p.get('mrp'), p['price'], p['rating'], p['reviewsCount'], p['tag'], p['stock'], p['image'], p['images'], p['desc'], p['details'], p['sizes']))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Catalog successfully reset to factory defaults!"})

# 5. GET ALL ORDERS (ADMIN PORTAL)
@app.route('/api/orders', methods=['GET'])
@admin_required
def get_orders():
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
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
            "total_amount": float(r["total_amount"]) if r["total_amount"] is not None else 0.0,
            "status": r["status"],
            "estimated_delivery": r["estimated_delivery"] if "estimated_delivery" in r.keys() else None
        })
    return jsonify(orders)

@app.route('/api/orders', methods=['POST'])
@limiter.limit("5 per minute")
def create_order():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    order_id = data.get('order_id')
    customer_name = data.get('customer_name')
    customer_phone = data.get('customer_phone')
    delivery_address = data.get('delivery_address')
    client_items = data.get('order_details', [])
    status = 'Pending'
    
    from datetime import datetime, timedelta
    estimated_delivery = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
    
    try:
        total_amount = 0.0
        final_order_details = []
        
        for item in client_items:
            product_id = item.get('product_id')
            qty = int(item.get('qty', 1))
            size = item.get('size', 'One Size')
            
            cursor.execute("SELECT title, price, stock FROM products WHERE id = %s", (product_id,))
            product = cursor.fetchone()
            
            if not product:
                raise Exception(f"Product {product_id} not found")
            if product['stock'] < qty:
                raise Exception(f"Insufficient stock for {product['title']}. Available: {product['stock']}")
                
            item_price = float(product['price'])
            total_amount += item_price * qty
            
            final_order_details.append({
                "title": product['title'],
                "size": size,
                "qty": qty,
                "price": item_price
            })
            
            cursor.execute("UPDATE products SET stock = stock - %s WHERE id = %s", (qty, product_id))
            
        order_details_json = json.dumps(final_order_details)
        
        cursor.execute('''
            INSERT INTO orders (order_id, customer_name, customer_phone, delivery_address, order_details, total_amount, status, estimated_delivery)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (order_id, customer_name, customer_phone, delivery_address, order_details_json, total_amount, status, estimated_delivery))
        
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Order created successfully!", "order_id": order_id}), 201
    except Exception as e:
        if conn: conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 400

# 7. FULFILL ORDER (MARK DELIVERED)
@app.route('/api/orders/<id>/fulfill', methods=['PUT'])
@admin_required
def fulfill_order(id):
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("SELECT status FROM orders WHERE order_id = %s", (id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Order not found"}), 404
        
    try:
        cursor.execute("UPDATE orders SET status = 'Delivered' WHERE order_id = %s", (id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "status": "Delivered"})
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# 8. CLEAR ALL ORDERS (ADMIN ONLY)
@app.route('/api/orders/clear', methods=['POST'])
@admin_required
def clear_orders():
        
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("DELETE FROM orders")
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Order history cleared!"})

# --- NEW DASHBOARD ENDPOINTS ---

# GET DASHBOARD STATS
@app.route('/api/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # Total orders
        cursor.execute("SELECT COUNT(*) as total FROM orders")
        total_orders = cursor.fetchone()['total']
        
        # Today's orders
        cursor.execute("SELECT COUNT(*) as today FROM orders WHERE created_at >= CURRENT_DATE")
        today_orders = cursor.fetchone()['today']
        
        # Total revenue
        cursor.execute("SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders")
        total_revenue = float(cursor.fetchone()['revenue'])
        
        # Low stock items (stock < 5)
        cursor.execute("SELECT COUNT(*) as low_stock FROM products WHERE stock < 5")
        low_stock = cursor.fetchone()['low_stock']
        
        conn.close()
        return jsonify({
            "success": True,
            "data": {
                "total_orders": total_orders,
                "today_orders": today_orders,
                "revenue": total_revenue,
                "low_stock_items": low_stock
            }
        })
    except Exception as e:
        if conn: conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# UPDATE PRODUCT DETAILS
@app.route('/api/products/<id>', methods=['PUT'])
@admin_required
def update_product(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE products 
            SET title = %s, department = %s, category = %s, price = %s, mrp = %s, stock = %s, "desc" = %s, details = %s, sizes = %s
            WHERE id = %s
        ''', (
            data.get('title'), data.get('department'), data.get('category'), 
            data.get('price'), data.get('mrp'), data.get('stock'), 
            data.get('desc'), data.get('details'), data.get('sizes'), id
        ))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Product updated successfully"})
    except Exception as e:
        if conn: conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# QUICK UPDATE STOCK
@app.route('/api/products/<id>/stock', methods=['PATCH'])
@admin_required
def update_product_stock(id):
    data = request.get_json()
    new_stock = data.get('stock')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE products SET stock = %s WHERE id = %s", (new_stock, id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Stock updated successfully"})
    except Exception as e:
        if conn: conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# UPDATE ORDER STATUS
@app.route('/api/orders/<id>/status', methods=['PATCH'])
@admin_required
def update_order_status(id):
    data = request.get_json()
    new_status = data.get('status')
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE orders SET status = %s WHERE order_id = %s", (new_status, id))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Order status updated successfully"})
    except Exception as e:
        if conn: conn.rollback()
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# EXPORT ORDERS TO CSV
@app.route('/api/orders/export', methods=['GET'])
@admin_required
def export_orders():
    # In a real app, you might filter by date here using request.args
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        if start_date and end_date:
            cursor.execute("SELECT * FROM orders WHERE created_at >= %s AND created_at <= %s ORDER BY created_at DESC", (start_date, end_date))
        else:
            cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        conn.close()
        
        orders = []
        for r in rows:
            orders.append({
                "order_id": r["order_id"],
                "customer_name": r["customer_name"],
                "customer_phone": r["customer_phone"],
                "delivery_address": r["delivery_address"],
                "order_details": r["order_details"],
                "total_amount": float(r["total_amount"]) if r["total_amount"] is not None else 0.0,
                "status": r["status"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None
            })
        return jsonify(orders)
    except Exception as e:
        if conn: conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# GET ANALYTICS DATA
@app.route('/api/analytics', methods=['GET'])
@admin_required
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        # 1. Orders over last 30 days
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM orders 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)
        ''')
        orders_by_date = cursor.fetchall()
        
        # 2. Revenue over last 30 days
        cursor.execute('''
            SELECT DATE(created_at) as date, SUM(total_amount) as revenue 
            FROM orders 
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)
        ''')
        revenue_by_date = cursor.fetchall()

        # 3. Orders by Status
        cursor.execute('''
            SELECT status, COUNT(*) as count 
            FROM orders 
            GROUP BY status
        ''')
        orders_by_status = cursor.fetchall()

        conn.close()
        
        # Build date list from orders_by_date
        dates = [r['date'] for r in orders_by_date]
        orders_counts = [r['count'] for r in orders_by_date]
        
        # Build revenue list aligned to same dates
        rev_map = {r['date']: float(r['revenue']) for r in revenue_by_date}
        revenues = [rev_map.get(d, 0.0) for d in dates]
        
        # Build status dict
        statuses = {r['status']: r['count'] for r in orders_by_status}

        return jsonify({
            "success": True,
            "data": {
                "dates": dates,
                "orders": orders_counts,
                "revenue": revenues,
                "statuses": statuses
            }
        })
    except Exception as e:
        if conn: conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

# 9. CUSTOMER ORDER TRACKING
@app.route('/api/my/orders', methods=['GET'])
def my_orders():
    phone_number = session.get("customer_phone")
    if not phone_number:
        return jsonify({"success": False, "message": "Unauthorized. Please log in."}), 401

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM orders WHERE customer_phone = %s ORDER BY created_at DESC", (phone_number.strip(),))
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
            "total_amount": float(r["total_amount"]) if r["total_amount"] is not None else 0.0,
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
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE phone_number = %s", (phone,))
        user = cursor.fetchone()
        
        if action == 'signup':
            if user:
                conn.close()
                return jsonify({"success": False, "message": "An account with this phone number already exists. Please Sign In."}), 400
            
            # Hash password and save
            from werkzeug.security import generate_password_hash
            hashed_pw = generate_password_hash(password)
            cursor.execute("INSERT INTO users (phone_number, password) VALUES (%s, %s)", (phone, hashed_pw))
            conn.commit()
            conn.close()
            session["customer_phone"] = phone
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
                session["customer_phone"] = phone
                return jsonify({"success": True, "message": "Logged in successfully", "phone_number": phone}), 200
            else:
                conn.close()
                return jsonify({"success": False, "message": "Incorrect password. Please try again."}), 401
                
    except Exception as e:
        conn.close()
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
