from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = 'todos.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL
        );
    ''')
    conn.commit()
    conn.close()
    print("Database created and schema initialized.")

init_db()

@app.route('/feedback', methods=['GET'])
def get_feedback():
    conn = get_db_connection()
    feedbacks = conn.execute('SELECT * FROM feedback').fetchall()
    conn.close()
    return jsonify([dict(feedback) for feedback in feedbacks])

@app.route('/feedback', methods=['POST'])
def create_feedback():
    new_feedback = request.get_json()
    email = new_feedback['email']
    category = new_feedback['category']
    description = new_feedback['description']
    conn = get_db_connection()
    conn.execute('INSERT INTO feedback (email, category, description) VALUES (?, ?, ?)', (email, category, description))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Feedback recieved'}), 201

@app.route('/feedback/<int:id>', methods=['DELETE'])
def delete_feedback(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM feedback WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Feedback deleted'})

if __name__ == '__main__':
    app.run(debug=True, port=4444)
