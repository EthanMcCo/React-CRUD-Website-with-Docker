import React from 'react';

const PlayerInputs = ({ players, setPlayers }) => {
  const addPlayer = () => {
    setPlayers([...players, '']);
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const removePlayer = (index) => {
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  return (
    <div className="players-container">
      {players.map((player, index) => (
        <div key={index} className="player-input-group">
          <div className="player-input-with-remove">
            <input
              type="text"
              value={player}
              placeholder={`Player ${index + 1}`}
              onChange={(e) => handlePlayerChange(index, e.target.value)}
              className="player-input"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removePlayer(index)}
                className="remove-player-button"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addPlayer}
        className="add-player-button"
      >
        + Add Another Player
      </button>
    </div>
  );
};

export default PlayerInputs;