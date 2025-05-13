export async function sendJobDetailsToBackend(jobDetails, userId, token) {
    const response = await fetch('https://your-backend.com/api/ai/generate-materials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...jobDetails, userId })
    });
    if (!response.ok) throw new Error('Failed to get AI materials');
    return response.json();
  }
  
  export function logError(error) {
    // Optionally send to Sentry or your backend
    console.error(error);
  }