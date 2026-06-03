import React, { useState, useEffect } from 'react';
import './TeamLoginModal.css';

const TeamLoginModal = ({ isOpen, onClose, onLoginSuccess, preAuthenticatedTeam }) => {
  const [teamData, setTeamData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teamInfo, setTeamInfo] = useState(null);

  // Effect to handle pre-authenticated team
  useEffect(() => {
    if (preAuthenticatedTeam && isOpen) {
      setIsLoggedIn(true);
      setTeamInfo(preAuthenticatedTeam);
      fetchTeamData(preAuthenticatedTeam.team_id);
    }
  }, [preAuthenticatedTeam, isOpen]);
  const [editMode, setEditMode] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerContact, setNewPlayerContact] = useState('');
  const [formData, setFormData] = useState({
    teamName: '',
    acceptingNewPlayers: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/teams/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: teamData.email,
          password: teamData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setTeamInfo(data.team);
        onLoginSuccess(data.team);
        fetchTeamData(data.team.team_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid email or password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error authenticating team' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/profile/${teamId}`);
      const data = await response.json();

      if (data.success) {
        setTeamInfo(data.team);
        setFormData({
          teamName: data.team.team_name,
          acceptingNewPlayers: data.team.accepting_new_players === 1
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load team data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading team data' });
    }
  };

  const handleUpdateTeam = async () => {
    try {
      const response = await fetch(`/api/teams/profile/${teamInfo.team_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: formData.teamName,
          acceptingNewPlayers: formData.acceptingNewPlayers
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Team updated successfully' });
        setEditMode(false);
        fetchTeamData(teamInfo.team_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update team' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating team' });
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      setMessage({ type: 'error', text: 'Player name is required' });
      return;
    }

    try {
      const response = await fetch(`/api/teams/profile/${teamInfo.team_id}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: newPlayerName.trim(),
          contactInfo: newPlayerContact.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Player added successfully' });
        setNewPlayerName('');
        setNewPlayerContact('');
        fetchTeamData(teamInfo.team_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add player' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error adding player' });
    }
  };

  const handleRemovePlayer = async (playerName) => {
    if (!window.confirm(`Are you sure you want to remove ${playerName} from the team?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/profile/${teamInfo.team_id}/players/${encodeURIComponent(playerName)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Player removed successfully' });
        fetchTeamData(teamInfo.team_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove player' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing player' });
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete your team? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('This will permanently delete your team and all associated data. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/profile/${teamInfo.team_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Team deleted successfully' });
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete team' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting team' });
    }
  };

  const handleClose = () => {
    setTeamData({ email: '', password: '' });
    setMessage(null);
    setLoading(false);
    setIsLoggedIn(false);
    setTeamInfo(null);
    setEditMode(false);
    setNewPlayerName('');
    setNewPlayerContact('');
    onClose();
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'confirmed' ? 'status-confirmed' : 'status-tentative';
    const statusText = status === 'confirmed' ? 'Confirmed' : 'Tentative';
    return <span className={`team-status-badge ${statusClass}`}>{statusText}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="team-login-modal-overlay" onClick={handleClose}>
      <div className="team-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="team-login-modal-header">
          <h2>{isLoggedIn ? 'Team Management' : 'Team Captain Login'}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="team-login-modal-content">
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {!isLoggedIn ? (
            <>
              <p className="login-description">
                Enter your team captain credentials to manage your team roster, update team information, or delete your team.
              </p>

              <form onSubmit={handleSubmit} className="team-login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    Captain Email:
                    <div className="info-icon-container">
                      <span className="info-icon">i</span>
                      <span className="tooltip">
                        Use the email you provided when registering your team
                      </span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={teamData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="Enter your captain email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={teamData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="login-button"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Access My Team'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="login-help">
                <p>
                  <strong>Need help?</strong> If you forgot your password or need to update your team registration, 
                  please contact us through the contact page.
                </p>
              </div>
            </>
          ) : (
            <div className="team-management-content">
              {teamInfo && (
                <>
                  {/* Team Information Section */}
                  <div className="team-info-section">
                    <h3>Team Information</h3>
                    
                    {editMode ? (
                      <div className="edit-form">
                        <div className="form-group">
                          <label htmlFor="teamName">Team Name:</label>
                          <input
                            type="text"
                            id="teamName"
                            value={formData.teamName}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              teamName: e.target.value
                            }))}
                            required
                          />
                        </div>
                        
                        <div className="form-group checkbox-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.acceptingNewPlayers}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                acceptingNewPlayers: e.target.checked
                              }))}
                            />
                            <span>Allow players to contact you about joining</span>
                          </label>
                        </div>
                        
                        <div className="form-actions">
                          <button onClick={handleUpdateTeam} className="save-button">
                            Save Changes
                          </button>
                          <button onClick={() => setEditMode(false)} className="cancel-button">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="team-details">
                        <div className="detail-row">
                          <strong>Team Name:</strong> {teamInfo.team_name}
                        </div>
                        <div className="detail-row">
                          <strong>Captain Email:</strong> {teamInfo.captain_email}
                        </div>
                        <div className="detail-row">
                          <strong>Play Night:</strong> {teamInfo.play_night || 'Not assigned'}
                        </div>
                        <div className="detail-row">
                          <strong>Registration Status:</strong> {getStatusBadge(teamInfo.registration_status)}
                        </div>
                        <div className="detail-row">
                          <strong>Accepting New Players:</strong> {teamInfo.accepting_new_players ? 'Yes' : 'No'}
                        </div>
                        
                        <button onClick={() => setEditMode(true)} className="edit-button">
                          Edit Team Info
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Players Section */}
                  <div className="players-section">
                    <h3>Team Roster ({teamInfo.players?.length || 0} players)</h3>
                    
                    <div className="add-player-form">
                      <h4>Add New Player</h4>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Player name"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Contact info (optional)"
                          value={newPlayerContact}
                          onChange={(e) => setNewPlayerContact(e.target.value)}
                        />
                      </div>
                      <button onClick={handleAddPlayer} className="add-player-button">
                        Add Player
                      </button>
                    </div>

                    <div className="players-list">
                      {teamInfo.players && teamInfo.players.length > 0 ? (
                        teamInfo.players.map((player, index) => (
                          <div key={index} className="player-item">
                            <div className="player-info">
                              <div className="player-name">{player.player_name}</div>
                              {player.contact_info && (
                                <div className="player-contact">{player.contact_info}</div>
                              )}
                              <div className="player-joined">
                                Joined: {new Date(player.join_date).toLocaleDateString()}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemovePlayer(player.player_name)}
                              className="team-remove-player-button"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-players">No players added yet</div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <p>Once you delete your team, there is no going back. Please be certain.</p>
                    <button onClick={handleDeleteTeam} className="delete-team-button">
                      Delete Team
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLoginModal;