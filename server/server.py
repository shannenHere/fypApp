from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
from analysis.NLPAnalysis_single import NLPAnalysis_single

app = Flask(__name__)
CORS(app)

DATABASE = 'scrapers/privacy_policies.db'

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
            "icon_url": icon_map.get(app["app_id"]),  # Use the mapping to add the icon URL.
            "rating": app["rating"]
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
    
    # Fetch analysis record from analysis_log table
    analysis_details = conn.execute('''
        SELECT privacy_concern, sensitive_sentences, generic_sentences, 
               worst_permissions, rating, privacy_sentiment, permission_sentiment, avg_sentiment
        FROM analysis_log 
        WHERE app_id = ?
    ''', (app_id,)).fetchone()
    
    conn.close()
    
    if app_details:
        result = dict(app_details)
        result['icon_url'] = icon_details['icon_url'] if icon_details else None

        if analysis_details:
            result.update(dict(analysis_details))

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

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'message': 'Login successful', 'is_admin': user['is_admin']})
    else:
        return jsonify({'error': 'Invalid e-mail or password'}), 401

@app.route('/check-email', methods=['POST'])
def check_email():
    data = request.json
    email = data.get('email')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    return jsonify({'exists': bool(user)})

# Forgot Password
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('newPassword')

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    # Hash the new password
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    conn.execute('UPDATE users SET password = ? WHERE email = ?', (hashed_password, email))
    conn.commit()
    conn.close()

    # In a real application, send an email with the new password here.
    # For now, we'll just return success.
    return jsonify({'success': True, 'message': 'Password reset successful'})

# Get result from Sentiment analysis of policies & permissions
@app.route('/nlp', methods=['GET'])
def analyze():
    # Get app_id and flag from query parameters
    app_id_to_analyze = request.args.get('app_id')
    flag = request.args.get('flag', '')  # Default to empty string if not provided

    # Check if app_id is provided, if not return an error
    if not app_id_to_analyze:
        return jsonify({"error": "app_id is required"}), 400
    
    # If flag is provided as 'force', override any previous analysis
    force_flag = '--force' in flag.split(',')

    try:
        # Call NLPAnalysis_single with app_id and the force flag
        result = NLPAnalysis_single(app_id_to_analyze, force_flag)
        
        # Return the analysis results as JSON response
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

