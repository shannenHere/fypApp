import sqlite3
import subprocess
import time

# Set the database path
db_path = "../../server/database/privacy_policies.db"

# Connect to the database and retrieve all app_ids from the "policies" table.
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT app_id FROM policies")
app_ids = [str(row[0]) for row in cursor.fetchall()]
conn.close()

print(f"Found {len(app_ids)} apps to process.")

# Loop through each app id and call the single app analysis script.
for app_id in app_ids:
    print(f"\nProcessing app_id: {app_id}")
    # Call the single script. Adjust the path to NLPAnalysis_single.py if needed.
    subprocess.run(["python", "NLPAnalysis_single.py", app_id])
    time.sleep(2)  # Add a 1-second delay between subprocess calls

