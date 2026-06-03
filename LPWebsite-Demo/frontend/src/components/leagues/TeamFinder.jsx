import React, { useState, useEffect } from 'react';
import PlayerSignup from './PlayerSignup';
import PlayerCard from './PlayerCard';
import ModifyProfile from './ModifyProfile';
import './TeamFinder.css';

const TeamFinder = () => {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [selectedNights, setSelectedNights] = useState([]);
  const [selectedSkillLevels, setSelectedSkillLevels] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    email: '',
    password: ''
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [message, setMessage] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  
  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  const availableNights = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  const skillLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Semi-pro'
  ];

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      if (data.success) {
        setPlayers(data.players);
      } else {
        throw new Error(data.error || 'Failed to fetch players');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    return players.filter(player => {
      // If no filters are selected, show all players
      if (selectedNights.length === 0 && selectedSkillLevels.length === 0) {
        return true;
      }

      // Check if player matches selected nights
      const matchesNights = selectedNights.length === 0 || 
        selectedNights.some(night => player.play_nights.includes(night));

      // Check if player matches selected skill levels
      const matchesSkill = selectedSkillLevels.length === 0 || 
        selectedSkillLevels.includes(player.skill_level);

      return matchesNights && matchesSkill;
    });
  };

  const handleNightFilter = (night) => {
    setSelectedNights(prev => 
      prev.includes(night)
        ? prev.filter(n => n !== night)
        : [...prev, night]
    );
  };

  const handleSkillFilter = (skill) => {
    setSelectedSkillLevels(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleProfileLookup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/players/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          password: profileData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowProfileEditor(true);
        setPlayerId(data.playerId);
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid email or password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error authenticating user' });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/players/password-reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetMessage({ type: 'success', text: data.message });
        setResetEmail('');
      } else {
        setResetMessage({ type: 'error', text: data.error || 'Error sending password reset email' });
      }
    } catch (error) {
      setResetMessage({ type: 'error', text: 'Error sending password reset email' });
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmail('');
    setResetMessage(null);
  };


  const renderTeamFinderContent = () => (
    <>
      <div className="team-finder-header">
        <h1>Find Your Perfect Team</h1>
        <p>
          Connect with other players and find the perfect team match. Whether you're looking to join
          an existing team or create a new one, this is your starting point.
        </p>
        <button 
          className="create-profile-button"
          onClick={() => setShowSignupForm(true)}
        >
          Create Player Profile
        </button>
      </div>

      <div className="teamfinder__content">
        <div className="teamfinder__players-section">
          <div className="teamfinder__players-header">
            <h2>Available Players</h2>
            <div className="teamfinder__active-filters">
              {selectedNights.length > 0 && (
                <div className="teamfinder__filter-tag">
                  Nights: {selectedNights.join(', ')}
                </div>
              )}
              {selectedSkillLevels.length > 0 && (
                <div className="teamfinder__filter-tag">
                  Skills: {selectedSkillLevels.join(', ')}
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="teamfinder__players-placeholder">Loading players...</div>
          ) : error ? (
            <div className="teamfinder__error-message">Error: {error}</div>
          ) : filterPlayers().length === 0 ? (
            <div className="teamfinder__players-placeholder">
              No players found matching your criteria
            </div>
          ) : (
            <div className="teamfinder__players-list">
              {filterPlayers().map(player => (
                <PlayerCard key={player.player_id} player={player} />
              ))}
            </div>
          )}
        </div>

        <div className="teamfinder__info-section">
          <div className="teamfinder__filter-card">
            <h3>Filter Players</h3>
            <div className="teamfinder__filter-sections">
              <div className="teamfinder__filter-section">
                <div className="teamfinder__filter-category">
                  <h4>Availability</h4>
                  <div className="teamfinder__nights-container">
                    {availableNights.map(night => (
                      <label key={night} className="teamfinder__checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedNights.includes(night)}
                          onChange={() => handleNightFilter(night)}
                        />
                        <span>{night}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="teamfinder__filter-section">
                <div className="teamfinder__filter-category">
                  <h4>Skill Level</h4>
                  <div className="teamfinder__skill-container">
                    {skillLevels.map(skill => (
                      <label key={skill} className="teamfinder__checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedSkillLevels.includes(skill)}
                          onChange={() => handleSkillFilter(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="teamfinder__profile-manager-card">
            <h3>Manage Your Profile</h3>
            {!showForgotPassword ? (
              <form onSubmit={handleProfileLookup}>
                <div className="teamfinder__form-group">
                  <label htmlFor="email">
                    Email:
                    <div className="teamfinder__info-icon-container">
                      <span className="teamfinder__info-icon">i</span>
                      <span className="teamfinder__tooltip">
                        Use the email and password you created your account with
                      </span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className="teamfinder__form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    value={profileData.password}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    required
                  />
                </div>
                <button type="submit" className="lookup-button">
                  Access My Profile
                </button>
                <div className="profile-login-footer">
                  <button 
                    type="button" 
                    className="forgot-password-link"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="forgot-password-form">
                <div className="forgot-password-content">
                  <p className="forgot-password-text">
                    Enter your email address and we'll send you a password reset link.
                  </p>
                  <p className="contact-text">
                    If you've forgotten your email, please contact the business owners for assistance.
                  </p>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="reset-email-input"
                  />
                  <div className="reset-buttons">
                    <button type="submit" className="send-reset-button">
                      Send Reset Link
                    </button>
                    <button 
                      type="button" 
                      className="back-to-login-button"
                      onClick={handleBackToLogin}
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              </form>
            )}
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            {resetMessage && (
              <div className={`message ${resetMessage.type}`}>
                {resetMessage.text}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );

  const renderSignupForm = () => (
    <PlayerSignup 
      onClose={() => setShowSignupForm(false)}
      onComplete={() => {
        setShowSignupForm(false);
        fetchPlayers();
      }}
    />
  );

  return (
    <div className="team-finder-page">
      <div className="team-finder-container">
        {showProfileEditor ? (
          <ModifyProfile
            playerId={playerId}
            onClose={() => {
              setShowProfileEditor(false);
              setProfileData({ email: '', password: '' });
            }}
            onProfileUpdate={fetchPlayers}
          />
        ) : showSignupForm ? (
          renderSignupForm()
        ) : (
          renderTeamFinderContent()
        )}
      </div>
    </div>
  );
};

export default TeamFinder;