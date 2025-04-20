import pytest
import sqlite3
from unittest.mock import patch, MagicMock
import json
import datetime
import time
from analysis.NLPAnalysis_single import analyze_privacy_policy

# Path to the database
db_path = ".././scrapers/privacy_policies.db"

@pytest.fixture
def db_connection():
    conn = sqlite3.connect(db_path)
    yield conn
    conn.close()

def test_query_privacy_policies(db_connection):
    cursor = db_connection.cursor()
    cursor.execute("SELECT * FROM policies")
    rows = cursor.fetchall()
    
    assert len(rows) > 0, "There should be at least one privacy policy in the database"

def test_analyze_privacy_policy():
    # Here you would add logic to test any function from privacy_policies.py
    result = analyze_privacy_policy('Sample Privacy Policy Text')  # Example function
    assert result == 'Expected result'
