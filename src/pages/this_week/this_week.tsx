import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SiteCard from '@/components/favicons/siteCard';
import ProgressBar from '@/components/progress-bar/progress-bar';
import week_style from './this_week.module.css';

interface ThisWeekProps {
  weeklyData: Array<{ day: string; time: number }>;
  weeklySites: Record<string, number>;
  liveWeeklyTime: number;
  formatTime: (seconds: number) => string;
}

export const ThisWeek: React.FC<ThisWeekProps> = ({
  weeklyData,
  weeklySites,
  liveWeeklyTime,
  formatTime,
}) => {
  const sortedWeeklySites = Object.entries(weeklySites)
    .sort(([, timeA], [, timeB]) => timeB - timeA);

  return (
    <main className={week_style.container}>
      <div className={week_style.contentSection}>
        <div className={week_style.sectionText}>
          <span className={week_style.sectionHead}>Weekly Browsing Time</span>
          <span className={week_style.sectionSubhead}>Total screen-time this week</span>
        </div>
        <div className={week_style.sectionValue}>
          <span className={week_style.purpleLargeRoboto}>{formatTime(liveWeeklyTime)}</span>
        </div>
      </div>

      <div className={week_style.contentSection}>
        <div className={week_style.sectionText}>
          <span className={week_style.sectionHead}>Daily Average</span>
          <span className={week_style.sectionSubhead}>Average screen-time per day</span>
        </div>
        <div className={week_style.sectionValue}>
          <span className={week_style.purpleLargeRoboto}>{formatTime(liveWeeklyTime / 7)}</span>
        </div>
      </div>

      <hr className={week_style.divider} />

      <div className={week_style.contentSection}>
        <div className={week_style.sectionText}>
          <span className={week_style.sectionHead}>Weekly Overview</span>
          <span className={week_style.sectionSubhead}>Time spent browsing each day</span>
        </div>
      </div>

      <div className={week_style.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatTime(value)}
              labelStyle={{ color: "var(--text-primary)" }}
            />
            <Bar dataKey="time" fill="var(--text-accent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={week_style.contentSection}>
        <div className={week_style.sectionText}>
          <span className={week_style.sectionHead}>Top Viewed Sites</span>
          <span className={week_style.sectionSubhead}>Most visited sites this week</span>
        </div>
      </div>

      <div className={week_style.siteList}>
        {sortedWeeklySites.map(([hostname, siteTime]) => (
          <div key={hostname} className={week_style.siteItem}>
            <div className={week_style.siteItemContent}>
              <div className={week_style.siteCardContainer}>
                <SiteCard hostname={hostname} useIcon={true} />
              </div>
              <span className={week_style.siteCardTime}>
                {formatTime(siteTime)}
              </span>
            </div>
            <ProgressBar 
              percentage={(siteTime / liveWeeklyTime) * 100} 
            />
          </div>
        ))}
      </div>
    </main>
  );
};