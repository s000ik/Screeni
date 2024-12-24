let currentTab = {
    url: '',
    startTime: Date.now()
  };
  
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      updateTimeForPreviousTab();
      currentTab = {
        url: tab.url,
        startTime: Date.now()
      };
    }
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      updateTimeForPreviousTab();
      currentTab = {
        url: changeInfo.url,
        startTime: Date.now()
      };
    }
  });
  
  function updateTimeForPreviousTab() {
    if (!currentTab.url) return;
  
    chrome.storage.local.get(['siteTimings'], (result) => {
      const siteTimings = result.siteTimings || [];
      const timeSpent = Math.floor((Date.now() - currentTab.startTime) / 1000);
  
      const existingSite = siteTimings.find(site => site.url === currentTab.url);
      const newTimings = existingSite 
        ? siteTimings.map(site => 
            site.url === currentTab.url 
              ? { ...site, timeSpent: site.timeSpent + timeSpent }
              : site
          )
        : [...siteTimings, {
            url: currentTab.url,
            timeSpent: timeSpent,
            startTime: Date.now()
          }];
  
      chrome.storage.local.set({ siteTimings: newTimings });
      currentTab.startTime = Date.now();
    });
  }
  
  setInterval(() => {
    updateTimeForPreviousTab();
  }, 1000);