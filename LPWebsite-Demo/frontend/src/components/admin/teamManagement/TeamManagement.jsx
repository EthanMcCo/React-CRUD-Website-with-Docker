import React, { useState, useEffect, useCallback } from 'react';
import './TeamManagement.css';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNight, setSelectedNight] = useState('all');

  const fetchTeams = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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

  if (loading) {
    return <div className="content-section loading">Loading teams...</div>;
  }

  const filteredTeams = filterTeams(teams);

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>Team Management</h2>
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
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}
      
      <div className="teams-summary">
        <p>Showing {filteredTeams.length} teams {selectedNight !== 'all' ? `for ${selectedNight}` : 'across all nights'}</p>
      </div>
      
      {filteredTeams.length === 0 ? (
        <div className="no-teams">No teams found {selectedNight !== 'all' ? `for ${selectedNight}` : ''}</div>
      ) : (
        <div className="admin-team-list">
          {filteredTeams.map(team => (
            <div key={team.team_id} className="admin-team-item">
              <div className="admin-team-content">
                <h3>{team.team_name}</h3>
                <p><strong>Captain Email:</strong> {team.captain_email}</p>
                <p><strong>Play Night:</strong> {team.play_night || 'Not specified'}</p>
                <p><strong>Status:</strong> {(team.registration_status || 'unassigned').charAt(0).toUpperCase() + (team.registration_status || 'unassigned').slice(1)}</p>
                <p><strong>Registration Date:</strong> {new Date(team.registration_date).toLocaleDateString()}</p>
                {team.payment_date && (
                  <p><strong>Payment Date:</strong> {new Date(team.payment_date).toLocaleDateString()}</p>
                )}
                <p><strong>Players:</strong> {team.players?.join(', ') || 'No players listed'}</p>
              </div>
              <div className="admin-team-actions">
                {(!team.registration_status || team.registration_status === 'unassigned') ? (
                  <span className="unassigned-note">No active season — assign or delete</span>
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
  );
};

export default TeamManagement;