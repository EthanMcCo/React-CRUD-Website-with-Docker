import React, { useState, useEffect, useCallback } from 'react';
import './ModifyProfile.css';

const ModifyProfile = ({ playerId, onClose, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState({
    bio: '',
    skillLevel: '',
    playNights: []
  });
  const [message, setMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const skillLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional'
  ];

  const availableNights = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ];

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/players/${playerId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileData({
          bio: data.player.bio || '',
          skillLevel: data.player.skill_level,
          playNights: data.player.play_nights || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [playerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (profileData.playNights.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one available night' });
      return;
    }

    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        if (onProfileUpdate) onProfileUpdate();
        onClose();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating profile' });
    }
  };

  const handleDelete = async () => {
    if (isDeleting) {
      try {
        const response = await fetch(`/api/players/${playerId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          if (onProfileUpdate) onProfileUpdate();
          onClose();
        } else {
          setMessage({ type: 'error', text: data.error });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting profile' });
      }
    } else {
      setIsDeleting(true);
      setMessage({ 
        type: 'warning', 
        text: 'Are you sure? Click delete again to confirm.' 
      });
    }
  };

  const handleNightToggle = (night) => {
    setProfileData(prev => ({
      ...prev,
      playNights: prev.playNights.includes(night)
        ? prev.playNights.filter(n => n !== night)
        : [...prev.playNights, night]
    }));
  };

  return (
    <div className="modify-profile-container">
      <div className="profile-header">
        <h2>Modify Your Profile</h2>
        <button 
          className="close-button"
          onClick={onClose}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="skillLevel">Skill Level:</label>
          <select
            id="skillLevel"
            value={profileData.skillLevel}
            onChange={(e) => setProfileData(prev => ({
              ...prev,
              skillLevel: e.target.value
            }))}
            required
          >
            <option value="">Select Skill Level</option>
            {skillLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Available Nights:</label>
          <div className="nights-container">
            {availableNights.map(night => (
              <label key={night} className="night-checkbox">
                <input
                  type="checkbox"
                  checked={profileData.playNights.includes(night)}
                  onChange={() => handleNightToggle(night)}
                />
                <span>{night}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({
              ...prev,
              bio: e.target.value
            }))}
            placeholder="Tell others about yourself..."
            maxLength={500}
            rows={4}
          />
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="button-group">
          <button type="submit" className="save-button">
            Save Changes
          </button>
          <button 
            type="button" 
            className="delete-button"
            onClick={handleDelete}
          >
            {isDeleting ? 'Confirm Delete' : 'Delete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyProfile;