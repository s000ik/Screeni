import React, { useState } from "react";
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

  const handleToggle = (hostname: string) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [hostname]: !prevState[hostname],
    }));
  };

  return (
    <main className="content">
      <div className="total-time">
        <span className="label">Total Browsing Time Today</span>
        <span className="value purple-large-roboto">
          {formatTime(totalDailyTime)}
        </span>
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
