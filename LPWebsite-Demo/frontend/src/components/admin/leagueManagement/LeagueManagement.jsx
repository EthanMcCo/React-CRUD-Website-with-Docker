import React, { useState, useEffect, useCallback } from 'react';
import './LeagueManagement.css';

const LeagueManagement = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNight, setSelectedNight] = useState('all');
  const [showCreateSeasonModal, setShowCreateSeasonModal] = useState(false);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams', 'players', 'seasons'
  const [editingSeason, setEditingSeason] = useState(null);
  const [assignSelections, setAssignSelections] = useState({}); // teamId -> selected league_id

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams/admin/teams');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setTeams(data.teams);
      } else {
        throw new Error(data.error || 'Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      showAlert('error', `Failed to fetch teams: ${error.message}`);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.players);
      } else {
        throw new Error(data.error || 'Failed to fetch players');
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      showAlert('error', `Failed to fetch players: ${error.message}`);
    }
  }, []);

  const fetchSeasons = useCallback(async () => {
    try {
      const response = await fetch('/api/teams/admin/seasons');
      const data = await response.json();
      
      if (data.success) {
        setSeasons(data.seasons);
      } else {
        throw new Error(data.error || 'Failed to fetch seasons');
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
      showAlert('error', `Failed to fetch seasons: ${error.message}`);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTeams(), fetchPlayers(), fetchSeasons()]);
    setLoading(false);
  }, [fetchTeams, fetchPlayers, fetchSeasons]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/teams/admin/teams/${teamId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          fetchTeams();
          showAlert('success', 'Team deleted successfully');
        } else {
          throw new Error(data.error || 'Failed to delete team');
        }
      } catch (error) {
        console.error('Error deleting team:', error);
        showAlert('error', `Failed to delete team: ${error.message}`);
      }
    }
  };

  const handleAssignTeam = async (teamId) => {
    const leagueId = assignSelections[teamId];
    if (!leagueId) {
      showAlert('error', 'Please select a season to assign this team to');
      return;
    }
    try {
      const response = await fetch(`/api/teams/admin/teams/${teamId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ league_id: leagueId })
      });
      const data = await response.json();
      if (data.success) {
        setAssignSelections(prev => { const next = { ...prev }; delete next[teamId]; return next; });
        fetchTeams();
        showAlert('success', 'Team assigned to season successfully');
      } else {
        throw new Error(data.error || 'Failed to assign team');
      }
    } catch (error) {
      console.error('Error assigning team:', error);
      showAlert('error', `Failed to assign team: ${error.message}`);
    }
  };

  const handleUpdateTeamStatus = async (teamId, newStatus) => {
    try {
      const response = await fetch(`/api/teams/admin/teams/${teamId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchTeams();
        showAlert('success', `Team status updated to ${newStatus}`);
      } else {
        throw new Error(data.error || 'Failed to update team status');
      }
    } catch (error) {
      console.error('Error updating team status:', error);
      showAlert('error', `Failed to update status: ${error.message}`);
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (window.confirm(`Are you sure you want to remove ${playerName} from the player pool? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/players/${playerId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          fetchPlayers();
          showAlert('success', `${playerName} has been removed from the player pool`);
        } else {
          throw new Error(data.error || 'Failed to remove player');
        }
      } catch (error) {
        console.error('Error removing player:', error);
        showAlert('error', `Failed to remove player: ${error.message}`);
      }
    }
  };

  const handleCreateSeason = async (seasonData) => {
    try {
      const response = await fetch('/api/teams/admin/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seasonData)
      });
      const data = await response.json();
      
      if (data.success) {
        setShowCreateSeasonModal(false);
        fetchSeasons();
        showAlert('success', 'League season created successfully with recurring weekly events and playoff dates');
      } else {
        throw new Error(data.error || 'Failed to create season');
      }
    } catch (error) {
      console.error('Error creating season:', error);
      showAlert('error', `Failed to create season: ${error.message}`);
    }
  };

  const handleEditSeason = (season) => {
    setEditingSeason(season);
    setShowCreateSeasonModal(true);
  };

  const handleUpdateSeason = async (seasonData, seasonId) => {
    try {
      const response = await fetch(`/api/teams/admin/seasons/${seasonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seasonData)
      });
      const data = await response.json();
      
      if (data.success) {
        setShowCreateSeasonModal(false);
        setEditingSeason(null);
        fetchSeasons();
        showAlert('success', 'League season updated successfully with calendar event updates');
      } else {
        throw new Error(data.error || 'Failed to update season');
      }
    } catch (error) {
      console.error('Error updating season:', error);
      showAlert('error', `Failed to update season: ${error.message}`);
    }
  };

  const handleSubmitSeason = async (seasonData, seasonId = null) => {
    if (seasonId) {
      await handleUpdateSeason(seasonData, seasonId);
    } else {
      await handleCreateSeason(seasonData);
    }
  };

  const handleEndSeason = async (seasonId, seasonName) => {
    if (window.confirm(`Are you sure you want to end "${seasonName}"? This will deactivate all teams in this league and cannot be undone.`)) {
      try {
        const response = await fetch(`/api/teams/admin/seasons/${seasonId}/end`, {
          method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
          fetchSeasons();
          fetchTeams(); // Refresh teams list to reflect deactivated teams
          showAlert('success', data.message);
        } else {
          throw new Error(data.error || 'Failed to end season');
        }
      } catch (error) {
        console.error('Error ending season:', error);
        showAlert('error', `Failed to end season: ${error.message}`);
      }
    }
  };

  const handleDeleteSeason = async (seasonId, seasonName) => {
    if (window.confirm(`Are you sure you want to delete "${seasonName}"? This will permanently delete the season and all associated events and team registrations. This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/teams/admin/seasons/${seasonId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          fetchSeasons();
          fetchTeams(); // Refresh teams list
          showAlert('success', 'League season deleted successfully');
        } else {
          throw new Error(data.error || 'Failed to delete season');
        }
      } catch (error) {
        console.error('Error deleting season:', error);
        showAlert('error', `Failed to delete season: ${error.message}`);
      }
    }
  };

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const filterTeams = (teams) => {
    if (selectedNight === 'all') return teams;
    return teams.filter(team => team.play_night === selectedNight);
  };

  const getTeamCount = (night) => {
    if (night === 'all') return teams.length;
    return teams.filter(team => team.play_night === night).length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="content-section loading">Loading league data...</div>;
  }

  const filteredTeams = filterTeams(teams);

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>League Management</h2>
        <div className="league-stats">
          <div className="stat-item">
            <span className="stat-label">Total Teams:</span>
            <span className="stat-value">{teams.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Players:</span>
            <span className="stat-value">{players.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">League Seasons:</span>
            <span className="stat-value">{seasons.length}</span>
          </div>
        </div>
      </div>
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button 
          className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button 
          className={`tab-button ${activeTab === 'seasons' ? 'active' : ''}`}
          onClick={() => setActiveTab('seasons')}
        >
          League Seasons
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'teams' && (
          <div className="teams-section">
            <div className="section-header">
              <h3>Teams</h3>
              <div className="filter-section">
                <select 
                  value={selectedNight} 
                  onChange={(e) => setSelectedNight(e.target.value)}
                  className="night-filter"
                >
                  <option value="all">All Nights ({getTeamCount('all')})</option>
                  <option value="Monday">Monday ({getTeamCount('Monday')})</option>
                  <option value="Tuesday">Tuesday ({getTeamCount('Tuesday')})</option>
                  <option value="Wednesday">Wednesday ({getTeamCount('Wednesday')})</option>
                  <option value="Thursday">Thursday ({getTeamCount('Thursday')})</option>
                  <option value="Friday">Friday ({getTeamCount('Friday')})</option>
                  <option value="Saturday">Saturday ({getTeamCount('Saturday')})</option>
                  <option value="Sunday">Sunday ({getTeamCount('Sunday')})</option>
                </select>
              </div>
            </div>
            
            <div className="teams-summary">
              <p>Showing {filteredTeams.length} teams {selectedNight !== 'all' ? `for ${selectedNight}` : 'across all nights'}</p>
            </div>
            
            {filteredTeams.length === 0 ? (
              <div className="no-data">No teams found {selectedNight !== 'all' ? `for ${selectedNight}` : ''}</div>
            ) : (
              <div className="teams-list">
                {filteredTeams.map(team => (
                  <div key={team.team_id} className="team-item">
                    <div className="team-content">
                      <h4>{team.team_name}</h4>
                      <p><strong>Captain:</strong> {team.captain_email}</p>
                      <p><strong>Night:</strong> {team.play_night || 'Not specified'}</p>
                      <p><strong>Status:</strong> {(team.registration_status || 'unassigned').charAt(0).toUpperCase() + (team.registration_status || 'unassigned').slice(1)}</p>
                      <p><strong>Registered:</strong> {new Date(team.registration_date).toLocaleDateString()}</p>
                      {team.payment_date && (
                        <p><strong>Paid:</strong> {new Date(team.payment_date).toLocaleDateString()}</p>
                      )}
                      <p><strong>Players:</strong> {team.players?.join(', ') || 'No players listed'}</p>
                    </div>
                    <div className="team-actions">
                      {(!team.registration_status || team.registration_status === 'unassigned') ? (
                        <div className="assign-season-controls">
                          <select
                            value={assignSelections[team.team_id] || ''}
                            onChange={(e) => setAssignSelections(prev => ({ ...prev, [team.team_id]: e.target.value }))}
                            className="assign-season-select"
                          >
                            <option value="">Select a season...</option>
                            {seasons.map(season => (
                              <option key={season.league_id} value={season.league_id}>
                                {season.name} — {season.season_name} ({season.play_night})
                              </option>
                            ))}
                          </select>
                          <button
                            className="status-button success"
                            onClick={() => handleAssignTeam(team.team_id)}
                          >
                            Assign
                          </button>
                        </div>
                      ) : team.registration_status === 'confirmed' ? (
                        <button
                          className="status-button warning"
                          onClick={() => handleUpdateTeamStatus(team.team_id, 'tentative')}
                        >
                          Mark as Tentative
                        </button>
                      ) : (
                        <button
                          className="status-button success"
                          onClick={() => handleUpdateTeamStatus(team.team_id, 'confirmed')}
                        >
                          Confirm Registration
                        </button>
                      )}
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteTeam(team.team_id)}
                      >
                        Delete Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="players-section">
            <div className="section-header">
              <h3>Player Pool</h3>
              <div className="player-count-badge">
                {players.length} Players
              </div>
            </div>
            
            {players.length === 0 ? (
              <div className="no-data">No players in the pool</div>
            ) : (
              <div className="players-list">
                {players.map(player => (
                  <div key={player.player_id} className="player-item">
                    <div className="player-content">
                      <h4>{player.name}</h4>
                      <p><strong>Email:</strong> {player.email}</p>
                      <p><strong>Skill Level:</strong> {player.skill_level}</p>
                      <p><strong>Available Nights:</strong> {player.play_nights.join(', ')}</p>
                      {player.bio && <p><strong>Bio:</strong> {player.bio}</p>}
                      <p><strong>Joined:</strong> {formatDate(player.created_at)}</p>
                    </div>
                    <div className="player-actions">
                      <button 
                        className="delete-button"
                        onClick={() => handleDeletePlayer(player.player_id, player.name)}
                      >
                        Remove Player
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'seasons' && (
          <div className="seasons-section">
            <div className="section-header">
              <h3>League Seasons</h3>
              <button 
                className="add-button"
                onClick={() => {
                  setEditingSeason(null);
                  setShowCreateSeasonModal(true);
                }}
              >
                Create New Season
              </button>
            </div>
            
            {seasons.length === 0 ? (
              <div className="no-data">No league seasons created</div>
            ) : (
              <div className="seasons-list">
                {seasons.map(season => (
                  <div key={season.league_id} className="season-item">
                    <div className="season-content">
                      <h4>{season.name} - {season.season_name}</h4>
                      <p><strong>Night:</strong> {season.play_night}</p>
                      <p><strong>Time:</strong> {season.play_time}</p>
                      <p><strong>Skill Cap:</strong> {season.skill_cap}</p>
                      <p><strong>Season:</strong> {new Date(season.season_start_date).toLocaleDateString()} - {new Date(season.season_end_date).toLocaleDateString()}</p>
                      {season.playoff_start_date && (
                        <p><strong>Playoffs:</strong> {new Date(season.playoff_start_date).toLocaleDateString()}</p>
                      )}
                      <p><strong>Max Teams:</strong> {season.max_teams}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status-badge ${season.is_active ? 'active' : 'inactive'}`}>
                          {season.is_active ? 'Active' : 'Ended'}
                        </span>
                        {season.registration_open && season.is_active && (
                          <span className="status-badge open"> Registration Open</span>
                        )}
                      </p>
                    </div>
                    <div className="season-actions">
                      <button 
                        className="status-button"
                        onClick={() => handleEditSeason(season)}
                      >
                        Edit Season
                      </button>
                      {season.is_active && (
                        <button 
                          className="status-button warning"
                          onClick={() => handleEndSeason(season.league_id, `${season.name} - ${season.season_name}`)}
                        >
                          End Season
                        </button>
                      )}
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteSeason(season.league_id, `${season.name} - ${season.season_name}`)}
                      >
                        Delete Season
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Season Modal */}
      {showCreateSeasonModal && (
        <CreateSeasonModal 
          onClose={() => {
            setShowCreateSeasonModal(false);
            setEditingSeason(null);
          }}
          onSubmit={handleSubmitSeason}
          editSeason={editingSeason}
        />
      )}
    </div>
  );
};

// Create Season Modal Component
const CreateSeasonModal = ({ onClose, onSubmit, editSeason = null }) => {
  const [formData, setFormData] = useState({
    name: editSeason?.name || '',
    season_name: editSeason?.season_name || '',
    play_night: editSeason?.play_night || '',
    play_time: editSeason?.play_time ? editSeason.play_time.slice(0, 5) : '19:00',
    skill_cap: editSeason?.skill_cap || 3000,
    season_start_date: editSeason?.season_start_date ? editSeason.season_start_date.split('T')[0] : '',
    season_end_date: editSeason?.season_end_date ? editSeason.season_end_date.split('T')[0] : '',
    playoff_start_date: editSeason?.playoff_start_date ? editSeason.playoff_start_date.split('T')[0] : '',
    max_teams: editSeason?.max_teams || 8,
    tables_reserved: editSeason?.tables_reserved || 4,
    table_type: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editSeason) {
      onSubmit(formData, editSeason.league_id);
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content create-season-modal">
        <h2>{editSeason ? 'Edit League Season' : 'Create New League Season'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">League Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Monday Beginner League"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="season_name">Season Name:</label>
              <input
                type="text"
                id="season_name"
                name="season_name"
                value={formData.season_name}
                onChange={handleChange}
                placeholder="e.g. Fall 2024"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="play_night">Play Night:</label>
              <select
                id="play_night"
                name="play_night"
                value={formData.play_night}
                onChange={handleChange}
                required
              >
                <option value="">Select Night</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="play_time">Start Time:</label>
              <input
                type="time"
                id="play_time"
                name="play_time"
                value={formData.play_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="skill_cap">Skill Cap:</label>
              <input
                type="number"
                id="skill_cap"
                name="skill_cap"
                value={formData.skill_cap}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="season_start_date">Season Start Date:</label>
              <input
                type="date"
                id="season_start_date"
                name="season_start_date"
                value={formData.season_start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="season_end_date">Season End Date:</label>
              <input
                type="date"
                id="season_end_date"
                name="season_end_date"
                value={formData.season_end_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="playoff_start_date">Playoff Start Date (Optional):</label>
              <input
                type="date"
                id="playoff_start_date"
                name="playoff_start_date"
                value={formData.playoff_start_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max_teams">Max Teams:</label>
              <input
                type="number"
                id="max_teams"
                name="max_teams"
                value={formData.max_teams}
                onChange={handleChange}
                min="4"
                max="16"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tables_reserved">Tables Reserved:</label>
              <input
                type="number"
                id="tables_reserved"
                name="tables_reserved"
                value={formData.tables_reserved}
                onChange={handleChange}
                min="2"
                max="8"
                required
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {editSeason ? 'Update Season' : 'Create Season'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeagueManagement;