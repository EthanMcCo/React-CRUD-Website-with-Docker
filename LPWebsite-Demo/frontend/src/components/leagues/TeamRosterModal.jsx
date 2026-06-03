import React, { useState, useEffect } from 'react';
import './TeamRosterModal.css';

const TeamRosterModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamRoster();
    }
  }, [isOpen, teamId]);

  const fetchTeamRoster = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teams/roster/${teamId}`);
      const data = await response.json();
      
      if (data.success) {
        setRoster(data.team);
      } else {
        setError(data.error || 'Failed to load team roster');
      }
    } catch (err) {
      setError('Error loading team roster');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRoster(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="roster-modal__overlay" onClick={handleClose}>
      <div className="roster-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="roster-modal__header">
          <h2 className="roster-modal__title">{teamName} - Team Roster</h2>
          <button 
            className="roster-modal__close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="roster-modal__body">
          {loading && (
            <div className="roster-modal__loading">
              Loading team roster...
            </div>
          )}

          {error && (
            <div className="roster-modal__error">
              {error}
            </div>
          )}

          {roster && !loading && (
            <div className="roster-modal__content-wrapper">
              <div className="roster-modal__team-info">
                {roster.league_name && (
                  <p><strong>League:</strong> {roster.league_name} - {roster.season_name}</p>
                )}
                {roster.play_night && (
                  <p><strong>Play Night:</strong> {roster.play_night}</p>
                )}
                {roster.skill_cap && (
                  <p><strong>Skill Cap:</strong> {roster.skill_cap}</p>
                )}
                <p><strong>Accepting New Players:</strong> {roster.accepting_new_players ? 'Yes' : 'No'}</p>
              </div>

              <div className="roster-modal__players-section">
                <h3 className="roster-modal__players-title">
                  Players ({roster.player_count})
                </h3>
                
                {roster.players.length === 0 ? (
                  <p className="roster-modal__no-players">No players registered yet</p>
                ) : (
                  <div className="roster-modal__players-list">
                    {roster.players.map((player, index) => (
                      <div key={index} className="roster-modal__player-item">
                        <span className="roster-modal__player-name">
                          {player.player_name}
                        </span>
                        <span className="roster-modal__player-date">
                          Joined: {new Date(player.join_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {roster.accepting_new_players && roster.players.length < 8 ? (
                <div className="roster-modal__availability">
                  <p className="roster-modal__spots-available">
                    🎯 This team is looking for players! ({8 - roster.players.length} spots potentially available)
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamRosterModal;