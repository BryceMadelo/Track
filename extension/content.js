let spyActive = false;
let recordActive = false;
let overlayElement = null;

// Helper: generate optimal CSS selector
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.name) {
    return `[name='${element.name}']`;
  }
  let path = [];
  let current = element;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else {
      let sibling = current, nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    current = current.parentNode;
  }
  return path.join(' > ');
}

function createOverlay() {
  overlayElement = document.createElement('div');
  overlayElement.className = 'qatrack-spy-overlay';
  document.body.appendChild(overlayElement);
}

function updateOverlay(rect) {
  if (!overlayElement) return;
  overlayElement.style.top = `${rect.top + window.scrollY}px`;
  overlayElement.style.left = `${rect.left + window.scrollX}px`;
  overlayElement.style.width = `${rect.width}px`;
  overlayElement.style.height = `${rect.height}px`;
}

function handleMouseOver(e) {
  if (!spyActive) return;
  const target = e.target;
  if (target === overlayElement) return;
  
  const rect = target.getBoundingClientRect();
  updateOverlay(rect);
}

function handleClick(e) {
  if (spyActive) {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target;
    const selector = generateSelector(target);
    const tagName = target.tagName.toLowerCase();
    
    // Quick prompt for object name
    const objectName = prompt(`Captured element: <${tagName}>\nLocator: ${selector}\n\nEnter a name to save to QATrack Object Repository:`, `Obj_${tagName}_${Date.now().toString().slice(-4)}`);
    
    if (objectName) {
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'UPLOAD_OBJECT',
        payload: {
          name: objectName,
          locatorType: 'css',
          locatorValue: selector,
          description: `Captured via QATrack Spy on ${window.location.href}`
        }
      });
      alert(`Sent '${objectName}' to QATrack!`);
    }
    
    // Optionally turn off spy mode after capture
    // spyActive = false;
    // if (overlayElement) overlayElement.style.display = 'none';
  } else if (recordActive) {
    // Record step logic (mocked for now, would send to background to build script)
    const target = e.target;
    target.classList.add('qatrack-flash');
    setTimeout(() => target.classList.remove('qatrack-flash'), 400);
    
    const selector = generateSelector(target);
    console.log(`QATrack Record: Clicked element ${selector}`);
  }
}

// Initialization
chrome.storage.local.get(['spyActive', 'recordActive'], (res) => {
  spyActive = !!res.spyActive;
  recordActive = !!res.recordActive;
  
  if (spyActive && !overlayElement) createOverlay();
});

// Listeners
document.addEventListener('mouseover', handleMouseOver, true);
document.addEventListener('click', handleClick, true);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_SPY') {
    spyActive = request.active;
    if (spyActive) {
      if (!overlayElement) createOverlay();
      overlayElement.style.display = 'block';
    } else {
      if (overlayElement) overlayElement.style.display = 'none';
    }
  }
  
  if (request.type === 'TOGGLE_RECORD') {
    recordActive = request.active;
  }
});
