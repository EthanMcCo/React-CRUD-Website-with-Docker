import React from 'react';
import './LeagueRegistration.css';

const TeamListItem = ({ teamName, canContact, onContactClick, onViewRoster, playNight }) => {
  const handleTeamClick = (e) => {
    // Don't trigger if clicking the contact button
    if (e.target.closest('.league-contact-button')) {
      return;
    }
    onViewRoster();
  };

  return (
    <div 
      className="team-list-item team-list-item--clickable" 
      onClick={handleTeamClick}
      title="Click to view team roster"
    >
      <div className="team-info">
        <span className="team-name">{teamName}</span>
        <span className="team-click-hint">Click to view roster</span>
      </div>
      <div className="team-actions">
        {canContact && (
          <button 
            className="league-contact-button"
            onClick={(e) => {
              e.stopPropagation();
              onContactClick(teamName);
            }}
          >
            Contact
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamListItem;