import React from "react";
import "./siteCard.css";

interface SiteCardProps {
  hostname: string;
  useIcon?: boolean;
}

const SiteCard: React.FC<SiteCardProps> = ({ hostname, useIcon = false }) => {
  const getFaviconUrl = (hostname: string) => {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  };

  return (
    <div className="site-card">
      {useIcon && (
        <img
          src={getFaviconUrl(hostname)}
          alt=""
          className="site-favicon"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-favicon.png";
          }}
        />
      )}
      <span className="site-name">{hostname}</span>
    </div>
  );
};

export default SiteCard;
