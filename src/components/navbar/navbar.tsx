import React from 'react';
import nav_style from './navbar.module.css';

interface NavbarProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className={nav_style.navbar}>
      <img
        src="/Screeni-logotype.png"
        alt="Screeni Logo"
        className={nav_style.logo}
      />
      <div className={nav_style.icons}>
        <button
          className={`${nav_style.icon} ${currentPage === 0 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(0)}
          title="This Session"
        >
          <img src="/icon1.png" alt="This Session" />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 1 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(1)}
          title="Today"
        >
          <img src="/icon2.png" alt="Today" />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 2 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(2)}
          title="7-day"
        >
          <img src="/icon3.png" alt="7-day" />
        </button>
        <button
          className={`${nav_style.icon} ${currentPage === 3 ? nav_style.active : ''}`}
          onClick={() => setCurrentPage(3)}
          title="Settings"
        >
          <img src="/icon4.png" alt="Settings" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;