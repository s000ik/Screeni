import { useState, useEffect } from 'react';

function App() {
  const [siteTimings, setSiteTimings] = useState<Array<{
    url: string;
    timeSpent: number;
    startTime: number;
  }>>([]);

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

  return (
    <div className="max-w-md mx-auto mt-8 space-y-8 p-6 bg-white shadow-xl rounded-xl text-gray-800">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-purple-600">Screeni</h1>
        <p className="mt-2 text-lg text-gray-500">Your Browsing Insights</p>
      </header>

      <div className="text-center">
        <p className="text-lg font-medium text-gray-600">Total Browsing Time</p>
        <h2 className="text-3xl font-bold text-purple-600">{formatTime(totalSessionTime)}</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700">Most Viewed Sites</h3>
        <ul className="mt-4 space-y-3">
          {sortedTimings.map(([hostname, totalTime], index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm hover:bg-purple-50 transition"
            >
              <span className="text-gray-700 font-medium">{hostname}</span>
              <span className="text-sm text-gray-500">{formatTime(totalTime)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
