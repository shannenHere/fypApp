<h1>PRIVACY RATING APP</h1>
<h3>"An App to assess Privacy of other Apps."</h3>"
Developed as part of final year project, providing alternative to reading T&Cs.
Integrates `google-play-scraper`, `Puppeteer` & `StanfordNLP` for automatic scraping and analysis.


To run locally:
git clone https://github.com/shannenHere/fypApp.git
cd fypApp
npm install
npx react-native run-android

Run server:
python server.py
node server.mjs


Full functionalities by RBAC: 
1.	Account Management
•	Create account
•	Log in / Log out
•	Forgot password
•	Change password
•	Delete account (feedback remains as from <deleted user>)

2.	All Users (No Login Required)
•	Search for any app in the database
•	View app details including:
•	Privacy policy score
•	Permission score
•	User rating
•	Filter apps by:
•	Rating
•	Permission type
•	App category

3.	Registered Users
•	Categorize installed apps by privacy rating
•	View installation status in app details
•	Leave feedback and suggestions on app scores
•	Feedback can be in update database or comments
•	Feedback can be by app or general
•	Submit updates (e.g., new privacy policy URLs, full text for re-analysis)
•	Add new apps to the database for analysis

4.	For Admin
•	Review, approve, or reject user-submitted feedback and suggestions

