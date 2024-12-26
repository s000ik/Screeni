// Store the current active tab's info
let currentTab = {
  id: null,
  hostname: null,
  startTime: null
};

function getStartOfWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
  return startOfWeek.getTime();
}

function getStartOfDay() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.getTime();
}

// Function to get hostname from URL
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Function to update time spent for a hostname
async function updateTimeSpent(hostname, timeSpent) {
  const { sessionTimings = [], dailyTimings = [], weeklyTimings = [] } = await chrome.storage.local.get([
    'sessionTimings',
    'dailyTimings',
    'weeklyTimings',
    'lastWeekReset'
  ]);

  const now = Date.now();
  const startOfWeek = getStartOfWeek();
  const startOfDay = getStartOfDay();

  // Check if we need to reset weekly data
  const lastWeekReset = await chrome.storage.local.get('lastWeekReset');
  if (!lastWeekReset.lastWeekReset || lastWeekReset.lastWeekReset < startOfWeek) {
    await chrome.storage.local.set({
      weeklyTimings: [],
      lastWeekReset: startOfWeek
    });
  }

  // Update session timings
  const newSessionTiming = {
    hostname,
    timeSpent,
    startTime: now
  };
  sessionTimings.push(newSessionTiming);

  // Update daily timings
  const newDailyTiming = {
    hostname,
    timeSpent,
    timestamp: now,
    dayStart: startOfDay
  };
  dailyTimings.push(newDailyTiming);

  // Update weekly timings
  const newWeeklyTiming = {
    hostname,
    timeSpent,
    timestamp: now,
    weekStart: startOfWeek,
    dayOfWeek: new Date(now).getDay()
  };
  weeklyTimings.push(newWeeklyTiming);

  await chrome.storage.local.set({
    sessionTimings,
    dailyTimings,
    weeklyTimings
  });
}

async function handleTabChange(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  const now = Date.now();
  const hostname = getHostname(url);

  if (currentTab.id && currentTab.startTime && currentTab.hostname) {
    const timeSpent = Math.floor((now - currentTab.startTime) / 1000);
    await updateTimeSpent(currentTab.hostname, timeSpent);
  }

  currentTab = {
    id: tabId,
    hostname: hostname,
    startTime: now
  };
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await handleTabChange(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    handleTabChange(tabId, changeInfo.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (currentTab.id === tabId) {
    handleTabChange(null, null);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await handleTabChange(null, null);
  } else {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      await handleTabChange(tab.id, tab.url);
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.local.set({ sessionTimings: [] });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    await handleTabChange(tab.id, tab.url);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_TIME') {
    if (currentTab.id && currentTab.startTime && currentTab.hostname) {
      const now = Date.now();
      const timeSpent = Math.floor((now - currentTab.startTime) / 1000);
      // Wait for the update to complete before responding
      updateTimeSpent(currentTab.hostname, timeSpent).then(() => {
        sendResponse({ success: true });
      });
      return true; // Indicate async response
    }
  }
});