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
    <main className="content">
      <div className="total-time">
        <span className="label">Total browsing time</span>
        <span className="value purple-large-roboto">{formatTime(totalSessionTime)}</span>
      </div>
      <hr className="divider" />
      <div className="most-viewed">
        <h2 className="section-title">Most viewed sites</h2>
        <div className="site-list with-icons">
          {Object.entries(sessionTimings)
            .sort(([, a], [, b]) => b - a)
            .map(([hostname]) => (
              <SiteCard hostname={hostname} useIcon={true} />
            ))}
        </div>
      </div>
    </main>
  );
};