import React from 'react';
import SiteCard from '@/components/favicons/siteCard';
import './this_session.css';

interface ThisSessionProps {
  sessionTimings: Record<string, number>;
  formatTime: (seconds: number) => string;
}

export const ThisSession: React.FC<ThisSessionProps> = ({ sessionTimings, formatTime }) => {
  const totalSessionTime = Object.values(sessionTimings).reduce((acc, time) => acc + time, 0);

  return (
    <main className="this-session-container">
      <div className="content-section">
        <div className="section-text">
          <span className="section-head">Total Browsing Time</span>
          <span className="section-subhead">Total screen-time this session</span>
        </div>
        <div className="section-value purple-large-roboto">
          {formatTime(totalSessionTime)}
        </div>
      </div>
  
      <hr className="divider" />
  
      <div className="most-viewed">
        <h2 className="section-title">Most viewed sites</h2>
        <div className="site-list with-icons">
          {Object.entries(sessionTimings)
            .sort(([, a], [, b]) => b - a)
            .map(([hostname]) => (
              <SiteCard hostname={hostname} useIcon={true} key={hostname} />
            ))}
        </div>
      </div>
    </main>
  );
};