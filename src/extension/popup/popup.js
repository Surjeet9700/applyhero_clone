document.getElementById('loginBtn').addEventListener('click', async () => {
    // Implement login logic, store token in chrome.storage.local
  });
  
  document.getElementById('startBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'START_AUTO_APPLY' });
    });
  });