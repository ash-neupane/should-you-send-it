import React from 'react';
import '../styles/Header.css'; // CSS for styling the header

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="Should You? Logo" className="logo" />
      </div>
      <nav className="nav-bar">
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
