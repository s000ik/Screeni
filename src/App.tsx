import { useState, useEffect } from 'react';
import './index.css';

interface SiteTiming {
  url: string;
  timeSpent: number;
  startTime: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [liveTimings, setLiveTimings] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadTimes = async () => {
      await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TIME' });
      const { siteTimings: storedTimings = [] } = await chrome.storage.local.get('siteTimings');
      
      // Initialize live timings from stored timings
      const initialLiveTimings = storedTimings.reduce((acc: Record<string, number>, site: SiteTiming) => {
        try {
          const hostname = new URL(site.url).hostname;
          acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
          return acc;
        } catch (err) {
          console.error('Invalid URL:', site.url);
          return acc;
        }
      }, {});
      setLiveTimings(initialLiveTimings);
    };
  
    loadTimes();

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.siteTimings) {
        const storedTimings: SiteTiming[] = changes.siteTimings.newValue;
        const updatedTimings = storedTimings.reduce((acc: Record<string, number>, site: SiteTiming) => {
          try {
            const hostname = new URL(site.url).hostname;
            acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
            return acc;
          } catch (err) {
            console.error('Invalid URL:', site.url);
            return acc;
          }
        }, {});
        setLiveTimings(updatedTimings);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Set up live timer
    const updateInterval = setInterval(async () => {
      // Get current active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab?.url) {
        const hostname = new URL(activeTab.url).hostname;
        setLiveTimings(prev => ({
          ...prev,
          [hostname]: (prev[hostname] || 0) + 1
        }));
      }
    }, 1000);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearInterval(updateInterval);
    };
  }, []);

  const totalSessionTime = Object.values(liveTimings).reduce(
    (acc, time) => acc + time,
    0
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (mins > 0 || hours > 0) timeParts.push(`${mins}m`);
    timeParts.push(`${secs}s`);
  
    return timeParts.join(' ');
  };

  const sortedTimings = Object.entries(liveTimings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="frame">
      <nav className="navbar flex items-center justify-between">
        <img
          src="/Screeni-logotype.png"
          alt="Screeni Logo"
          className="logo"
        />
        <div className="icons">
          <button
            className={`icon ${currentPage === 0 ? 'active' : ''}`}
            onClick={() => handlePageChange(0)}
            title="This Session"
          >
            <img src="/icon1.png" alt="This Session" />
          </button>
          <button
            className={`icon ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(1)}
            title="Today"
          >
            <img src="/icon2.png" alt="Today" />
          </button>
          <button className="icon" title="7-day">
            <img src="/icon3.png" alt="7-day" />
          </button>
          <button className="icon" title="Settings">
            <img src="/icon4.png" alt="Settings" />
          </button>
        </div>
      </nav>

      {currentPage === 0 ? (
        <main className="content">
          <div className="total-time">
            <span className="label">Total browsing time</span>
            <span className="value">{formatTime(totalSessionTime)}</span>
          </div>
          <hr className="divider" />
          <div className="most-viewed">
            <h2 className="section-title">Most viewed sites</h2>
            <ol className="site-list">
              {sortedTimings.map(([hostname, totalTime], index) => (
                <li key={index} className="site-item">
                  <span className="site-name">
                    {index + 1}. <span className="bold">{hostname}</span>
                  </span>
                  <span className="site-time bold">{formatTime(totalTime)}</span>
                  <div className="progress-bar-bg" />
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${(totalTime / totalSessionTime) * 100}%` 
                    }} 
                  />
                </li>
              ))}
            </ol>
          </div>
        </main>
      ) : (
        <main className="content">
          <h2 className="section-title">Detailed View</h2>
          <ol className="site-list">
            {Object.entries(liveTimings).map(([hostname, totalTime], index) => (
              <li key={index} className="site-item">
                <span className="site-name">
                  {index + 1}. <span className="bold">{hostname}</span>
                </span>
                <span className="site-time bold">{formatTime(totalTime)}</span>
                <div className="progress-bar-bg" />
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${(totalTime / totalSessionTime) * 100}%` 
                  }} 
                />
              </li>
            ))}
          </ol>
        </main>
      )}
    </div>
  );
}

export default App;