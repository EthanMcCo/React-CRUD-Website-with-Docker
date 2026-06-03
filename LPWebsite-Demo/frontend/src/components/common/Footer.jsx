import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="links-container">
        <Link to="/about/contact" className="footer-link">About us</Link>
        <Link to="/menu" className="footer-link">Menu</Link>
        <Link to="/about/faq" className="footer-link">FAQs</Link>
        <Link to="/leagues" className="footer-link">Leagues</Link>
        <Link to="/events" className="footer-link">Events</Link>
        <Link to="/pricing" className="footer-link">Pricing</Link>
      </div>
      <p className="copyright">© 2024 Leather Pocket. All rights reserved.</p>
    </footer>
  );
};

export default Footer;