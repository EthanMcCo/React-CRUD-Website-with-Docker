import React, { useState, useEffect } from 'react';
import './PlayerPoolManagement.css';

const PlayerPoolManagement = () => {
  const [players, setPlayers] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
          fetchPlayers(); // Refresh the list
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

  const showAlert = (type, message) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="content-section loading">Loading player pool...</div>;
  }

  return (
    <div className="content-section">
      <div className="content-header">
        <h2>Player Pool Management</h2>
        <div className="player-count">
          Total Players: {players.length}
        </div>
      </div>
      
      {alertMessage && (
        <div className={`alert ${alertMessage.type}`}>
          {alertMessage.message}
        </div>
      )}
      
      {players.length === 0 ? (
        <div className="no-players">No players in the pool</div>
      ) : (
        <div className="admin-players-list">
          {players.map(player => (
            <div key={player.player_id} className="admin-player-item">
              <div className="admin-player-content">
                <h3>{player.name}</h3>
                <p><strong>Email:</strong> {player.email}</p>
                <p><strong>Skill Level:</strong> {player.skill_level}</p>
                <p><strong>Available Nights:</strong> {player.play_nights.join(', ')}</p>
                {player.bio && <p><strong>Bio:</strong> {player.bio}</p>}
                <p><strong>Joined:</strong> {formatDate(player.created_at)}</p>
              </div>
              <div className="admin-player-actions">
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
  );
};

export default PlayerPoolManagement;