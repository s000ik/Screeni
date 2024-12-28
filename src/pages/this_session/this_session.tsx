import React from "react";
import SiteCard from "@/components/favicons/siteCard";
import ProgressBar from "@/components/progress-bar/progress-bar";
import "./this_session.css";

interface ThisSessionProps {
  sessionTimings: Record<string, number>;
  formatTime: (seconds: number) => string;
}

export const ThisSession: React.FC<ThisSessionProps> = ({
  sessionTimings,
  formatTime,
}) => {
  const totalTime = Object.values(sessionTimings).reduce(
    (acc, time) => acc + time,
    0
  );

  return (
    <main className="this-session-container">
      <div className="content-section">
        <div className="section-text">
          <span className="section-head">Total Browsing Time</span>
          <span className="section-subhead">
            Total screen-time this session
          </span>
        </div>
        <div className="section-value purple-large-roboto">
          {formatTime(totalTime)}
        </div>
      </div>

      <hr className="divider" />

      <div className="content-section">
        <div className="section-text">
          <span className="section-head">Top Viewed Sites</span>
          <span className="section-subhead">
            Most viewed sites this browsing session
          </span>
        </div>
      </div>

      <div className="site-list">
        {Object.entries(sessionTimings)
          .sort(([, timeA], [, timeB]) => timeB - timeA)
          .map(([hostname, siteTime]) => (
            <div key={hostname} className="site-item">
              <div className="site-item-content">
                <div className="site-card-container">
                  <SiteCard hostname={hostname} useIcon={true} />
                </div>
                <span className="site-card-time">{formatTime(siteTime)}</span>
              </div>
              <ProgressBar percentage={(siteTime / totalTime) * 100} />
            </div>
          ))}
      </div>
    </main>
  );
};
