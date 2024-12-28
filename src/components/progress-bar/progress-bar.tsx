import React from 'react';
import progbar_style from './progress-bar.module.css';

interface ProgressBarProps {
  percentage: number;  // Value between 0 and 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className={progbar_style.progressBarContainer}>
      <div 
        className={progbar_style.progressBarFill} 
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
};

export default ProgressBar;