// Base URL for your backend API
const API_BASE_URL = 'https://api.myservice.com'; // <<< UPDATE THIS URL

/**
 * Fetches the authentication token from chrome.storage.local.
 * @returns {Promise<string|null>} The auth token or null if not found.
 */
async function getAuthToken() {
  try {
    const result = await chrome.storage.local.get('authToken');
    return result.authToken || null;
  } catch (error) {
    console.error('Error getting auth token from storage:', error);
    return null;
  }
}

/**
 * Makes an authenticated API request.
 * @param {string} endpoint - The API endpoint (e.g., '/apply/generate').
 * @param {string} method - The HTTP method (e.g., 'POST').
 * @param {object} [body] - The request body for POST/PUT requests.
 * @returns {Promise<object>} The JSON response data.
 * @throws {Error} If the request fails or returns a non-OK status.
 */
async function authenticatedApiRequest(endpoint, method = 'GET', body = null) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const options = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Export specific API functions
export const api = {
  /**
   * Calls the backend to generate cover letter and resume URL.
   * @param {object} jobDetails - { title, company, description }
   * @returns {Promise<{ coverLetter: string, resumeUrl: string }>}
   */
  generateApplicationMaterials: (jobDetails) => {
    return authenticatedApiRequest('/apply/generate', 'POST', jobDetails);
  },

  /**
   * Logs the application attempt.
   * @param {object} logDetails - { title, company, success: boolean, details?: string }
   * @returns {Promise<object>} The response from the log endpoint.
   */
  logApplication: (logDetails) => {
    return authenticatedApiRequest('/apply/log', 'POST', logDetails);
  },

  // Add other API functions here as needed
};
