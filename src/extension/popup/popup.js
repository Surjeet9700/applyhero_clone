// State management
let isRunning = false;
let isAuthenticated = false;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const mainContent = document.getElementById('mainContent');
const statusIndicator = document.getElementById('statusIndicator');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const activityLog = document.getElementById('activityLog');
const logoutBtn = document.getElementById('logoutBtn');
const statusDiv = document.getElementById('status');
const errorDiv = document.getElementById('error');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  updateUI();
  await updateStats();
});

// Check if user is authenticated
async function checkAuthStatus() {
  try {
    const result = await chrome.runtime.sendMessage({ action: 'getToken' });
    isAuthenticated = !!result.token;
  } catch (error) {
    console.error('Error checking auth status:', error);
    isAuthenticated = false;
  }
}

// Update UI based on state
function updateUI() {
  loginForm.style.display = isAuthenticated ? 'none' : 'block';
  mainContent.style.display = isAuthenticated ? 'flex' : 'none';
  statusIndicator.className = `h-3 w-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-300'}`;
  startBtn.style.display = isRunning ? 'none' : 'block';
  stopBtn.style.display = isRunning ? 'block' : 'none';
}

// Update statistics
async function updateStats() {
  if (!isAuthenticated) return;
  
  try {
    const stats = await chrome.runtime.sendMessage({ action: 'getStats' });
    document.getElementById('todayApps').textContent = stats.today || 0;
    document.getElementById('totalApps').textContent = stats.total || 0;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Add activity log entry
function addActivityLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `mb-1 ${type === 'error' ? 'text-red-600' : 'text-gray-600'}`;
  entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
  activityLog.insertBefore(entry, activityLog.firstChild);
}

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  statusDiv.textContent = 'Logging in...';
  errorDiv.textContent = '';
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'login',
      email,
      password
    });

    if (response.success) {
      isAuthenticated = true;
      statusDiv.textContent = 'Login successful!';
      updateUI();
      await updateStats();
    } else {
      errorDiv.textContent = response.message || 'Login failed.';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = 'An error occurred during login.';
  } finally {
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 3000);
  }
});

startBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'startAutoApply' });
    isRunning = true;
    updateUI();
    addActivityLog('Started auto-apply process');
  } catch (error) {
    addActivityLog('Failed to start auto-apply', 'error');
  }
});

stopBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'stopAutoApply' });
    isRunning = false;
    updateUI();
    addActivityLog('Stopped auto-apply process');
  } catch (error) {
    addActivityLog('Failed to stop auto-apply', 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'logout' });
    isAuthenticated = false;
    isRunning = false;
    updateUI();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'applicationStatus') {
    addActivityLog(message.message, message.success ? 'info' : 'error');
    updateStats();
  }
});