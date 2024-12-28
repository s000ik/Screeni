import React from "react";
import SiteCard from "@/components/favicons/siteCard";
import ProgressBar from "@/components/progress-bar/progress-bar";
import session_style from "./this_session.module.css";

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
    <main className={session_style.container}>

      {/* Fixed content */}
      <div className={session_style.fixedContent}>

        <div className={session_style.contentSection}>
          <div className={session_style.sectionText}>
            <span className={session_style.sectionHead}>Total Browsing Time</span>
            <span className={session_style.sectionSubhead}>
              Total screen-time this session
            </span>
          </div>
          <div className={session_style.sectionValue}>
            <span className={session_style.purpleLargeRoboto}>{formatTime(totalTime)}</span>
          </div>
        </div>
  
        <hr className={session_style.divider} />
  
        <div className={session_style.contentSection}>
          <div className={session_style.sectionText}>
            <span className={session_style.sectionHead}>Top Viewed Sites</span>
            <span className={session_style.sectionSubhead}>
              Most viewed sites this browsing session
            </span>
          </div>
        </div>

      </div>
  
      {/* Scrollable content */}
      <div className={session_style.scrollableContainer}>

        <div className={session_style.siteList}>
          {Object.entries(sessionTimings)
            .sort(([, timeA], [, timeB]) => timeB - timeA)
            .map(([hostname, siteTime]) => (
              <div key={hostname} className={session_style.siteItem}>
                <div className={session_style.siteItemContent}>
                  <div className={session_style.siteCardContainer}>
                    <SiteCard hostname={hostname} useIcon={true} />
                  </div>
                  <span className={session_style.siteCardTime}>{formatTime(siteTime)}</span>
                </div>
                <ProgressBar percentage={(siteTime / totalTime) * 100} />
              </div>
            ))}
        </div>
        
      </div>
    </main>
  );
};