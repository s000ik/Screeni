import React from 'react';
import nav_style from './navbar.module.css';

interface NavbarProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  theme: 'system' | 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, theme }) => {
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <nav className={nav_style.navbar}>
      <img
        src={isDark ? "/Screeni-logotype-purple.png" : "/Screeni-logotype.png"}
        alt="Screeni Logo"
        className={nav_style.logo}
      />
      <div className={nav_style.icons}>
        <button
          className={`${nav_style.icon} ${currentPage === 0 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(0)}
          title="This Session"
        >
          <img 
            src={isDark ? "/icon1purple.png" : "/icon1.png"} 
            alt="This Session" 
          />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 1 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(1)}
          title="Today"
        >
          <img 
            src={isDark ? "/icon2purple.png" : "/icon2.png"} 
            alt="Today" 
          />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 2 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(2)}
          title="7-day"
        >
          <img 
            src={isDark ? "/icon3purple.png" : "/icon3.png"} 
            alt="7-day" 
          />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 3 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(3)}
          title="Settings"
        >
          <img 
            src={isDark ? "/icon4purple.png" : "/icon4.png"} 
            alt="Settings" 
          />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;