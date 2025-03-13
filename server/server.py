from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt

app = Flask(__name__)
CORS(app)

DATABASE = 'database/privacy_policies.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Endpoint to fetch all apps
@app.route('/apps', methods=['GET'])
def get_apps():
    conn = get_db_connection()
    # Fetch all app details from the policies table
    apps = conn.execute('SELECT app_id, app_name, rating, worst_permissions, privacy_concern FROM policies').fetchall()
    # Fetch all icons from the app_icons table
    icons = conn.execute('SELECT app_id, icon_url FROM app_icons').fetchall()
    conn.close()

    # Create a mapping from app_id to icon_url
    icon_map = {icon["app_id"]: icon["icon_url"] for icon in icons}

    # Convert rows to dict and merge icon data
    result = []
    for app in apps:
        result.append({
            "app_id": app["app_id"],
            "app_name": app["app_name"],
            "rating": app["rating"],
            "worst_permissions": app["worst_permissions"],
            "privacy_concern": app["privacy_concern"],  # Note the comma here.
            "icon_url": icon_map.get(app["app_id"])  # Use the mapping to add the icon URL.
        })
    return jsonify(result)

# Endpoint to fetch details for a specific app by its app_id
@app.route('/app/<string:app_id>', methods=['GET'])
def get_app_details(app_id):
    conn = get_db_connection()
    # Fetch details from policies table
    app_details = conn.execute('SELECT * FROM policies WHERE app_id = ?', (app_id,)).fetchone()
    # Fetch icon URL from app_icons table
    icon_details = conn.execute('SELECT icon_url FROM app_icons WHERE app_id = ?', (app_id,)).fetchone()
    conn.close()
    
    if app_details:
        result = dict(app_details)
        result['icon_url'] = icon_details['icon_url'] if icon_details else None
        return jsonify(result)
    else:
        return jsonify({'error': 'App not found'}), 404
    
# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    is_admin = data.get('is_admin', 0)  # Default to regular user

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        conn.execute('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)', 
                     (email, hashed_password, is_admin))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400
    
# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'message': 'Login successful', 'is_admin': user['is_admin']})
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)

