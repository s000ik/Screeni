import React from 'react';

interface SiteCardProps {
  hostname: string;
  time: number;
  totalTime: number;
  formatTime: (seconds: number) => string;
  useIcon?: boolean;
  index: number;  // Add this prop
}

const SiteCard: React.FC<SiteCardProps> = ({ 
  hostname, 
  time, 
  totalTime, 
  formatTime, 
  useIcon = false,
  index 
}) => {
  const getFaviconUrl = (hostname: string) => {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  };

  return (
    <div className="site-item">
      <div className="site-info">
        {useIcon ? (
          <img 
            src={getFaviconUrl(hostname)} 
            alt="" 
            className="site-favicon"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-favicon.png';
            }}
          />
        ) : (
          <span className="list-number">{index + 1}.</span>
        )}
        <span className="site-name">{hostname}</span>
        <span className="site-time">{formatTime(time)}</span>
      </div>
      <div className="progress-bar-bg" />
      <div
        className="progress-bar"
        style={{
          width: `${(time / totalTime) * 100}%`
        }}
      />
    </div>
  );
};

export default SiteCard;