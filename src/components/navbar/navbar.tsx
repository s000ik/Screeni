// Navbar.tsx
import React from 'react';
import './navbar.css'; // Import the CSS specific to the Navbar

interface NavbarProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="navbar flex items-center justify-between">
      <img
        src="/Screeni-logotype.png"
        alt="Screeni Logo"
        className="logo"
      />
      <div className="icons">
        <button
          className={`icon ${currentPage === 0 ? 'active' : ''}`}
          onClick={() => setCurrentPage(0)}
          title="This Session"
        >
          <img src="/icon1.png" alt="This Session" />
        </button>
        <button
          className={`icon ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => setCurrentPage(1)}
          title="Today"
        >
          <img src="/icon2.png" alt="Today" />
        </button>
        <button
          className={`icon ${currentPage === 2 ? 'active' : ''}`}
          onClick={() => setCurrentPage(2)}
          title="7-day"
        >
          <img src="/icon3.png" alt="7-day" />
        </button>
        <button
          className={`icon ${currentPage === 3 ? 'active' : ''}`}
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
