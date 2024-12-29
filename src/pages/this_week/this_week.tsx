import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SiteCard from '@/components/favicons/siteCard';
import ProgressBar from '@/components/progress-bar/progress-bar';
import styles from './this_week.module.css';

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
    <main className={styles.container}>
      <div className={styles.scrollableContainer}>
        <div className={styles.contentSectionWrapper}>
          <div className={styles.contentSection}>
            <div className={styles.sectionText}>
              <span className={styles.sectionHead}>Total Browsing Time This Week</span>
              <span className={styles.sectionSubhead}>Total screen-time over the week</span>
            </div>
            <div className={styles.sectionValue}>
              <span className={styles.purpleLargeRoboto}>{formatTime(liveWeeklyTime)}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.contentSection}>
            <div className={styles.sectionText}>
              <span className={styles.sectionHead}>Average Browsing Time This Week</span>
              <span className={styles.sectionSubhead}>Average screen-time per day over the week</span>
            </div>
            <div className={styles.sectionValue}>
              <span className={styles.purpleLargeRoboto}>{formatTime(liveWeeklyTime / 7)}</span>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* <div className={styles.contentSection}>
          <div className={styles.sectionText}>
            <span className={styles.sectionHead}>Weekly Overview</span>
            <span className={styles.sectionSubhead}>Time spent browsing each day</span>
          </div>
        </div> */}

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="day"
                tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => formatTime(value)}
                labelStyle={{ color: "var(--text-primary)" }}
                contentStyle={{
                background: 'var(--background)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="time" 
                fill="var(--text-accent)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.sectionText}>
            <span className={styles.sectionHead}>Top Viewed Sites This Week</span>
            <span className={styles.sectionSubhead}>Most viewed sites of the week</span>
          </div>
        </div>

        <div className={styles.siteList}>
          {sortedWeeklySites.map(([hostname, siteTime]) => (
            <div key={hostname} className={styles.siteItem}>
              <div className={styles.siteItemContent}>
                <div className={styles.siteCardContainer}>
                  <SiteCard hostname={hostname} useIcon={true} />
                </div>
                <span className={styles.siteCardTime}>
                  {formatTime(siteTime)}
                </span>
              </div>
              <ProgressBar percentage={(siteTime / liveWeeklyTime) * 100} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ThisWeek;