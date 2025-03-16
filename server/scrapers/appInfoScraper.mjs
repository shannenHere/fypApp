//4. Handles missing policies, duplicates, sensitive categories
import gplay from 'google-play-scraper';
import sqlite3 from 'sqlite3';
import { getPrivacyPolicyText } from './privacyPolicyScraper.mjs';
import { savePolicy, addToSensitiveApps, markForManualReview } from './saveDatabase.mjs';

const dbPath = 'scrapers/privacy_policies.db';
const db = new sqlite3.Database(dbPath);


// Check if app already exists in the database
export function checkIfAppExists(appId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT app_id FROM policies WHERE app_id = ?", [appId], (err, row) => {
            if (err) {
                console.error(`Database error while checking app ${appId}:`, err);
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

// Check if app is in manual_review table
export function checkIfInManualReview(appId){
    return new Promise((resolve, reject) => {
        db.get("SELECT app_id, status FROM manual_review WHERE app_id = ?", [appId], (err, row) => {
            if (err) {
                console.error(`Database error while checking app in manual_review ${appId}:`, err);
                reject(err);
            } else {
                resolve(row);
            }
        })
    })
}

// Check if app is in sensitive_apps table
export function checkIfSensitiveAppExists(appId) {
    return new Promise((resolve, reject) => {
        db.get("SELECT app_id FROM sensitive_apps WHERE app_id = ?", [appId], (err, row) => {
            if (err) {
                console.error(`Database error while checking sensitive app ${appId}:`, err);
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

// Function to get app details
async function getAppDetails(appId) {
    try {
        const appDetails = await gplay.app({ appId });

        //If no privacy policy url is found, mark for manual review
        if (!appDetails.privacyPolicy) {
            console.warn(`No privacy policy found for '${appDetails.title}'. Marking for manual review.`);
            await markForManualReview(appId, appDetails.title, null, 
                Array.isArray(appDetails.permissions)
                ? appDetails.permissions.map(p => `${p.permission} (${p.type || "Unknown"})`).join("; ")
                : "None",
                appDetails.genre,
                "No policy Url available");
            return null;
        }

        // Process permissions from appDetails; if missing, use fallback
        let permissions;
        if (Array.isArray(appDetails.permissions) && appDetails.permissions.length > 0) {
            appDetails.permissions.map(p => `${p.permission} (${p.type || "Unknown"})`).join("; ");
        } else {
            // Fallback to using gplay.permissions() to fetch permissions explicitly
            try {
                const permissionsData = await gplay.permissions({ appId });
                permissions =
                Array.isArray(permissionsData) && permissionsData.length > 0
                    ? permissionsData.map(p => `${p.permission} (${p.type || "Unknown"})`).join("; ")
                    : "None";
            } catch (e) {
                console.error(`Error fetching app details for ${appId}:`, e);
                permissions = "None";
            }
        }

        return {
            appId,
            appName: appDetails.title,
            policyUrl: appDetails.privacyPolicy,
            category: appDetails.genre,
            iconUrl: appDetails.icon,
            permissions,
        };
    } catch (error) {
        console.error(`Error fetching app details for ${appId}:`, error);
        return null;
    }
}

// Check if the app category is sensitive
const sensitiveCategories = new Set(["Finance", "Medical"]);
export function checkIfSensitiveCategory(category) {
    return sensitiveCategories.has(category);
}

// Main function: Process and save privacy policy or mark for manual review if necessary
export async function fetchPrivacyPolicy(appId) {
    try {
        console.log(`Fetching privacy policy for App ID: ${appId}...`);

        // Check if app already exists in database
        const appExists = await checkIfAppExists(appId);
        if (appExists) {
            console.warn(`App ${appId} is already in the database. Skipping.`);
            return;
        }

        // Check if app is in manual_review table
        const manualReviewRecord = await checkIfInManualReview(appId);
        if (manualReviewRecord) {
        if (manualReviewRecord.status !== "pending") {
            console.info(`App ${appId} is already in manual review with status '${manualReviewRecord.status}'. Skipping.`);
            return;
        } else {
            console.info(`App ${appId} is in manual review with status 'pending'. Re-processing...`);
        }
        }

        // Get app details (app name, policy URL, category, permissions)
        const appData = await getAppDetails(appId);
        if (!appData) {
            console.error(`No app details found for ${appId}. Marking for manual review`);
            await markForManualReview(appId, "Unknown", null, "None", "No app details found");
            return;
        }

        const { appName, policyUrl, category, permissions, iconUrl } = appData;

        // Check if app belongs to a sensitive category
        if (checkIfSensitiveCategory(category)) {
            console.info(`App '${appName}' belongs to a sensitive category (${category}).`);
            const alreadySensitive = await checkIfSensitiveAppExists(appId);
            if (alreadySensitive) {
                console.info(`App '${appName}' is already in the sensitive database. Skipping.`);
            } else {
                console.info(`Adding '${appName}' (${appId}) to the sensitive database.`);
                await addToSensitiveApps(appId, appName, category);
            }
            return;
        }

        // Get privacy policy text
        const policyText = await getPrivacyPolicyText(policyUrl);
        if (!policyText || policyText.length < 50) {
            console.warn(`Failed to extract meaningful privacy policy text from ${policyUrl}. Marking for manual review.`);
            // If the app is pending in manual review, update the record to reviewed with reason "Extraction failed twice"
            if (manualReviewRecord && manualReviewRecord.status === "pending") {
                console.info(`Updating manual review for app ${appId} to 'reviewed'`);
                await markForManualReview(appId, appName, policyUrl, permissions, category, "Extraction failed twice", "reviewed");
            } else {
                await markForManualReview(appId, appName, policyUrl, permissions, category, "Extraction failed", "pending");
            }
        return;
        }

        // Save to database
        await savePolicy({
            appId,
            appName,
            policyUrl,
            policyText,
            permissions,
            rating: null,
            privacyConcern: "",
            worstPermissions: "",
            category,
            userFeedback: "",
            dateUpdated: new Date().toISOString(),
            iconUrl,
        });

        console.info(`Successfully saved privacy policy for '${appName}' (${appId}).`);

    } catch (error) {
        console.error(`Error processing app ${appId}:`, error);
    }
}

// Run the function with an app ID from user input
/*const appId = process.argv[2]; // Get App ID from command line argument
if (!appId) {
    console.log("Usage: node privacyScraper.js <app_id>");
    process.exit(1);
}
fetchPrivacyPolicy(appId);
*/
