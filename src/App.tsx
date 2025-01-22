import { useState, useEffect } from "react";
import { ThisSession } from "@/pages/this_session/this_session";
import { ThisDay } from "@/pages/this_day/this_day";
import { ThisWeek } from "@/pages/this_week/this_week";
import { Settings } from "@/pages/settings/settings";
import Navbar from "@/components/navbar/navbar";
import "./index.css";

interface Timing {
  hostname: string;
  timeSpent: number;
}

interface WeeklyTiming {
  dayOfWeek: number;
  timeSpent: number;
  hostname: string;
}

interface WeeklyChartData {
  day: string;
  time: number;
}

interface TimingData {
  dayStart: number;
  hostname: string;
  timeSpent: number;
}


const isValidHostname = (hostname: string): boolean => {
  if (!hostname) return false;
  const invalidPrefixes = [
    "chrome://",
    "chrome-extension://",
    "edge://",
    "about:",
    "chrome-search://",
  ];
  const invalidExactMatches = ["", "newtab", "extensions"];

  if (invalidPrefixes.some((prefix) => hostname.startsWith(prefix)))
    return false;
  if (invalidExactMatches.includes(hostname)) return false;
  return true;
};

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionTimings, setSessionTimings] = useState<Record<string, number>>({});
  const [dailyTimings, setDailyTimings] = useState<Record<string, number>>({});
  const [weeklyData, setWeeklyData] = useState<WeeklyChartData[]>([]);
  const [weeklySites, setWeeklySites] = useState<Record<string, number>>({});
  const [liveWeeklyTime, setLiveWeeklyTime] = useState(0);
  const [currentSite, setCurrentSite] = useState<string | null>(null);
  const [theme, setTheme] = useState<"system" | "light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "system" | "light" | "dark") || "system";
  });

  // Handle theme changes
  const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      document.documentElement.setAttribute("data-theme", systemTheme);
    } else {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    };

    // Initial theme setup
    if (theme === "system") {
      document.documentElement.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  useEffect(() => {
    const fetchTimingsOnce = async () => {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "GET_CURRENT_TIME" }, resolve);
      });

      const {
        sessionTimings = [],
        dailyTimings = [],
        weeklyTimings = [],
      } = await chrome.storage.local.get([
        "sessionTimings",
        "dailyTimings",
        "weeklyTimings",
      ]);

      // Process session timings
      const processedSessionTimings = sessionTimings.reduce(
        (acc: Record<string, number>, site: Timing) => {
          if (isValidHostname(site.hostname)) {
            acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
          }
          return acc;
        },
        {}
      );
      setSessionTimings(processedSessionTimings);

      // Process daily timings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimings = dailyTimings.filter(
        (timing: TimingData) => timing.dayStart === today.getTime()
      );
      const processedDailyTimings = todayTimings.reduce(
        (acc: Record<string, number>, site: Timing) => {
          if (isValidHostname(site.hostname)) {
            acc[site.hostname] = (acc[site.hostname] || 0) + site.timeSpent;
          }
          return acc;
        },
        {}
      );
      setDailyTimings(processedDailyTimings);

      // Process weekly timings
      const weeklyStats = Array(7).fill(0);
      let totalTime = 0;
      const siteStats: Record<string, number> = {};
      weeklyTimings.forEach((timing: WeeklyTiming) => {
        if (isValidHostname(timing.hostname)) {
          // Convert Sunday (0) to 6, and other days subtract 1
          const adjustedDay = timing.dayOfWeek === 0 ? 6 : timing.dayOfWeek - 1;
          weeklyStats[adjustedDay] += timing.timeSpent;
          totalTime += timing.timeSpent;
          siteStats[timing.hostname] =
            (siteStats[timing.hostname] || 0) + timing.timeSpent;
        }
      });
      
      // Change days array to start with Monday
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weeklyChartData = weeklyStats.map((time, index) => ({
        day: daysOfWeek[index],
        time: time,
      }));

      setWeeklyData(weeklyChartData);
      setLiveWeeklyTime(totalTime);
      setWeeklySites(siteStats);
    };

    fetchTimingsOnce();

    const interval = setInterval(() => {
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

        setLiveWeeklyTime((prevTime) => prevTime + 1);
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
          } catch (error) {
            console.error("Invalid URL:", tabs[0].url, error);
            setCurrentSite(null);
          }
        }
      });
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    if (mins > 0 || hours > 0) timeParts.push(`${mins}m`);
    timeParts.push(`${secs}s`);

    return timeParts.join(" ");
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
        return <ThisDay dailyTimings={dailyTimings} formatTime={formatTime} />;
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
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        theme={theme}
      />
      {renderContent()}
    </div>
  );
}

export default App;