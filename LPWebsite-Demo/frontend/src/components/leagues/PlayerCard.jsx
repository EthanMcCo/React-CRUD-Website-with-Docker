import React, { useState } from 'react';
import './PlayerCard.css';
import ContactForm from '../contact/ContactForm';

const PlayerCard = ({ player }) => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="player-card">
      <div className="player-card-header">
        <h3 className="player-name">{player.name}</h3>
        <span className="skill-badge">{player.skill_level}</span>
      </div>
      
      <div className="player-card-content">
        {player.bio && (
          <p className="player-bio">{player.bio}</p>
        )}
        
        <div className="player-availability">
          <h4>Available Nights:</h4>
          <div className="availability-tags">
            {player.play_nights.map((night) => (
              <span key={night} className="availability-tag">
                {night}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        className="contact-player-button"
        onClick={() => setShowContactForm(true)}
      >
        Contact Player
      </button>

      {showContactForm && (
        <ContactForm
          recipientName={player.name}
          recipientId={player.player_id}
          recipientType="player"
          messagePlaceholder="Introduce yourself and let them know what kind of team you're looking for..."
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default PlayerCard;