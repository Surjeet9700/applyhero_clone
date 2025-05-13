// Base URL for your backend API
const API_BASE_URL = 'https://api.myservice.com'; // <<< UPDATE THIS URL

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Need to return true to indicate that sendResponse will be called asynchronously
  if (request.action === 'login') {
    handleLogin(request.email, request.password).then(sendResponse);
    return true;
  } else if (request.action === 'getToken') {
    handleGetToken().then(sendResponse);
    return true;
  } else if (request.action === 'removeToken') {
    handleRemoveToken().then(sendResponse);
    return true;
  }
  // Add other actions here if needed
});

// Handle user login
async function handleLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Store the token securely in chrome.storage.local
      await chrome.storage.local.set({ authToken: data.token });
      console.log('Auth token stored.');
      return { success: true };
    } else {
      console.error('Login API failed:', data.message);
      return { success: false, message: data.message || 'Invalid credentials' };
    }
  } catch (error) {
    console.error('Error during login fetch:', error);
    return { success: false, message: 'Network error or server issue.' };
  }
}

// Retrieve the auth token
async function handleGetToken() {
  try {
    const result = await chrome.storage.local.get('authToken');
    return { token: result.authToken };
  } catch (error) {
    console.error('Error retrieving token:', error);
    return { token: null };
  }
}

// Remove the auth token (e.g., on logout)
async function handleRemoveToken() {
  try {
    await chrome.storage.local.remove('authToken');
    console.log('Auth token removed.');
    return { success: true };
  } catch (error) {
    console.error('Error removing token:', error);
    return { success: false, message: 'Failed to remove token.' };
  }
}

// Example of how the background script could potentially handle other messages
// For this implementation, content script will use utils/api.js directly after getting the token
// If you needed complex background processing for API calls, you'd handle them here.
