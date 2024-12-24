import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
    
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.siteTimings) {
        setSiteTimings(changes.siteTimings.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
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
    <div className="max-w-2xl mx-auto mt-8 space-y-8 p-6 bg-white shadow-lg rounded-lg">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid grid-cols-2 gap-4">
          <TabsTrigger value="today" className="p-4 text-lg font-semibold hover:bg-gray-100 rounded-md">Today</TabsTrigger>
          <TabsTrigger value="details" className="p-4 text-lg font-semibold hover:bg-gray-100 rounded-md">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Screen Time Tracker</h2>
          <p className="text-lg text-gray-600">Total Browsing Session Time: {formatTime(totalSessionTime)}</p>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <ul>
              {sortedTimings.map(([hostname, totalTime], index) => (
                <li key={index} className="py-3 flex justify-between items-center border-b last:border-none">
                  <span className="text-md text-gray-700">{hostname}</span>
                  <span className="text-sm text-gray-500">{formatTime(totalTime)}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Detailed Timings</h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <ul>
              {siteTimings.map((site, index) => (
                <li key={index} className="py-3 flex justify-between items-center border-b last:border-none">
                  <span className="text-md text-gray-700">{new URL(site.url).hostname}</span>
                  <span className="text-sm text-gray-500">{formatTime(site.timeSpent)}</span>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;