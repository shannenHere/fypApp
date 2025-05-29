<h1>PRIVACY RATING APP</h1>
<h3>"An App to assess Privacy of other Apps."</h3>
<p>Developed as part of final year project, providing alternative to reading T&Cs.</p>
<p>Integrates `google-play-scraper`, `Puppeteer` & `StanfordNLP` for automatic scraping and analysis.</p>

</br>
</hr>

<p>To run locally:</p>
<code>git clone https://github.com/shannenHere/fypApp.git</code></br>
<code>cd fypApp</code></br>
<code>npm install</code></br>
<code>npx react-native run-android</code></br>
</br>
<p>Run server:</p>
<code>cd server</code></br>
<code>python server.py</code></br>
<code>node server.mjs</code></br>
</br>

<hr>
<p>Full functionalities by RBAC: </p>
<ol>
  <li>Account Management
    <ul>
      <li>Create account</li>
      <li>Log in / Log out</li>
      <li>Forgot password</li>
      <li>Change password</li>
      <li>Delete account (feedback remains as from <deleted user>)</li>
    </ul>
  </li>
  <li>All Users (No Login Required)
    <ul>
      <li>Search for any app in the database </li>
      <li>View app details including:
        <ul>
          <li>Privacy policy score</li>
          <li>Permission score</li>
          <li>User rating</li>
        </ul>
      </li>
      <li>Filter apps by:</li>
        <ul>
          <li>Rating</li>
          <li>Permission type</li>
          <li>App category</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>Registered Users  
    <ul>
      <li>Categorize installed apps by privacy rating</li>
      <li>View installation status in app details</li>
      <li>Leave feedback and suggestions on app scores
        <ul>
          <li>Feeback can be in update database of comments</li>
          <li>Feedback can be by app or general</li>
        </ul>
      </li>
      <li>Submit updates (e.g., new privacy policy URLs, full text for re-analysis)</li>
      <li>Add new apps to the database for analysis</li>
    </ul>
  </li>
  <li>For Admin
    <ul>
      <li>Review, approve, or reject user-submitted feedback and suggestions</li>
    </ul>
  </li>
</ol>

