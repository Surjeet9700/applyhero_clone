document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const statusDiv = document.getElementById('status');
  const errorDiv = document.getElementById('error');

  statusDiv.textContent = '';
  errorDiv.textContent = '';
  statusDiv.textContent = 'Logging in...';

  try {
    // Send message to background script to handle login API call and token storage
    const response = await chrome.runtime.sendMessage({
      action: 'login',
      email: email,
      password: password
    });

    if (response.success) {
      statusDiv.textContent = 'Login successful!';
      // Optionally close popup or update UI to show logged-in state
      setTimeout(() => window.close(), 1000);
    } else {
      errorDiv.textContent = response.message || 'Login failed.';
      statusDiv.textContent = '';
    }
  } catch (error) {
    console.error('Login failed:', error);
    errorDiv.textContent = 'An error occurred during login.';
    statusDiv.textContent = '';
  }
});
