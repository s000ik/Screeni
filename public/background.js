// Store the current active tab's info
let currentTab = {
  id: null,
  url: null,
  startTime: null
};

// Function to get hostname from URL
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Function to update time spent for a URL
async function updateTimeSpent(url, timeSpent) {
  const { siteTimings = [] } = await chrome.storage.local.get('siteTimings');
  
  const newTiming = {
    url,
    timeSpent,
    startTime: Date.now()
  };
  
  siteTimings.push(newTiming);
  
  await chrome.storage.local.set({ siteTimings });
}

// Function to handle tab changes
async function handleTabChange(tabId, url) {
  const now = Date.now();

  // If there was a previous tab, update its time
  if (currentTab.id && currentTab.startTime && currentTab.url) {
    const timeSpent = Math.floor((now - currentTab.startTime) / 1000); // Convert to seconds
    await updateTimeSpent(currentTab.url, timeSpent);
  }

  // Update current tab info
  currentTab = {
    id: tabId,
    url: url,
    startTime: now
  };
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await handleTabChange(tab.id, tab.url);
  }
});

// Listen for tab URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    handleTabChange(tabId, changeInfo.url);
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTab.id === tabId) {
    handleTabChange(null, null);
  }
});

// Listen for windows focus change
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Chrome lost focus, update current tab's time
    await handleTabChange(null, null);
  } else {
    // Chrome gained focus, get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      await handleTabChange(tab.id, tab.url);
    }
  }
});

// Initialize tracking when extension loads
chrome.runtime.onStartup.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    await handleTabChange(tab.id, tab.url);
  }
});