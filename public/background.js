// State Management
let currentTab = {
  id: null,
  hostname: null,
  startTime: null
};

let notifiedTabs = new Set();

// Utility Functions
function getStartOfWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  return startOfWeek.getTime();
}

function getStartOfDay() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.getTime();
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// Site Blocking Functions
async function isHostnameBlocked(hostname) {
  const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
  return blockedSites.includes(hostname);
}

async function closeTabWithDelay(tabId, delayMs = 10000) {
  notifiedTabs.add(tabId);
  
  setTimeout(async () => {
    try {
      const tab = await chrome.tabs.get(tabId).catch(() => null);
      if (tab) {
        await chrome.tabs.remove(tabId);
      }
    } catch (error) {
      console.error('Error closing tab:', error);
    } finally {
      notifiedTabs.delete(tabId);
    }
  }, delayMs);
}

async function showBlockedNotification(hostname, tabId) {
  if (notifiedTabs.has(tabId)) {
    return;
  }
  
  const cleanHostname = hostname.replace(/^www\./, '').replace(/\.com$/, '');
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: 'Site Blocked',
    message: `${cleanHostname} is blocked. It will close in 10 seconds.\n Great job maintaining your screentime habits!`
  });
}

// Time Tracking Functions
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

  const lastWeekReset = await chrome.storage.local.get('lastWeekReset');
  if (!lastWeekReset.lastWeekReset || lastWeekReset.lastWeekReset < startOfWeek) {
    await chrome.storage.local.set({
      weeklyTimings: [],
      lastWeekReset: startOfWeek
    });
  }

  const newSessionTiming = {
    hostname,
    timeSpent,
    startTime: now
  };
  sessionTimings.push(newSessionTiming);

  const newDailyTiming = {
    hostname,
    timeSpent,
    timestamp: now,
    dayStart: startOfDay
  };
  dailyTimings.push(newDailyTiming);

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

// Tab Management Functions
async function handleTabChange(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }
  
  const now = Date.now();
  const hostname = getHostname(url);
  
  if (await isHostnameBlocked(hostname)) {
    await showBlockedNotification(hostname, tabId);
    await closeTabWithDelay(tabId);
    return;
  }

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

async function handleSiteBlock(hostname, shouldBlock) {
  const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
  
  let newBlockedSites;
  if (shouldBlock && !blockedSites.includes(hostname)) {
    newBlockedSites = [...blockedSites, hostname];
  } else if (!shouldBlock) {
    newBlockedSites = blockedSites.filter(site => site !== hostname);
  } else {
    return;
  }
  
  await chrome.storage.local.set({ blockedSites: newBlockedSites });
  
  if (shouldBlock) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && getHostname(tab.url) === hostname) {
        if (!notifiedTabs.has(tab.id)) {
          await showBlockedNotification(hostname, tab.id);
          await closeTabWithDelay(tab.id);
        }
      }
    }
  }
}

// Event Listeners

// Tab Events
chrome.tabs.onRemoved.addListener((tabId) => {
  notifiedTabs.delete(tabId);
  if (currentTab.id === tabId) {
    handleTabChange(null, null);
  }
});

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

// Window Events
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

// Runtime Events
chrome.runtime.onStartup.addListener(async () => {
  notifiedTabs.clear();
  await chrome.storage.local.set({ sessionTimings: [] });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    await handleTabChange(tab.id, tab.url);
  }
});

// Message Handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_CURRENT_TIME') {
    if (currentTab.id && currentTab.startTime && currentTab.hostname) {
      const now = Date.now();
      const timeSpent = Math.floor((now - currentTab.startTime) / 1000);
      updateTimeSpent(currentTab.hostname, timeSpent).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }
  }
  
  if (request.type === 'TOGGLE_BLOCK_SITE') {
    handleSiteBlock(request.hostname, request.shouldBlock).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});