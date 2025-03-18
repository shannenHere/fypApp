const API_URL = 'http://10.0.2.2'; // For Android emulator; for physical device, use your computer's IP

// Fetch all app IDs from the policies table
export const getAppIds = async () => {
    try {
        const response = await fetch(`${API_URL}:5000/apps`);
        if (!response.ok) {
            throw new Error('Failed to fetch app IDs');
        }
        const data = await response.json();
        console.log('Fetched app IDs:', data);
        return data;
    } catch (error) {
        console.error('Error fetching app IDs:', error);
        throw error;
    }
};

// Fetch details for a specific app by its app_id, retrying indefinitely on failure
export const getAppDetails = async (appId) => {
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}:5000/app/${appId}`);
            if (!response.ok) {
                throw new Error('App not found');
            }
            const data = await response.json();
            console.log('Fetched app details.');
            return data;
        } catch (error) {
            console.log('Error fetching app details, retrying...');
            return fetchData(); // Retry the fetch indefinitely
        }
    };

    return fetchData(); // Start the fetch process
};

// Register User
export const registerUser = async (email, password, isAdmin = 0) => {
    try {
        const response = await fetch(`${API_URL}:5000/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, is_admin: isAdmin })
        });

        return await response.json();
    } catch (error) {
        console.error('Error during registration:', error);
        return { error: 'Network error' };
    }
};

// Login User
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}:5000/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        return await response.json();
    } catch (error) {
        console.error('Error during login:', error);
        return { error: 'Network error' };
    }
};

// Check if email exists in database
export const checkEmail = async (email) => {
    try {
      const response = await fetch(`${API_URL}:5000/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking email:', error);
      return { error: 'Network error' };
    }
  };

// Forgot Password: update the user's password and send the new password via email
export const forgotPassword = async (email, newPassword) => {
    try {
      const response = await fetch(`${API_URL}:5000/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      return await response.json();
    } catch (error) {
      console.error('Error during forgot password:', error);
      return { error: 'Network error' };
    }
  };

// Analyze policy & permissions & update in database
export const analyze = async (app_id) => {
    try {
        // Send POST request with the app_id to scrape data
        const response = await fetch(`${API_URL}:5000/nlp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id }) // Send the URL to the server
        });

        // Handle the response
        if (response.ok) {
            return await response.json(); // Assuming the server returns the scraped data in JSON
        } else {
            console.error('Error analyzing policy & permissions:', response.status);
            return { error: 'Failed to analyze policy & permissions' };
        }
    } catch (error) {
        console.error('Error during analyzing policy & permissions:', error);
        return { error: 'Network error' };
    }
}

// Update a specific column for an app in the database
export const updateAppColumn = async (app_id, column_name, new_value) => {
    try {
        const response = await fetch(`${API_URL}:5000/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id, column_name, new_value })
        });

        if (!response.ok) {
            throw new Error('Failed to update column');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating app column:', error);
        return { error: 'Network error' };
    }
};

export const submitFeedback = async (appId, userId, reason, status, type) => {
    try {
        const date = new Date().toISOString();
        console.log("Sending feedback:", { appId, userId, reason, status, date, type });

        const response = await fetch(`${API_URL}:5000/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id: appId, user_id: userId, reason, status, date, type })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText); // Log the response error body
            throw new Error('Failed to submit feedback');
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { error: error.message || 'Network error' };
    }
};

export const getFeedback = async (appId) => {
    try {
        const response = await fetch(`${API_URL}:5000/getFeedback?app_id=${appId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch feedback');
        }
        const data = await response.json();
        console.log('Fetched feedback:', data);
        return data;
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return { error: 'Network error' };
    }
};

// ---------------------------------------------------------------------------------
// APIs for scraping (Port: 5001)
// ---------------------------------------------------------------------------------
// Fetch privacy policies
export const scrapePolicy = async (url) => {
    try {
        // Send GET request with the URL as a query parameter
        const response = await fetch(`${API_URL}:5001/scrapePolicy?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            return data.policy_text || ""; // Extract only the text or return empty string if missing
        } else {
            console.error('Error fetching policy:', response.status);
            return "";
        }
    } catch (error) {
        console.error('Error during scrape policy:', error);
        return "";
    }
};

// Scrape app data & privacy policies & save to database
export const scrapeData = async (app_id) => {
    try {
        // Send GET request with the app_id as a query parameter
        const response = await fetch(`${API_URL}:5001/scrape?app_id=${encodeURIComponent(app_id)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        // Handle the response
        if (response.ok) {
            return { message: 'App data and privacy policy scraped successfully and saved to the database.' };
        } else {
            console.error('Error fetching app data:', response.status);
            return { error: 'Failed to scrape data' };
        }
    } catch (error) {
        console.error('Error during scraping app data:', error);
        return { error: 'Network error' };
    }
};


