import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [siteTimings, setSiteTimings] = useState<Array<{
    url: string;
    timeSpent: number;
    startTime: number;
  }>>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0 for home, 1 for detailed view

  useEffect(() => {
    const loadTimes = () => {
      chrome.storage.local.get(['siteTimings'], (result) => {
        if (result.siteTimings) {
          setSiteTimings(result.siteTimings);
        }
      });
    };

    loadTimes();
    const interval = setInterval(loadTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const aggregatedTimings = siteTimings.reduce((acc, site) => {
    const hostname = new URL(site.url).hostname;
    acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
    return acc;
  }, {} as Record<string, number>);

  const totalSessionTime = siteTimings.reduce((acc, site) => acc + site.timeSpent, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  const sortedTimings = Object.entries(aggregatedTimings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="frame">
      <nav
  className="navbar flex items-center justify-between"
  style={{ paddingLeft: '26px', paddingRight: '30px' }}
>
  <img
    src="/Screeni-logotype.png"
    alt="Screeni Logo"
    className="w-[110px] h-auto"
  />
  <div className="icons flex space-x-4">
    <button
      className={`icon ${currentPage === 0 ? 'active' : ''}`}
      onClick={() => handlePageChange(0)}
    >
      <img src="/icon1.png" alt="Home" />
    </button>
    <button
      className={`icon ${currentPage === 1 ? 'active' : ''}`}
      onClick={() => handlePageChange(1)}
    >
      <img src="/icon2.png" alt="Statistics" />
    </button>
    <button className="icon">
      <img src="/icon3.png" alt="Settings" />
    </button>
    <button className="icon">
      <img src="/icon4.png" alt="Information" />
    </button>
  </div>
</nav>

      {currentPage === 0 ? (
        <main className="content">
          <div className="total-time">
            <span className="label">Total Browsing Time</span>
            <span className="value">{formatTime(totalSessionTime)}</span>
          </div>

          <hr className="divider" />

          <div className="most-viewed">
            <h2 className="section-title">Most Viewed Sites</h2>
            <ol className="site-list">
              {sortedTimings.map(([hostname, totalTime], index) => (
                <li key={index} className="site-item">
                  <span className="site-name">{hostname}</span>
                  <span className="site-time">{formatTime(totalTime)}</span>
                </li>
              ))}
            </ol>
          </div>
        </main>
      ) : (
        <main className="content">
          <h2 className="section-title">Detailed View</h2>
          <ol className="site-list">
            {Object.entries(aggregatedTimings).map(([hostname, totalTime], index) => (
              <li key={index} className="site-item">
                <span className="site-name">{hostname}</span>
                <span className="site-time">{formatTime(totalTime)}</span>
              </li>
            ))}
          </ol>
        </main>
      )}
    </div>
  );
}

export default App;
