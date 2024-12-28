// Updated this_day.tsx
import React, { useState, useEffect, useEffect } from "react";
import SiteCard from "@/components/favicons/siteCard";
import Toggle from "@/components/toggle/toggle";
import "./this_day.css";

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
    chrome.storage.local.get('blockedSites', ({ blockedSites = [] }) => {
      const initialStates: Record<string, boolean> = {};
      blockedSites.forEach((hostname: string) => {
        initialStates[hostname] = true;
      });
      setToggleStates(initialStates);
    });
  }, []);

  const handleToggle = async (hostname: string) => {
    const newState = !toggleStates[hostname];
    setToggleStates(prev => ({
      ...prev,
      [hostname]: newState
    }));

    await chrome.runtime.sendMessage({
      type: 'TOGGLE_BLOCK_SITE',
      hostname,
      shouldBlock: newState
    });
  useEffect(() => {
    chrome.storage.local.get('blockedSites', ({ blockedSites = [] }) => {
      const initialStates: Record<string, boolean> = {};
      blockedSites.forEach((hostname: string) => {
        initialStates[hostname] = true;
      });
      setToggleStates(initialStates);
    });
  }, []);

  const handleToggle = async (hostname: string) => {
    const newState = !toggleStates[hostname];
    setToggleStates(prev => ({
      ...prev,
      [hostname]: newState
    }));

    await chrome.runtime.sendMessage({
      type: 'TOGGLE_BLOCK_SITE',
      hostname,
      shouldBlock: newState
    });
  };

  return (
    <main className="content">
      <div className="content-section">
        <div className="section-text">
          <span className="section-head">Total Browsing Time Today</span>
          <span className="section-subhead">Total screen-time today</span>
        </div>
        <div className="section-value purple-large-roboto">
          {formatTime(totalDailyTime)}
        </div>
      </div>
      <hr className="divider" />
      <div className="scrollable-content">
        <div className="site-list">
          <div className="table-header">
            <span className="table-column-header website-label">Website</span>
            <span className="table-column-header time-label">Time</span>
            <span className="table-column-header block-label">Block</span>
          </div>
          {Object.entries(dailyTimings)
            .sort(([, a], [, b]) => b - a)
            .map(([hostname, time]) => (
              <div
                className="table-row"
                key={hostname}
                style={{ marginBottom: "10px" }}
              >
                <span className="site-card-wrapper">
                  <SiteCard hostname={hostname} useIcon={true} />
                </span>
                <span className="purple-small-roboto">
                  {formatTime(time)}
                </span>
                <span className="toggle-wrapper">
                  <Toggle
                    isOn={toggleStates[hostname] || false}
                    onToggle={() => handleToggle(hostname)}
                  />
                </span>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
};
