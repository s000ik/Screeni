let activeTabs = new Map();

function calculateTimeSpent(startTime) {
  return Math.floor((Date.now() - startTime) / 1000);
}

// Function to update storage with new timing
async function updateStorage(tabUrl, timeSpent, startTime) {
  const { siteTimings = [] } = await chrome.storage.local.get('siteTimings');
  const existingIndex = siteTimings.findIndex(site => site.url === tabUrl);

  if (existingIndex !== -1) {
    siteTimings[existingIndex].timeSpent += timeSpent;
    siteTimings[existingIndex].startTime = startTime;
  } else {
    siteTimings.push({ url: tabUrl, timeSpent, startTime });
  }

  await chrome.storage.local.set({ siteTimings });
}

// switching between tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const currentTime = Date.now();

  // Update time for previously active tab
  if (activeTabs.size > 0) {
    for (const [tabId, tabData] of activeTabs) {
      const timeSpent = calculateTimeSpent(tabData.startTime);
      await updateStorage(tabData.url, timeSpent, currentTime);
    }
    activeTabs.clear();
  }

  // Get new active tab info
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.startsWith('http')) {
      activeTabs.set(tab.id, {
        url: tab.url,
        startTime: currentTime
      });
    }
  } catch (error) {
    console.error('Error getting tab info:', error);
  }
});

// same tab URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && activeTabs.has(tabId)) {
    const tabData = activeTabs.get(tabId);
    const timeSpent = calculateTimeSpent(tabData.startTime);
    await updateStorage(tabData.url, timeSpent, Date.now());
    
    activeTabs.set(tabId, {
      url: changeInfo.url,
      startTime: Date.now()
    });
  }
});

// tab closing
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeTabs.has(tabId)) {
    const tabData = activeTabs.get(tabId);
    const timeSpent = calculateTimeSpent(tabData.startTime);
    await updateStorage(tabData.url, timeSpent, Date.now());
    activeTabs.delete(tabId);
  }
});

// Handle browser shutdown
chrome.runtime.onSuspend.addListener(async () => {
  for (const [tabId, tabData] of activeTabs) {
    const timeSpent = calculateTimeSpent(tabData.startTime);
    await updateStorage(tabData.url, timeSpent, Date.now());
  }
  activeTabs.clear();
});
