const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE = path.join(__dirname, 'database', 'privacy_policies.db');

// Open the database connection
const db = new sqlite3.Database(DATABASE, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to database.');
  }
});

// Function to update the app icon for a given appId using google-play-scraper
const updateAppIcon = async (appId) => {
  try {
    // Dynamically import google-play-scraper (ES module)
    const gplay = await import('google-play-scraper');
    const appData = await gplay.default.app({ appId });
    const iconUrl = appData.icon;
    console.log(`Fetched icon URL for ${appId}: ${iconUrl}`);

    const query = `
      INSERT INTO app_icons (app_id, icon_url)
      VALUES (?, ?)
      ON CONFLICT(app_id) DO UPDATE SET 
        icon_url = excluded.icon_url;
    `;
    db.run(query, [appId, iconUrl], function(err) {
      if (err) {
        console.error(`Error updating icon for ${appId}:`, err.message);
      } else {
        console.log(`App icon updated for ${appId}.`);
      }
    });
  } catch (error) {
    console.error(`Error fetching icon for ${appId}:`, error);
  }
};

// Function to update icons for all apps in the policies table
const updateIconsForAllApps = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT app_id FROM policies', async (err, rows) => {
      if (err) {
        return reject(err);
      }
      // Iterate over each row, calling updateAppIcon for each app_id
      for (const row of rows) {
        await updateAppIcon(row.app_id);
      }
      resolve();
    });
  });
};

// Start updating icons for all apps
updateIconsForAllApps()
  .then(() => {
    console.log('Done updating icons for all apps.');
    db.close();
  })
  .catch((error) => {
    console.error('Error updating icons for all apps:', error);
    db.close();
  });
