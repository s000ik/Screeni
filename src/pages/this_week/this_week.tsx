import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SiteCard from '@/components/favicons/siteCard';
import './this_week.css';

interface WeeklyData {
  day: string;
  time: number;
}

interface ThisWeekProps {
  weeklyData: WeeklyData[];
  weeklySites: Record<string, number>;
  liveWeeklyTime: number;
  formatTime: (seconds: number) => string;
}

export const ThisWeek: React.FC<ThisWeekProps> = ({ 
  weeklyData, 
  weeklySites, 
  liveWeeklyTime,
  formatTime 
}) => {
  const sortedWeeklySites = Object.entries(weeklySites)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="content">
      <div className="scrollable-content">
        <div className="total-time">
          <span className="label">Weekly browsing time</span>
          <span className="value purple-large-roboto">{formatTime(liveWeeklyTime)}</span>
        </div>
        <div className="average-time">
          <span className="label">Daily average</span>
          <span className="value purple-large-roboto">{formatTime(liveWeeklyTime / 7)}</span>
        </div>
        <hr className="divider" />
        <div className="chart-container">
          <h2 className="section-title">Weekly overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatTime(value)}
                labelStyle={{ color: '#4d4d4d' }}
              />
              <Bar dataKey="time" fill="#7B66FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="top-sites">
          <h2 className="section-title">Top viewed sites this week</h2>
          <div className="site-list with-icons">
            {sortedWeeklySites.map(([hostname, time], index) => (
              <SiteCard
                key={hostname}
                hostname={hostname}
                time={time}
                totalTime={liveWeeklyTime}
                formatTime={formatTime}
                useIcon={true}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};