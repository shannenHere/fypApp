<h1>PRIVACY RATING APP</h1>
<h3>"An App to assess Privacy of other Apps."</h3>
<p>Developed as part of final year project, providing alternative to reading T&Cs.</p>
<p>Integrates `google-play-scraper`, `Puppeteer` & `StanfordNLP` for automatic scraping and analysis.</p>

</br></br>

<p>To run locally:</p>
<code>git clone https://github.com/shannenHere/fypApp.git</code></br>
<code>cd fypApp</code></br>
<code>npm install</code></br>
<code>npx react-native run-android</code></br>
</br>
<p>Run server:</p></br>
<code>python server.py</code></br>
<code>node server.mjs</code></br>
</br>
<hr>
<p>Full functionalities by RBAC: </p>
<pre>
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
</pre>
