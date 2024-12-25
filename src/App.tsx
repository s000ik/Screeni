import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings } from './settings';
import './index.css';

interface Timing {
  url: string;
  timeSpent: number;
}

interface WeeklyTiming {
  dayOfWeek: number;
  timeSpent: number;
  url: string;  // Add url to WeeklyTiming
}

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionTimings, setSessionTimings] = useState<Record<string, number>>({});
  const [dailyTimings, setDailyTimings] = useState<Record<string, number>>({});
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weeklySites, setWeeklySites] = useState<Record<string, number>>({}); // Track weekly top sites
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
        try {
          const hostname = new URL(site.url).hostname;
          acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
          return acc;
        } catch (err) {
          console.error('Invalid URL:', site.url);
          return acc;
        }
      }, {}); 
      setSessionTimings(processedSessionTimings);

      // Process daily timings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimings = dailyTimings.filter((timing: any) => timing.dayStart === today.getTime());
      const processedDailyTimings = todayTimings.reduce((acc: Record<string, number>, site: Timing) => {
        try {
          const hostname = new URL(site.url).hostname;
          acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
          return acc;
        } catch (err) {
          console.error('Invalid URL:', site.url);
          return acc;
        }
      }, {}); 
      setDailyTimings(processedDailyTimings);

      // Process weekly timings
      const weeklyStats = Array(7).fill(0);
      let totalTime = 0;
      const siteStats: Record<string, number> = {}; // Track time spent per site in a week
      weeklyTimings.forEach((timing: WeeklyTiming) => {
        weeklyStats[timing.dayOfWeek] += timing.timeSpent;
        totalTime += timing.timeSpent;
        siteStats[timing.url] = (siteStats[timing.url] || 0) + timing.timeSpent;
      });

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyChartData = weeklyStats.map((time, index) => ({
        day: daysOfWeek[index],
        time: time
      }));

      setWeeklyData(weeklyChartData);
      setLiveWeeklyTime(totalTime);
      setWeeklySites(siteStats); // Update weekly sites
    };

    fetchTimingsOnce();

    const interval = setInterval(() => {
      setLiveWeeklyTime((prevTime) => prevTime + 1);

      if (currentSite) {
        setSessionTimings((prevTimings) => {
          const updatedTimings = { ...prevTimings };
          updatedTimings[currentSite] = (updatedTimings[currentSite] || 0) + 1;
          return updatedTimings;
        });
      }

      if (currentSite) {
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
        if (tabs.length > 0) {
          const site = new URL(tabs[0].url || '').hostname;
          setCurrentSite(site);
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

  const renderTimingsList = (timings: Record<string, number>, totalTime: number) => {
    const sortedTimings = Object.entries(timings)
      .sort((a, b) => b[1] - a[1]);

    return (
      <ol className="site-list">
        {sortedTimings.map(([hostname, time], index) => (
          <li key={index} className="site-item">
            <span className="site-name">
              {index + 1}. <span className="bold">{hostname}</span>
            </span>
            <span className="site-time bold">{formatTime(time)}</span>
            <div className="progress-bar-bg" />
            <div
              className="progress-bar"
              style={{
                width: `${(time / totalTime) * 100}%`
              }}
            />
          </li>
        ))}
      </ol>
    );
  };

  const getTotalTime = (timings: Record<string, number>) => {
    return Object.values(timings).reduce((acc, time) => acc + time, 0);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 0:
        const totalSessionTime = getTotalTime(sessionTimings);
        return (
          <main className="content">
            <div className="total-time">
              <span className="label">Total browsing time</span>
              <span className="value">{formatTime(totalSessionTime)}</span>
            </div>
            <hr className="divider" />
            <div className="most-viewed">
              <h2 className="section-title">Most viewed sites</h2>
              {renderTimingsList(sessionTimings, totalSessionTime)}
            </div>
          </main>
        );

      case 1:
        const totalDailyTime = getTotalTime(dailyTimings);
        return (
          <main className="content">
            <div className="total-time">
              <span className="label">Today's browsing time</span>
              <span className="value">{formatTime(totalDailyTime)}</span>
            </div>
            <hr className="divider" />
            <div className="scrollable-content">
              <h2 className="section-title">All sites visited today</h2>
              {renderTimingsList(dailyTimings, totalDailyTime)}
            </div>
          </main>
        );

        case 2:
          const sortedWeeklySites = Object.entries(weeklySites)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Get top 5 sites
          return (
            <main className="content">
              <div className="scrollable-content">
                <div className="total-time">
                  <span className="label">Weekly browsing time</span>
                  <span className="value">{formatTime(liveWeeklyTime)}</span>
                </div>
                <div className="average-time">
                  <span className="label">Daily average</span>
                  <span className="value">{formatTime(liveWeeklyTime / 7)}</span>
                </div>
                <hr className="divider" />
                  <div className="chart-container">
                    <h2 className="section-title">Weekly overview</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatTime(value)}
                          labelStyle={{ color: '#4d4d4d' }}
                        />
                        <Bar dataKey="time" fill="#7B66FF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="top-sites">
                    <h2 className="section-title">Top viewed sites this week</h2>
                    <ol className="site-list">
                      {sortedWeeklySites.map(([site, time], index) => (
                        <li key={index} className="site-item">
                          <span className="site-name">
                            {index + 1}. <span className="bold">{site}</span>
                          </span>
                          <span className="site-time bold">{formatTime(time)}</span>
                          <div className="progress-bar-bg" />
                          <div
                            className="progress-bar"
                            style={{
                              width: `${(time / liveWeeklyTime) * 100}%`
                            }}
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
              </div>
            </main>
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
      <nav className="navbar flex items-center justify-between">
        <img
          src="/Screeni-logotype.png"
          alt="Screeni Logo"
          className="logo"
        />
        <div className="icons">
          <button
            className={`icon ${currentPage === 0 ? 'active' : ''}`}
            onClick={() => setCurrentPage(0)}
            title="This Session"
          >
            <img src="/icon1.png" alt="This Session" />
          </button>
          <button
            className={`icon ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
            title="Today"
          >
            <img src="/icon2.png" alt="Today" />
          </button>
          <button
            className={`icon ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
            title="7-day"
          >
            <img src="/icon3.png" alt="7-day" />
          </button>
          <button
            className={`icon ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
            title="Settings"
          >
            <img src="/icon4.png" alt="Settings" />
          </button>
        </div>
      </nav>
      {renderContent()}
    </div>
  );
}

export default App;
