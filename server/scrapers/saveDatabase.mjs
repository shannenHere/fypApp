//5. Handle database insertion
import sqlite3 from 'sqlite3';
const dbPath = 'scrapers/privacy_policies.db';

const db = new sqlite3.Database(dbPath);


// Add sensitive app to the sensitive_apps table
export function addToSensitiveApps(appId, appName, category) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT OR IGNORE INTO sensitive_apps (app_id, app_name, category) VALUES (?, ?, ?)`,
        [appId, appName, category],
        function (err) {
          if (err) {
            console.error("Error adding to sensitive apps:", err);
            reject(err);
          } else {
            console.log(`Added to sensitive apps table: (${appName} ${category})`);
            resolve();
          }
        }
      );
    });
}

// Save privacy policy to the database
export function savePolicy({
  appId,
  appName,
  policyUrl,
  policyText,
  permissions,
  rating,
  privacyConcern,
  worstPermissions,
  category,
  userFeedback,
  dateUpdated,
  icon,
}) {
  return new Promise((resolve, reject) => {
      // Run both queries concurrently
      const policyQuery = new Promise((resolvePolicy, rejectPolicy) => {
          db.run(
              `INSERT OR REPLACE INTO policies (
                app_id, app_name, policy_url, policy_text, permissions, rating, privacy_concern, worst_permissions, category, user_feedback, date_updated
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                  appId,
                  appName,
                  policyUrl,
                  policyText,
                  permissions || "None",
                  rating || null,
                  privacyConcern || "",
                  worstPermissions || "",
                  category || "Unknown",
                  userFeedback || "",
                  dateUpdated,
              ],
              function (err) {
                  if (err) {
                      console.error(`Error saving app ${appId} to policies table:`, err);
                      rejectPolicy(err);
                  } else {
                      console.log(`Successfully saved '${appName}' (ID: ${appId}) to policies table.`);
                      resolvePolicy();
                  }
              }
          );
      });

      const iconQuery = new Promise((resolveIcon, rejectIcon) => {
          db.run(
              `INSERT OR REPLACE INTO app_icons (
                app_id, icon_url
              ) VALUES (?, ?)`,
              [
                  appId,
                  icon,
              ],
              function (err) {
                  if (err) {
                      console.error(`Error saving app ${appId} to app_icon table:`, err);
                      rejectIcon(err);
                  } else {
                      console.log(`Successfully saved '${appName}' (ID: ${appId}) to app_icon table.`);
                      console.log(`${icon}`);
                      resolveIcon();
                  }
              }
          );
      });

      // Use Promise.all to resolve once both queries are done
      Promise.all([policyQuery, iconQuery])
          .then(() => {
              resolve();
          })
          .catch((err) => {
              reject(err);
          });
  });
}

  export function markForManualReview(appId, appName, policyUrl, permissions, category, reason, status='pending') {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO manual_review (app_id, app_name, policy_url, permissions, category, reason, status, date_added)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
         ON CONFLICT(app_id) DO UPDATE SET 
           policy_url = ?,
           permissions = ?,
           category = ?,
           reason = ?,
           status = ?,
           date_added = datetime('now')`,
        [appId, appName, policyUrl, permissions, category, reason, policyUrl, permissions, category, reason, status],
        function (err) {
          if (err) {
            console.error(`Error marking app ${appId} for manual review:`, err);
            reject(err);
          } else {
            console.log(`App ${appId} marked for manual review with reason: ${reason}`);
            resolve();
          }
        }
      );
    });
  }
  
  


