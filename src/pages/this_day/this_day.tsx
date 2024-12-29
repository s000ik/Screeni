import React, { useState, useEffect } from "react";
import SiteCard from "@/components/favicons/siteCard";
import Toggle from "@/components/toggle/toggle";
import daily_style from "./this_day.module.css";

interface ThisDayProps {
  dailyTimings: Record<string, number>;
  formatTime: (seconds: number) => string;
}

export const ThisDay: React.FC<ThisDayProps> = ({
  dailyTimings,
  formatTime,
}) => {
  const totalDailyTime = Object.values(dailyTimings).reduce(
    (acc, time) => acc + time,
    0
  );
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    chrome.storage.local.get("blockedSites", ({ blockedSites = [] }) => {
      const initialStates: Record<string, boolean> = {};
      blockedSites.forEach((hostname: string) => {
        initialStates[hostname] = true;
      });
      setToggleStates(initialStates);
    });
  }, []);

  const handleToggle = async (hostname: string) => {
    const newState = !toggleStates[hostname];
    setToggleStates((prev) => ({
      ...prev,
      [hostname]: newState,
    }));

    await chrome.runtime.sendMessage({
      type: "TOGGLE_BLOCK_SITE",
      hostname,
      shouldBlock: newState,
    });
  };

  return (
    <main className={daily_style.container}>
      <div className={daily_style.contentSection}>
        <div className={daily_style.sectionText}>
          <span className={daily_style.sectionHead}>
            Today's Browsing Time
          </span>
          <span className={daily_style.sectionSubhead}>
            Total screen-time today
          </span>
        </div>
        <div className={daily_style.sectionValue}>
          <span className={daily_style.purpleLargeRoboto}>
            {formatTime(totalDailyTime)}
          </span>
        </div>
      </div>

      <hr className={daily_style.divider} />

      <div className={daily_style.contentSection}>
        <div className={daily_style.sectionText}>
          <span className={daily_style.sectionHead}>Sites Visited</span>
          <span className={daily_style.sectionSubhead}>
            View time spent on each site, and block them if needed
          </span>
        </div>
      </div>

        <div className={daily_style.tableHeader}>
          <span className={daily_style.columnHeader}>Website</span>
          <div className={daily_style.rightColumns}>
            <span className={daily_style.columnHeader}>Time</span>
            <span className={daily_style.columnHeader}>Block</span>
          </div>
        </div>

      {/* Scrollable content */}
      <div className={daily_style.scrollableContainer}>
        <div className={daily_style.siteList}>
          {Object.entries(dailyTimings)
            .sort(([, timeA], [, timeB]) => timeB - timeA)
            .map(([hostname, siteTime]) => (
              <div key={hostname} className={daily_style.siteItem}>
                <div className={daily_style.siteItemContent}>
                  <div className={daily_style.siteCardContainer}>
                    <SiteCard hostname={hostname} useIcon={true} />
                  </div>
                  <span className={daily_style.siteCardTime}>
                    {formatTime(siteTime)}
                  </span>
                  <Toggle
                    isOn={toggleStates[hostname] || false}
                    onToggle={() => handleToggle(hostname)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
};
