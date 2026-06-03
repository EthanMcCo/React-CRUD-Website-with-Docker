import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    captain_name: '',
    captain_email: ''
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/teams')
      .then(response => response.json())
      .then(data => setTeams(data))
      .catch(error => setMessage('Error loading teams'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch('http://localhost:5000/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTeam)
    })
      .then(response => response.json())
      .then(data => {
        setMessage('Team added successfully!');
        setNewTeam({ name: '', captain_name: '', captain_email: '' });
        // Reload teams
        fetch('http://localhost:5000/api/teams')
          .then(response => response.json())
          .then(data => setTeams(data));
      })
      .catch(error => setMessage('Error adding team'));
  };

  const handleChange = (e) => {
    setNewTeam({
      ...newTeam,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">
      <h1>Billiards Teams</h1>
      
      <section>
        <h2>Add New Team</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Team Name:</label>
            <input
              type="text"
              name="name"
              value={newTeam.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Captain Name:</label>
            <input
              type="text"
              name="captain_name"
              value={newTeam.captain_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Captain Email:</label>
            <input
              type="email"
              name="captain_email"
              value={newTeam.captain_email}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Add Team</button>
        </form>
        {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>}
      </section>

      <section className="teams-list">
        <h2>Existing Teams</h2>
        {teams.map(team => (
          <div key={team.team_id} className="team-card">
            <h3>{team.name}</h3>
            <p className="team-info">Captain: {team.captain_name}</p>
            <p className="team-info">Email: {team.captain_email}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;