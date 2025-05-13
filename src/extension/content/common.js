// Detect job page, scrape details, send to backend, autofill forms
import { sendJobDetailsToBackend, logError } from '../utils/api.js';

function getJobDetails() {
  // Example: You should implement site-specific logic in content/linkedin.js, etc.
  return {
    title: document.querySelector('h1')?.innerText || '',
    company: document.querySelector('.company')?.innerText || '',
    description: document.querySelector('.description')?.innerText || '',
    location: document.querySelector('.location')?.innerText || ''
  };
}

async function autoApply() {
  try {
    const jobDetails = getJobDetails();
    const userId = await chrome.storage.local.get('userId');
    const token = await chrome.storage.local.get('authToken');
    const aiMaterials = await sendJobDetailsToBackend(jobDetails, userId, token);

    // Fill form fields (site-specific selectors)
    document.querySelector('input[name="coverLetter"]').value = aiMaterials.coverLetter;
    document.querySelector('input[name="resume"]').value = aiMaterials.tailoredResume;
    // ... handle multi-step navigation, click next/submit, etc.
  } catch (err) {
    logError(err);
    chrome.runtime.sendMessage({ type: 'SHOW_ERROR', message: err.message });
  }
}

// Listen for a message from popup to start auto-apply
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'START_AUTO_APPLY') autoApply();
});