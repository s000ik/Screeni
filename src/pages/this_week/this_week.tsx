import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SiteCard from "@/components/favicons/siteCard";
import ProgressBar from "@/components/progress-bar/progress-bar";
import styles from "./this_week.module.css";

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
  const sortedWeeklySites = Object.entries(weeklySites).sort(
    ([, timeA], [, timeB]) => timeB - timeA
  );
  const maxValue = Math.max(...weeklyData.map((item) => item.time));
  const CHART_HEIGHT = 160;
  const CHART_MARGIN = { top: 10, right: 0, left: 0, bottom: 0 };

  return (
    <main className={styles.container}>
      <div className={styles.scrollableContainer}>
        <div className={styles.contentSectionWrapper}>
          <div className={styles.contentSection}>
            <div className={styles.sectionText}>
              <span className={styles.sectionHead}>
                Week's Browsing Time 
              </span>
              <span className={styles.sectionSubhead}>
                Total screen-time over the week
              </span>
            </div>
            <div className={styles.sectionValue}>
              <span className={styles.purpleLargeRoboto}>
                {formatTime(liveWeeklyTime)}
              </span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.contentSection}>
            <div className={styles.sectionText}>
              <span className={styles.sectionHead}>
                Week's Average Browsing Time
              </span>
              <span className={styles.sectionSubhead}>
                Average screen-time per day over the week
              </span>
            </div>
            <div className={styles.sectionValue}>
              <span className={styles.purpleLargeRoboto}>
                {formatTime(liveWeeklyTime / (new Date().getDay() || 7))}
              </span>
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
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={weeklyData} margin={CHART_MARGIN}>
              <XAxis
                dataKey="day"
                tick={{ fill: "var(--text-primary)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border-color)" }}
                tickLine={false}
              />
              <YAxis hide domain={[0, maxValue]} scale="linear" />
              <Tooltip
                formatter={(value: number) => [formatTime(value)]}
                labelStyle={{
                  color: "var(--text-secondary)",
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                contentStyle={{
                  background: "var(--background-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  color: "var(--text-accent)",
                  fontFamily: "Roboto Flex",
                  fontSize: "16px",
                  fontWeight: 780,
                  padding: 0,
                }}
                separator=""
                cursor={{ fill: "var(--tooltip-hover)" }}
              />
              <Bar
                dataKey="time"
                fill="var(--text-accent)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                animationDuration={300}
                animationBegin={0}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <hr className={styles.chartsdivider} />

        <div className={styles.contentSection}>
          <div className={styles.sectionText}>
            <span className={styles.sectionHead}>
              Top Viewed Sites This Week
            </span>
            <span className={styles.sectionSubhead}>
              Most viewed sites of the week
            </span>
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
