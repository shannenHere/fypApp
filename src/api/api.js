const API_URL = 'http://10.0.2.2'; // For Android emulator; for physical device, use your computer's IP
const API_PORT = 5000;

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

// Fetch details for a specific app by its app_id
export const getAppDetails = async (appId) => {
    try {
        const response = await fetch(`${API_URL}:5000/app/${appId}`);
        if (!response.ok) {
            throw new Error('App not found');
        }
        const data = await response.json();
        console.log('Fetched app details.');
        return data;
    } catch (error) {
        console.error('Error fetching app details:', error);
        throw error;
    }
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

// ---------------------------------------------------------------------------------
// APIs for scraping (Port: 5001)
// ---------------------------------------------------------------------------------
// Fetch privacy policies
export const scrapePolicy = async (url) => {
    try {
        // Send POST request with the URL to scrape
        const response = await fetch(`${API_URL}:5001/scrapePolicy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }) // Send the URL to the server
        });

        // Handle the response
        if (response.ok) {
            return await response.json(); // Assuming the server returns the scraped data in JSON
        } else {
            console.error('Error fetching policy:', response.status);
            return { error: 'Failed to scrape policy' };
        }
    } catch (error) {
        console.error('Error during scrape policy:', error);
        return { error: 'Network error' };
    }
};

// Scrape app data & privacy policies & save to database
export const scrapeData = async (app_id) => {
    try {
        // Send POST request with the app_id to scrape data
        const response = await fetch(`${API_URL}:5001/scrape`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id }) // Send the URL to the server
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
}

