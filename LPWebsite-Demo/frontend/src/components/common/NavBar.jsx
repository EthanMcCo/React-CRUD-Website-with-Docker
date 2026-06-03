import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
 const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
 const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [mobileSectionOpen, setMobileSectionOpen] = useState({
   leagues: false,
   about: false
 });
 const timeoutRef = useRef(null);
 const leagueTimeoutRef = useRef(null);

 const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    // Reset mobile dropdown states when closing the menu
    if (!newState) {
      setMobileSectionOpen({
        leagues: false,
        about: false
      });
    }
  };
 // Close mobile menu when window is resized to desktop size
 useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
        // Reset mobile dropdown states when switching to desktop
        setMobileSectionOpen({
          leagues: false,
          about: false
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

 const handleMouseEnter = (setter) => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  if (leagueTimeoutRef.current) clearTimeout(leagueTimeoutRef.current);
  
  // Close other dropdown
  if (setter === setIsAboutDropdownOpen) {
    setIsLeagueDropdownOpen(false);
  } else {
    setIsAboutDropdownOpen(false);
  }
  
  setter(true);
};

 const handleMouseLeave = (setter, timeoutRefToUse) => {
   timeoutRefToUse.current = setTimeout(() => {
     setter(false);
   }, 150);
 };

 const toggleMobileSection = (section) => {
   setMobileSectionOpen(prev => ({
     ...prev,
     [section]: !prev[section]
   }));
 };

 return (
   <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="nav-sections-container">
            <div className="nav-section left">
              <Link to="/events" className="nav-link">Events</Link>
              <Link to="/menu" className="nav-link">Menu</Link>
              <Link to="/pricing" className="nav-link">Pricing</Link>
            </div>

            <div className="nav-section center">
              <Link to="/" className="logo-container">
                <img src="/logo.png" alt="Billiard Club" className="logo" />
              </Link>
            </div>

            <div className="nav-section right">
              <Link to="/shop" className="nav-link">Shop</Link>
              
              <div 
                className="dropdown"
                onMouseEnter={() => handleMouseEnter(setIsLeagueDropdownOpen)}
                onMouseLeave={() => handleMouseLeave(setIsLeagueDropdownOpen, leagueTimeoutRef)}
              >
                <button className="dropdown-button">
                  Leagues
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {isLeagueDropdownOpen && (
                  <div 
                    className="dropdown-menu"
                    onMouseEnter={() => handleMouseEnter(setIsLeagueDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave(setIsLeagueDropdownOpen, leagueTimeoutRef)}
                  >
                    <Link to="/leagues" className="dropdown-item">Leagues</Link>
                    <Link to="/leagues/registration" className="dropdown-item">League Registration</Link>
                    <Link to="/leagues/team-finder" className="dropdown-item">Team Finder</Link>
                  </div>
                )}
              </div>

              <div 
                className="dropdown"
                onMouseEnter={() => handleMouseEnter(setIsAboutDropdownOpen)}
                onMouseLeave={() => handleMouseLeave(setIsAboutDropdownOpen, timeoutRef)}
              >
                <button className="dropdown-button">
                  About
                  <span className="dropdown-arrow">▼</span>
                </button>
                
                {isAboutDropdownOpen && (
                  <div 
                    className="dropdown-menu"
                    onMouseEnter={() => handleMouseEnter(setIsAboutDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave(setIsAboutDropdownOpen, timeoutRef)}
                  >
                    <Link to="/about/faq" className="dropdown-item">FAQ</Link>
                    <Link to="/about/contact" className="dropdown-item">Contact</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu toggle button */}
            <button 
              className="mobile-menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-container">
              <Link to="/events" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Events</Link>
              <Link to="/menu" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
              <Link to="/pricing" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link to="/shop" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              
              <div className="mobile-dropdown">
                <button 
                  className="mobile-dropdown-button"
                  onClick={() => toggleMobileSection('leagues')}
                >
                  Leagues
                  <span className={`mobile-dropdown-arrow ${mobileSectionOpen.leagues ? 'open' : ''}`}>▼</span>
                </button>
                <div className={`mobile-dropdown-content ${mobileSectionOpen.leagues ? 'open' : ''}`}>
                  <Link 
                    to="/leagues" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Leagues
                  </Link>
                  <Link 
                    to="/leagues/registration" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    League Registration
                  </Link>
                  <Link 
                    to="/leagues/team-finder" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Team Finder
                  </Link>
                </div>
              </div>
              
              <div className="mobile-dropdown">
                <button 
                  className="mobile-dropdown-button"
                  onClick={() => toggleMobileSection('about')}
                >
                  About
                  <span className={`mobile-dropdown-arrow ${mobileSectionOpen.about ? 'open' : ''}`}>▼</span>
                </button>
                <div className={`mobile-dropdown-content ${mobileSectionOpen.about ? 'open' : ''}`}>
                  <Link 
                    to="/about/faq" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link 
                    to="/about/contact" 
                    className="mobile-dropdown-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
   </nav>
 );
};

export default NavBar;