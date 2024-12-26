import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings } from './settings';
import './index.css';
import SiteCard from './siteCard';

interface Timing {
  hostname: string;
  timeSpent: number;
}

interface WeeklyTiming {
  dayOfWeek: number;
  timeSpent: number;
  hostname: string;
}

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
        acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
        return acc;
      }, {}); 
      setSessionTimings(processedSessionTimings);

      // Process daily timings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimings = dailyTimings.filter((timing: any) => timing.dayStart === today.getTime());
      const processedDailyTimings = todayTimings.reduce((acc: Record<string, number>, site: Timing) => {
        acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
        return acc;
      }, {}); 
      setDailyTimings(processedDailyTimings);

      // Process weekly timings
      const weeklyStats = Array(7).fill(0);
      let totalTime = 0;
      const siteStats: Record<string, number> = {};
      weeklyTimings.forEach((timing: WeeklyTiming) => {
        weeklyStats[timing.dayOfWeek] += timing.timeSpent;
        totalTime += timing.timeSpent;
        siteStats[timing.hostname] = (siteStats[timing.hostname] || 0) + timing.timeSpent;
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

      if (currentSite) {
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
            setCurrentSite(hostname);
          } catch (err) {
            console.error('Invalid URL:', tabs[0].url);
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

  const renderTimingsList = (timings: Record<string, number>, totalTime: number, useIcons: boolean = false) => {
    const sortedTimings = Object.entries(timings)
      .sort((a, b) => b[1] - a[1]);
  
    return (
      <div className={`site-list ${useIcons ? 'with-icons' : ''}`}>
        {sortedTimings.map(([hostname, time], index) => (
          <SiteCard
            key={index}
            index={index}
            hostname={hostname}
            time={time}
            totalTime={totalTime}
            formatTime={formatTime}
            useIcon={useIcons}
          />
        ))}
      </div>
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
              {renderTimingsList(dailyTimings, totalDailyTime, true)}
            </div>
          </main>
        );

      case 2:
        const sortedWeeklySites = Object.entries(weeklySites)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
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
                {renderTimingsList(Object.fromEntries(sortedWeeklySites), liveWeeklyTime, true)}
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