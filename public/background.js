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
  const notificationId = `block-notification-${tabId}`;

  const timeoutId = setTimeout(async () => {
    chrome.notifications.clear(notificationId);
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

  // Store the timeout ID so we can clear it if needed
  chrome.storage.local.set({ [`timeout_${tabId}`]: timeoutId });
}

async function showBlockedNotification(hostname, tabId) {
  if (notifiedTabs.has(tabId)) {
    return;
  }

  const cleanHostname = hostname.replace(/^www\./, '').replace(/\.com$/, '');
  const notificationId = `block-notification-${tabId}`;

  const createNotificationAndStartTimer = async () => {
    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Site Blocked',
      message: `${cleanHostname} is blocked. It will close in 10 seconds.\nGreat job maintaining your screentime habits!`,
      buttons: [
        {
          title: 'Snooze (5 minutes)'
        },
        {
          title: 'Unblock'
        }
      ],
      requireInteraction: true
    });

    // Start the 10-second timer for auto-closing
    closeTabWithDelay(tabId);
  };

  // Initial notification and timer
  await createNotificationAndStartTimer();

  // Add notification click listener
  chrome.notifications.onButtonClicked.addListener(async (clickedId, buttonIndex) => {
    if (clickedId === notificationId) {
      // Clear the existing timeout
      const { [`timeout_${tabId}`]: timeoutId } = await chrome.storage.local.get(`timeout_${tabId}`);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (buttonIndex === 0) { // Snooze button
        // Clear current notification
        await chrome.notifications.clear(notificationId);
        
        // Show new notification after delay (15 seconds for testing)
        setTimeout(async () => {
          // Create new notification and start new timer
          await createNotificationAndStartTimer();
        }, 300000); 
      } else if (buttonIndex === 1) { // Unblock button
        // Remove from blocked sites
        handleSiteBlock(hostname, false);
        notifiedTabs.delete(tabId);
        await chrome.notifications.clear(notificationId);
      }
    }
  });
}

// Time Tracking Functions
async function updateTimeSpent(hostname, timeSpent, timestamp) {
  const { sessionTimings = [], dailyTimings = [], weeklyTimings = [] } = await chrome.storage.local.get([
    'sessionTimings',
    'dailyTimings',
    'weeklyTimings',
    'lastWeekReset'
  ]);

  const startOfWeek = getStartOfWeek();
  const startOfDay = getStartOfDay();

  // Session timings
  const newSessionTiming = {
    hostname,
    timeSpent,
    startTime: timestamp
  };
  sessionTimings.push(newSessionTiming);

  // Daily timings
  const dayStart = new Date(timestamp);
  dayStart.setHours(0, 0, 0, 0);
  const newDailyTiming = {
    hostname,
    timeSpent,
    timestamp,
    dayStart: dayStart.getTime()
  };
  dailyTimings.push(newDailyTiming);

  // Weekly timings
  const newWeeklyTiming = {
    hostname,
    timeSpent,
    timestamp,
    weekStart: startOfWeek,
    dayOfWeek: new Date(timestamp).getDay()
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

  const now = new Date();
  const hostname = getHostname(url);

  if (await isHostnameBlocked(hostname)) {
    await showBlockedNotification(hostname, tabId);
    return;
  }

  if (currentTab.id && currentTab.startTime && currentTab.hostname) {
    const previousTabTime = new Date(currentTab.startTime);
    const elapsedTime = Math.floor((now - previousTabTime) / 1000);

    if (previousTabTime.getDate() !== now.getDate()) {
      // Split time between the previous day and the new day
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);

      const timeBeforeMidnight = Math.floor((midnight - previousTabTime) / 1000);
      const timeAfterMidnight = elapsedTime - timeBeforeMidnight;

      // Update time for the previous day
      await updateTimeSpent(currentTab.hostname, timeBeforeMidnight, previousTabTime);

      // Update time for the new day
      await updateTimeSpent(currentTab.hostname, timeAfterMidnight, midnight);
    } else {
      // Same day, record time normally
      await updateTimeSpent(currentTab.hostname, elapsedTime, previousTabTime);
    }
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