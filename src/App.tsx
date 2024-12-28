import { useState, useEffect } from 'react';
import { ThisSession } from '@/pages/this_session/this_session';
import { ThisDay } from '@/pages/this_day/this_day';
import { ThisWeek } from '@/pages/this_week/this_week';
import { Settings } from '@/pages/settings/settings';
import Navbar from '@/components/navbar/navbar';
import './index.css';

interface Timing {
  hostname: string;
  timeSpent: number;
}

interface WeeklyTiming {
  dayOfWeek: number;
  timeSpent: number;
  hostname: string;
}

const isValidHostname = (hostname: string): boolean => {
  if (!hostname) return false;
  const invalidPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'chrome-search://'
  ];
  const invalidExactMatches = [
    '',
    'newtab',
    'extensions'
  ];

  if (invalidPrefixes.some(prefix => hostname.startsWith(prefix))) return false;
  if (invalidExactMatches.includes(hostname)) return false;
  return true;
  
};

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionTimings, setSessionTimings] = useState<Record<string, number>>({});
  const [dailyTimings, setDailyTimings] = useState<Record<string, number>>({});
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weeklySites, setWeeklySites] = useState<Record<string, number>>({});
  const [liveWeeklyTime, setLiveWeeklyTime] = useState(0);  
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  useEffect(() => {
    const fetchTimingsOnce = async () => {
      await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'GET_CURRENT_TIME' }, resolve);
      });
      
      const { sessionTimings = [], dailyTimings = [], weeklyTimings = [] } = await chrome.storage.local.get([
        'sessionTimings',
        'dailyTimings',
        'weeklyTimings'
      ]);

      // Process session timings
      const processedSessionTimings = sessionTimings.reduce((acc: Record<string, number>, site: Timing) => {
        if (isValidHostname(site.hostname)) {
          acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
        }
        return acc;
      }, {}); 
      setSessionTimings(processedSessionTimings);

      // Process daily timings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimings = dailyTimings.filter((timing: any) => timing.dayStart === today.getTime());
      const processedDailyTimings = todayTimings.reduce((acc: Record<string, number>, site: Timing) => {
        if (isValidHostname(site.hostname)) {
          acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
        }
        return acc;
      }, {}); 
      setDailyTimings(processedDailyTimings);

      // Process weekly timings
      const weeklyStats = Array(7).fill(0);
      let totalTime = 0;
      const siteStats: Record<string, number> = {};
      weeklyTimings.forEach((timing: WeeklyTiming) => {
        if (isValidHostname(timing.hostname)) {
          weeklyStats[timing.dayOfWeek] += timing.timeSpent;
          totalTime += timing.timeSpent;
          siteStats[timing.hostname] = (siteStats[timing.hostname] || 0) + timing.timeSpent;
        }
      });

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyChartData = weeklyStats.map((time, index) => ({
        day: daysOfWeek[index],
        time: time
      }));

      setWeeklyData(weeklyChartData);
      setLiveWeeklyTime(totalTime);
      setWeeklySites(siteStats);
    };

    fetchTimingsOnce();

    const interval = setInterval(() => {
      setLiveWeeklyTime((prevTime) => prevTime + 1);

      if (currentSite && isValidHostname(currentSite)) {
        setSessionTimings((prevTimings) => {
          const updatedTimings = { ...prevTimings };
          updatedTimings[currentSite] = (updatedTimings[currentSite] || 0) + 1;
          return updatedTimings;
        });

        setDailyTimings((prevTimings) => {
          const updatedTimings = { ...prevTimings };
          updatedTimings[currentSite] = (updatedTimings[currentSite] || 0) + 1;
          return updatedTimings;
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentSite]);

  useEffect(() => {
    const handleLocationChange = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
          try {
            const hostname = new URL(tabs[0].url).hostname;
            if (isValidHostname(hostname)) {
              setCurrentSite(hostname);
            } else {
              setCurrentSite(null);
            }
          } catch (err) {
            console.error('Invalid URL:', tabs[0].url);
            setCurrentSite(null);
          }
        }
      });
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleClearData = async () => {
    await chrome.storage.local.clear();
    setSessionTimings({});
    setDailyTimings({});
    setWeeklyData([]);
    setWeeklySites({});
    setLiveWeeklyTime(0);
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (mins > 0 || hours > 0) timeParts.push(`${mins}m`);
    timeParts.push(`${secs}s`);

    return timeParts.join(' ');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 0:
        return (
          <ThisSession 
            sessionTimings={sessionTimings}
            formatTime={formatTime}
          />
        );
      case 1:
        return (
          <ThisDay
            dailyTimings={dailyTimings}
            formatTime={formatTime} 
          />
        );
      case 2:
        return (
          <ThisWeek
            weeklyData={weeklyData}
            weeklySites={weeklySites}
            liveWeeklyTime={liveWeeklyTime}
            formatTime={formatTime}
          />
        );
      case 3:
        return (
          <div className="scrollable-content">
            <Settings
              theme={theme}
              onThemeChange={handleThemeChange}
              onClearData={handleClearData}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="frame">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderContent()}
    </div>
  );
}

export default App;