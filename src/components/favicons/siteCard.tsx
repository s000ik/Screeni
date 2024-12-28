import React from "react";
import favicon_style from "./siteCard.module.css";

interface SiteCardProps {
  hostname: string;
  useIcon?: boolean;
}

const SiteCard: React.FC<SiteCardProps> = ({ hostname, useIcon = false }) => {
  const getFaviconUrl = (hostname: string) => {
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  };

  return (
    <div className={favicon_style.siteCard}>
      {useIcon && (
        <img
          src={getFaviconUrl(hostname)}
          alt=""
          className={favicon_style.siteFavicon}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default-favicon.png";
          }}
        />
      )}
      <span className={favicon_style.siteName}>{hostname}</span>
    </div>
  );
};

export default SiteCard;