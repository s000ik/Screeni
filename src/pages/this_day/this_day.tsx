import React from 'react';
import SiteCard from '@/components/favicons/siteCard';
import './this_day.css';

interface ThisDayProps {
  dailyTimings: Record<string, number>;
  formatTime: (seconds: number) => string;
}

export const ThisDay: React.FC<ThisDayProps> = ({ dailyTimings, formatTime }) => {
  const totalDailyTime = Object.values(dailyTimings).reduce((acc, time) => acc + time, 0);

  return (
    <main className="content">
      <div className="total-time">
        <span className="label">Today's browsing time</span>
        <span className="value purple-large-roboto">{formatTime(totalDailyTime)}</span>
      </div>
      <hr className="divider" />
      <div className="scrollable-content">
        <h2 className="section-title">All sites visited today</h2>
        <div className="site-list with-icons">
          {Object.entries(dailyTimings)
            .sort(([, a], [, b]) => b - a)
            .map(([hostname, time], index) => (
              <SiteCard
                key={hostname}
                hostname={hostname}
                time={time}
                totalTime={totalDailyTime}
                formatTime={formatTime}
                useIcon={true}
                index={index}
              />
            ))}
        </div>
      </div>
    </main>
  );
};