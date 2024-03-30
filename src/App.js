import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  // Function to send message to Slack user
  const sendMessage = async () => {
    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: recipientUserId,
          text: message
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.ok) {
        setResponseMessage('Message sent successfully!');
      } else {
        setResponseMessage(`Failed to send message: ${response.data.error}`);
      }
    } catch (error) {
      setResponseMessage(`An error occurred: ${error.message}`);
    }
  };

  // Function to handle Slack authentication completion
  const handleSlackAuthCompletion = async () => {
    // Retrieve access token from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Exchange authorization code for access token
    try {
      const response = await axios.post(
        'https://slack.com/api/oauth.v2.access',
        {
          client_id: '6869033625238.6888747023204',
          client_secret: '5fb7a7581363c2484f1dd5d702175697',
          code
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Set access token and user ID
      setAccessToken(response.data.authed_user.access_token);
      setRecipientUserId(response.data.authed_user.id);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
    }
  };

  return (
    <div>
      <h1>Send Message to Slack User</h1>
      <label>
        Recipient User ID:
        <input
          type="text"
          value={recipientUserId}
          onChange={(e) => setRecipientUserId(e.target.value)}
        />
      </label>
      <label>
        Access Token:
        <input
          type="text"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
        />
      </label>
      <label>
        Message:
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <button onClick={sendMessage}>Send Message</button>
      <div>{responseMessage}</div>
      <a href="https://slack.com/oauth/v2/authorize?client_id=6869033625238.6888747023204&scope=chat:write&user_scope=users:read" onClick={handleSlackAuthCompletion}>
        <button>Add Slack</button>
      </a>
    </div>
  );
}

export default App;