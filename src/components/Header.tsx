import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => (
  <header className="header">
    <div className="logo-container">
      <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="Should You? Logo" className="logo" />
    </div>
    <nav className="nav-bar">
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  </header>
);

export default Header;
