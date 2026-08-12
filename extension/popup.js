document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('loginSection');
  const actionSection = document.getElementById('actionSection');
  const statusMessage = document.getElementById('statusMessage');
  
  const backendUrlInput = document.getElementById('backendUrl');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const spyBtn = document.getElementById('spyBtn');
  const recordBtn = document.getElementById('recordBtn');

  // Load state
  const { qatrack_token, qatrack_url, spyActive, recordActive } = await chrome.storage.local.get(['qatrack_token', 'qatrack_url', 'spyActive', 'recordActive']);
  
  if (qatrack_url) backendUrlInput.value = qatrack_url;

  const updateUI = () => {
    if (qatrack_token) {
      loginSection.style.display = 'none';
      actionSection.style.display = 'block';
    } else {
      loginSection.style.display = 'block';
      actionSection.style.display = 'none';
    }

    if (spyActive) {
      spyBtn.classList.add('active');
      spyBtn.innerText = 'Stop Object Spy';
    } else {
      spyBtn.classList.remove('active');
      spyBtn.innerText = 'Start Object Spy';
    }

    if (recordActive) {
      recordBtn.classList.add('recording');
      recordBtn.innerText = 'Stop Recording';
    } else {
      recordBtn.classList.remove('recording');
      recordBtn.innerText = 'Start Recording';
    }
  };

  updateUI();

  loginBtn.addEventListener('click', async () => {
    const url = backendUrlInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    loginBtn.innerText = 'Connecting...';
    try {
      const res = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      
      await chrome.storage.local.set({ 
        qatrack_token: data.access_token,
        qatrack_url: url 
      });
      
      // Update local variable so UI updates immediately
      loginSection.style.display = 'none';
      actionSection.style.display = 'block';
      statusMessage.innerText = 'Connected!';
    } catch (e) {
      alert('Connection failed. Check credentials and URL.');
    } finally {
      loginBtn.innerText = 'Connect';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['qatrack_token']);
    // Reset local variable so UI updates immediately
    loginSection.style.display = 'block';
    actionSection.style.display = 'none';
    statusMessage.innerText = '';
  });

  spyBtn.addEventListener('click', async () => {
    const { spyActive } = await chrome.storage.local.get('spyActive');
    const newState = !spyActive;
    await chrome.storage.local.set({ spyActive: newState });
    
    // Inject script into active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SPY', active: newState });
    }
    
    spyBtn.classList.toggle('active', newState);
    spyBtn.innerText = newState ? 'Stop Object Spy' : 'Start Object Spy';
  });

  recordBtn.addEventListener('click', async () => {
    const { recordActive } = await chrome.storage.local.get('recordActive');
    const newState = !recordActive;
    await chrome.storage.local.set({ recordActive: newState });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RECORD', active: newState });
    }

    recordBtn.classList.toggle('recording', newState);
    recordBtn.innerText = newState ? 'Stop Recording' : 'Start Recording';
  });
});
