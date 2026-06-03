import React, { useState } from 'react';
import './PlayerSignup.css';

const PlayerSignup = ({ onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    skillLevel: '',
    playNights: []
  });
  const [message, setMessage] = useState(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const availableNights = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  const skillLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional'
  ];

  const validatePassword = () => {
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.playNights.length === 0) {
      showMessage('error', 'Please select at least one night');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      showMessage('error', passwordError);
      return;
    }

    try {
      const response = await fetch('/api/players/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          skillLevel: formData.skillLevel,
          playNights: formData.playNights,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      showMessage('success', 'Profile created successfully!');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNightToggle = (night) => {
    setFormData(prev => ({
      ...prev,
      playNights: prev.playNights.includes(night)
        ? prev.playNights.filter(n => n !== night)
        : [...prev.playNights, night]
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setIsMessageVisible(true);
    setTimeout(() => {
      setIsMessageVisible(false);
      setTimeout(() => setMessage(null), 500);
    }, 3000);
  };

  return (
    <div className="player-signup-container">
      <div className="signup-form-header">
        <h2>Create Your Player Profile</h2>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      {message && (
        <div className={`message ${message.type} ${!isMessageVisible ? 'fade-out' : ''}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="player-signup-form">
        <div className="pSignup-form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="pSignup-form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="pSignup-form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="8"
          />
          <small className="form-help-text">Must be at least 8 characters long</small>
        </div>

        <div className="pSignup-form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="pSignup-form-group">
          <label htmlFor="skillLevel">Skill Level:</label>
          <select
            id="skillLevel"
            name="skillLevel"
            value={formData.skillLevel}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Skill Level</option>
            {skillLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="pSignup-form-group">
          <label>Available Nights:</label>
          <div className="nights-container">
            {availableNights.map(night => (
              <label key={night} className="night-checkbox">
                <input
                  type="checkbox"
                  checked={formData.playNights.includes(night)}
                  onChange={() => handleNightToggle(night)}
                />
                {night}
              </label>
            ))}
          </div>
        </div>

        <div className="pSignup-form-group">
          <label htmlFor="bio">Bio (optional):</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell others a bit about yourself..."
            maxLength={500}
          />
        </div>

        <button type="submit" className="submit-button">
          Create Profile
        </button>
      </form>
    </div>
  );
};

export default PlayerSignup;