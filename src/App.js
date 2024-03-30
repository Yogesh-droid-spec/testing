import React, { useState } from 'react';
import { WebClient } from '@slack/web-api';

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [authedUser, setAuthedUser] = useState(null);

  const client = new WebClient();

  const handleAddSlackUser = async () => {
    setIsAuthenticating(true);

    try {
      // Replace these values with your actual Slack app credentials
      const clientId = '6869033625238.6888747023204';
      const clientSecret = '5fb7a7581363c2484f1dd5d702175697';
      const redirectUri = `${window.location.origin}/slack/oauth_redirect`;

      // Open the Slack authentication URL in a new window
      const authWindow = window.open(
        `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,users:read&user_scope=users:read&redirect_uri=${redirectUri}`,
        '_blank',
        'width=800,height=600'
      );

      // Wait for the authentication process to complete
      const { code } = await new Promise((resolve, reject) => {
        const handleMessage = (event) => {
          if (event.origin === window.location.origin && event.data && event.data.type === 'slack-auth-success') {
            resolve(event.data.payload);
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);

        // Clean up the event listener when the authentication window is closed
        authWindow.addEventListener('beforeunload', () => {
          window.removeEventListener('message', handleMessage);
          reject(new Error('Authentication process was cancelled'));
        });
      });

      // Exchange the code for an access token
      const { authedUser, accessToken: token } = await client.oauth.v2.access({
        code,
        client_id: clientId,
        client_secret: clientSecret,
      });

      setAccessToken(token);
      setAuthedUser(authedUser);
    } catch (error) {
      console.error('Error during Slack authentication:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div>
      <button onClick={handleAddSlackUser} disabled={isAuthenticating}>
        {isAuthenticating ? 'Authenticating...' : 'Add Slack User'}
      </button>
      {accessToken && authedUser && (
        <div>
          <p>Access Token: {accessToken}</p>
          <p>Authenticated User: {JSON.stringify(authedUser)}</p>
        </div>
      )}
    </div>
  );
}

export default App;