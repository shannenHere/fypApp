import express from 'express';
import cors from 'cors';
import { getPrivacyPolicyText } from './scrapers/privacyPolicyScraper.mjs';
import { fetchPrivacyPolicy } from './scrapers/appInfoScraper.mjs';
import gplay from 'google-play-scraper';

const app = express();
const PORT = 5001;
const HOST = '127.0.0.1';

app.use(cors());
app.use(express.json());

// API Endpoint to get app details from google-play-scraper, scrape privacy policies, and save data
app.get('/scrape', async (req, res) => {
    const { appId } = req.query;
    console.log(`Received request to scrape App ID: ${appId}`);
    
    if (!appId) {
        return res.status(400).json({ error: "App ID is required" });
    }

    try {
        await fetchPrivacyPolicy(appId);  // Call the function with the appId
        res.status(200).json({ message: `App data for app ID ${appId} fetched successfully.` });
    } catch (error) {
        console.error(`Error fetching privacy policy for app ID ${appId}:`, error);
        res.status(500).json({ error: "An error occurred while fetching the app details and privacy policy." });
    }
});

// API Endpoint to get privacy policies from a URL
app.get('/scrapePolicy', async (req, res) => {
    let { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "A URL is required" });
    }

    // Decode the encoded URL
    url = decodeURIComponent(url);
    console.log("Decoded URL:", url); // Debug log

    try {
        const policyText = await getPrivacyPolicyText(url);

        if (!policyText || policyText.length < 50) {
            return res.status(404).json({ error: "Privacy policy not found or too short." });
        }

        res.status(200).json({ message: `Privacy policy fetched successfully.`, policyText });
    } catch (error) {
        console.error(`Error fetching privacy policy for ${url}:`, error);
        res.status(500).json({ error: "An error occurred while fetching the privacy policy." });
    }
});


// Endpoint to fetch app details using appId from google-play-scraper
app.get('/getAppDetails', async (req, res) => {
    const { appId } = req.query;

    if (!appId) {
        return res.status(400).json({ error: 'App ID is required' });
    }

    try {
        // Fetch the app details using google-play-scraper
        const appDetails = await gplay.app({ appId });

        // Return the entire app details JSON
        res.status(200).json(appDetails);
    } catch (error) {
        console.error(`Error fetching app details for appId ${appId}:`, error);
        res.status(500).json({ error: 'An error occurred while fetching app details.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
