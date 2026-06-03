import React from 'react';
import { Link } from 'react-router-dom';
import './Leagues.css';

const Leagues = () => {
  return (
    <div className="league-page">
      <div className="league-container">
        <h1 className="league-title">Leagues</h1>
        
        <div className="league-info">
          <p>Join our competitive pool leagues! We offer weekly league play for players of all skill levels.</p>
        </div>

        <div className="league-options">
          <div className="league-option-card">
            <h3>Team Registration</h3>
            <p>Register your team for upcoming league seasons.</p>
            <Link to="/leagues/registration" className="league-btn">
              Register Team
            </Link>
          </div>

          <div className="league-option-card">
            <h3>Find a Team</h3>
            <p>Looking for players or need to join a team? Use our team finder.</p>
            <Link to="/leagues/team-finder" className="league-btn">
              Team Finder
            </Link>
          </div>
        </div>

        <div className="league-details">
          <h3>League Information</h3>
          <ul>
            <li>Weekly league nights available</li>
            <li>Multiple skill divisions</li>
            <li>Seasonal tournaments</li>
            <li>Team and individual standings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leagues;