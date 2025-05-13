import { getSession } from '../contexts/AuthContext'; // Assuming getSession is available from AuthContext

// Base URL for your backend API
// Use environment variable if available, otherwise default
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

// Define a type for the Job Application data expected from the backend
export interface JobApplication {
  _id: string; // MongoDB ObjectId as string
  userId: string;
  title: string;
  company: string;
  jobUrl?: string;
  applicationDate: string; // Date will be a string from the API, parse in frontend if needed
  status: 'Applied' | 'Interviewing' | 'Rejected' | 'Offer' | 'Other';
  success: boolean;
  details?: string;
  coverLetterContent?: string;
  resumeUrlUsed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}


/**
 * Makes an authenticated API request.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/profile').
 * @param {string} method - The HTTP method (e.g., 'GET').
 * @param {object} [body] - The request body for POST/PUT requests.
 * @returns {Promise<object>} The JSON response data.
 * @throws {Error} If the request fails or returns a non-OK status.
 */
async function authenticatedApiRequest(endpoint: string, method = 'GET', body: object | null = null): Promise<any> {
  const session = await getSession(); // Get the current Supabase session

  if (!session || !session.access_token) {
    // Redirect to login or handle unauthenticated state
    console.error('Authentication token not found. Please log in.');
    // Depending on your frontend routing, you might redirect here
    // window.location.href = '/login';
    throw new Error('Authentication token not found. Please log in.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`, // Use Supabase access token
  };

  const options: RequestInit = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      let errorData = { message: 'Unknown error' };
      try {
         errorData = await response.json();
      } catch (jsonError) {
         // If response is not JSON, use status text
         errorData.message = response.statusText;
      }
      const error = new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message}`);
      // Attach status for potential handling (e.g., redirect on 401)
      (error as any).status = response.status;
      throw error;
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
        return null;
    }

    return await response.json();

  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// --- Authentication API Calls ---
export const authApi = {
  // getProfile is now handled by the AuthContext itself after getting the session
  // If you need to manually fetch profile elsewhere, you could add it here:
  // getProfile: () => authenticatedApiRequest('/auth/profile'),
  updateProfile: (profileData: { name?: string }) => authenticatedApiRequest('/auth/profile', 'PUT', profileData),
};

// --- Job Application API Calls ---
export const jobApi = {
  getAppliedJobs: (): Promise<JobApplication[]> => authenticatedApiRequest('/jobs/applied'), // Specify return type
  // logJobApplication is now handled by the extension calling the backend directly
  // If you needed to log from the frontend dashboard, you could add it here:
  // logJobApplication: (logDetails: { title: string; company: string; success: boolean; details?: string }) =>
  //   authenticatedApiRequest('/apply/log', 'POST', logDetails),
  updateJobApplication: (id: string, updateData: { status?: string; notes?: string }) => authenticatedApiRequest(`/jobs/${id}`, 'PUT', updateData), // Add update call
  deleteJobApplication: (id: string) => authenticatedApiRequest(`/jobs/${id}`, 'DELETE'), // Add delete call
};

// --- AI/Apply API Calls ---
export const applyApi = {
  // generateApplicationMaterials is now handled by the extension calling the backend directly
  // If you needed to generate materials from the frontend, you could add it here:
  // generateApplicationMaterials: (jobDetails: { title: string; company: string; description: string }) =>
  //   authenticatedApiRequest('/apply/generate', 'POST', jobDetails),
};

// --- Admin API Calls ---
export const adminApi = {
  getAllUsers: () => authenticatedApiRequest('/admin/users'),
  getAllApplications: () => authenticatedApiRequest('/admin/applications'),
  // Add other admin-specific calls here (e.g., getUserById, deleteUser, etc.)
};

// --- Payment API Calls ---
export const paymentApi = {
  // createCheckoutSession: (priceId: string) => authenticatedApiRequest('/payment/create-checkout-session', 'POST', { priceId }),
  // Webhook is handled server-side
};


// Re-export all API groups
export const api = {
  auth: authApi,
  job: jobApi,
  apply: applyApi,
  admin: adminApi,
  payment: paymentApi,
};
