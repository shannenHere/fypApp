const API_URL = 'http://10.0.2.2'; // For Android emulator; for physical device, use your computer's IP
const API_PORT = 5000;

// Fetch all app IDs from the policies table
export const getAppIds = async () => {
    try {
        const response = await fetch(`${API_URL}:${API_PORT}/apps`);
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
        const response = await fetch(`${API_URL}:${API_PORT}/app/${appId}`);
        if (!response.ok) {
            throw new Error('App not found');
        }
        const data = await response.json();
        console.log('Fetched app details:', data);
        return data;
    } catch (error) {
        console.error('Error fetching app details:', error);
        throw error;
    }
};
