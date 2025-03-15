import sys
import sqlite3
import re
import stanza
import datetime
import time
import unicodedata
import json

app_id_to_analyze = sys.argv[1]
print(f"Starting analysis for app_id: {app_id_to_analyze}")

# ============================
# 1. Database Setup
# ============================
db_path = "../../server/database/privacy_policies.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
print("Connected to database at", db_path)

# Create the analysis_log table if it doesn't exist.
cursor.execute('''
CREATE TABLE IF NOT EXISTS analysis_log (
    app_id TEXT PRIMARY KEY,
    privacy_concern TEXT,
    sensitive_sentences TEXT,
    generic_sentences TEXT,
    worst_permissions TEXT,
    rating TEXT,  
    privacy_sentiment REAL,
    permission_sentiment REAL,
    avg_sentiment REAL,
    analyse_time TEXT
)
''')
conn.commit()
print("Table 'analysis_log' is ready.")

# Check if the app has already been analyzed in analysis_log table.
cursor.execute("SELECT COUNT(*) FROM analysis_log WHERE app_id = ?", (app_id_to_analyze,))
if cursor.fetchone()[0] > 0:
    if '--force' not in sys.argv:
        print("Analysis already exists. Use --force to re-analyze.")
        conn.close()
        sys.exit(0)

# ============================
# 2. Initialize Stanza Pipeline
# ============================
print("Initializing Stanza pipeline...")
# Load stanza once for reuse
nlp = stanza.Pipeline(lang='en', processors='tokenize, sentiment', batch_size=32, verbose=False, logging_level='ERROR')
print("Stanza pipeline loaded.")

# ============================
# 3. Helper Functions
# ============================
def normalize_text(text):
    """Normalize text by stripping spaces and converting to lowercase."""
    return unicodedata.normalize("NFKC", text).strip().lower()

def load_terms(file_path):
    """Load sensitive / generic keywords from a file (one per line)."""
    try:
        with open(file_path, "r") as f:
            keywords = [line.strip() for line in f if line.strip()]
        return keywords
    except Exception as e:
        print(f"Error loading terms from {file_path}: {e}")
        return []

def is_generic_sentence(text, generic_terms):
    """
    Detects if a sentence is generic or header-like.
    A sentence is considered generic if it is very short or if it contains any generic term 
    (unless that term is negated).
    Differentiates between "privacy" and "privacy policy" by requiring that "privacy" appears 
    as a standalone word (i.e. not immediately followed by "policy").
    """
    text = normalize_text(text).strip().lower()
    detected_terms = []
    
    # Flag very short sentences (fewer than 4 words) as generic
    if len(text.split()) < 4:
        return True, "sentence fewer than 4 words"

    for term in generic_terms:
        if not term:
            continue
        term_lower = term.lower().strip()
        # If the term is "privacy", ensure it is not immediately followed by "policy"
        if term_lower == "privacy":
            pattern = r'\bprivacy(?!\s+policy)\b'
        else:
            pattern = rf'\b{re.escape(term_lower)}\b'
        match = re.search(pattern, text)
        if match:
            negation_pattern = r'\b(not|never|no)\s+' + re.escape(term_lower)
            if re.search(negation_pattern, text):
                continue
            detected_terms.append(term_lower)

    return (bool(detected_terms), detected_terms)


def find_most_concerning_sentence(doc, sensitive_terms, generic_terms):
    """
    Identifies and ranks all concerning sentences based on sentiment scores.
    Returns a sorted list of sentences (worst first).
    """
    concerning_sentences = []
    sensitive_sentences = []
    generic_sentences = []

    # Ensure we have a list of sentences
    sentences = [doc] if isinstance(doc, stanza.models.common.doc.Sentence) else doc.sentences

    for sentence in sentences:
        sentiment_score = sentence.sentiment
        sentence_text = normalize_text(sentence.text)

        # Skip generic sentences
        is_generic, matched_generic_terms = is_generic_sentence(sentence_text, generic_terms)
        if is_generic:
            generic_sentences.append((sentence_text, matched_generic_terms, sentiment_score))
            continue

        # Adjust sentiment if the sentence contains any sensitive term
        matched_sensitive_terms = [term for term in sensitive_terms if term in sentence_text]
        if matched_sensitive_terms:  # Check if there are any matches
            sentiment_score -= 0.5  # Reduce score for sensitive terms
            sensitive_sentences.append((sentence_text, matched_sensitive_terms, sentiment_score))
            concerning_sentences.append((sentence_text, sentiment_score))
            continue

        # Only consider non-empty sentences
        if sentence_text.split():
            concerning_sentences.append((sentence_text, sentiment_score))

    # Sort sentences by sentiment score (ascending order: worst first)
    concerning_sentences.sort(key=lambda x: x[1])

    return generic_sentences, sensitive_sentences, concerning_sentences

def process_policy(policy_text, sensitive_terms, generic_terms):
    # Split policy text into chunks for processing
    chunks = [policy_text[i:i+500] for i in range(0, len(policy_text), 500)]
    
    all_sentiment_scores = []
    overall_worst_sentence = None
    overall_worst_sentiment = 2.0  # 2 is best, 0 is worst
    
    # Lists to store categorized sentences
    all_generic_sentences = []
    all_sensitive_sentences = []
    all_privacy_concern_sentences = []

    # Process each chunk
    for chunk in chunks:
        doc = nlp(chunk)
        
        # Get categorized sentences and policy sentiment scores
        generic_sentences, sensitive_sentences, concerning_sentences = find_most_concerning_sentence(doc, sensitive_terms, generic_terms)
        
        all_generic_sentences.extend(generic_sentences)
        all_sensitive_sentences.extend(sensitive_sentences)
        all_privacy_concern_sentences.extend(concerning_sentences)

        # Collect sentiment scores from each sentence in this chunk
        chunk_sentiments = [sentence.sentiment for sentence in doc.sentences]
        all_sentiment_scores.extend(chunk_sentiments)
        
        # Get the most concerning sentence from this chunk
        if concerning_sentences:
            current_worst_sentence, current_worst_sentiment = min(concerning_sentences, key=lambda x: x[1])

            # If this chunk has a worse (lower) sentiment, update overall worst
            if current_worst_sentiment < overall_worst_sentiment:
                overall_worst_sentiment = current_worst_sentiment
                overall_worst_sentence = current_worst_sentence

    # Calculate average sentiment across the entire policy
    policy_avg_sentiment = sum(all_sentiment_scores) / len(all_sentiment_scores) if all_sentiment_scores else 0

    return all_generic_sentences, all_sensitive_sentences, all_privacy_concern_sentences, policy_avg_sentiment

def extract_permission_category(permission):
    match = re.search(r'\((.*?)\)', permission)
    return match.group(1).strip() if match else "Unknown"

def process_permissions(permissions_str):
    # Define dangerous permissions with custom ranking (lower means more concerning)
    dangerous_ranking = {
        'contacts': 0.8,       
        'location': 0.1,
        'camera': 0.3,
        'microphone': 0.3,
        'photos/media/files': 0.5,
        'storage': 1.0
    }
    
    # Split the permissions string into individual permissions (assuming semicolon-separated)
    permissions = [p.strip() for p in re.split(r';\s*', permissions_str) if p.strip()]

    extracted_permissions = []
    
    for perm in permissions:
        match = re.match(r'(.+?)\s*\((.+?)\)', perm)  # Extract "take pictures and videos" & "Camera"
        if match:
            perm_name, category = match.groups()
            category = category.lower()  # Normalize category for lookup
        else:
            perm_name, category = perm, "unknown"

        extracted_permissions.append((perm_name, category))

    # Assign scores and sort
    permission_scores = [
        (category, perm, dangerous_ranking.get(category, 1.0)) 
        for perm, category in extracted_permissions
    ]
    
    sorted_permissions = sorted(permission_scores, key=lambda x: x[2])  # Sort by score (ascending)

    # Calculate average score
    avg_weight = sum(score for _, _, score in sorted_permissions) / len(sorted_permissions) if sorted_permissions else 2.0

    return sorted_permissions, avg_weight


def extract_permission_category(permission):
    import re
    match = re.search(r'\((.*?)\)', permission)
    return match.group(1).strip() if match else permission.strip()


def compute_overall_rating(privacy_rating, permission_rating):
    avg_sentiment = (privacy_rating + permission_rating) /2
    if avg_sentiment >= 0.9:
        return "good", avg_sentiment
    elif avg_sentiment >= 0.8:
        return "okay", avg_sentiment
    else:
        return "bad", avg_sentiment

# ============================
# 4. Retrieve the App from Database
# ============================
cursor.execute("SELECT app_id, policy_text, permissions FROM policies WHERE app_id = ?", (app_id_to_analyze,))
app = cursor.fetchone()

if not app:
    print(f"No app found with app_id {app_id_to_analyze}")
    conn.close()
    sys.exit(1)

app_id, policy_text, permissions_str = app
print(f"Processing app_id: {app_id}")

# ============================
# 5. Process the App
# ============================
start_time = time.time()

# Load terms
generic_terms = load_terms("genericTerms.txt")
sensitive_terms = load_terms("sensitiveTerms.txt")

# Get list of generic and sensitive sentences with their term and sentiment score, 
# privacy concerning sentences with their sentiment score,
# average privacy sentiment score
generic_sentences, sensitive_sentences, privacy_concern, policy_avg_sentiment = process_policy(policy_text, sensitive_terms, generic_terms)

# Process Permissions
permission_list, permission_avg_sentiment = process_permissions(permissions_str)

# Compute Overall Rating
overall_rating, avg_rating = compute_overall_rating(policy_avg_sentiment, permission_avg_sentiment)
analysis_time = datetime.datetime.now().isoformat()

print(f"Most Concerning Sentence: {privacy_concern[0][0]}" if privacy_concern else "No concerning sentences found.")
print(f"App Rating: {overall_rating}")
print(f"Worst Permission: {permission_list[0][0] + ", " + permission_list[0][1]}")

# ============================
# 6. Store Results in Database
# ============================

# Convert lists of tuples into lists of strings
def serialize_list(data):
    return json.dumps([str(item) for item in data])  # Convert each tuple to a string

# Convert lists to JSON strings
privacy_concern_str = serialize_list(privacy_concern)
sensitive_sentences_str = serialize_list(sensitive_sentences)
generic_sentences_str = serialize_list(generic_sentences)

permission_list_str = serialize_list(permission_list)

# Get the worst concerning sentence (plain text)
worst_concerning_sentence = privacy_concern[0][0] if privacy_concern else "No concerning sentence found"
worst_permission = permission_list[0][0] + ", " + permission_list[0][1]

cursor.execute('''
    INSERT OR REPLACE INTO analysis_log 
    (app_id, privacy_concern, sensitive_sentences, generic_sentences, worst_permissions, rating, privacy_sentiment, permission_sentiment, avg_sentiment, analyse_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', (
    app_id, 
    privacy_concern_str, 
    sensitive_sentences_str,
    generic_sentences_str,
    permission_list_str, 
    overall_rating,
    policy_avg_sentiment, 
    permission_avg_sentiment,
    avg_rating,
    analysis_time
))
conn.commit()
print("Results stored in analysis_log.")

cursor.execute('''
    UPDATE policies
    SET privacy_concern = ?,
        worst_permissions = ?,
        rating = ?
    WHERE app_id = ?
''', (
    worst_concerning_sentence,
    worst_permission,
    overall_rating,
    app_id
))
conn.commit()
print("Results stored in policy table.")

conn.close()
print("Analysis complete for app_id", app_id)
