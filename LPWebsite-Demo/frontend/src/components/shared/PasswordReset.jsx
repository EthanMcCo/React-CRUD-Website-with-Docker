import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PasswordReset.css';

const PasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [resetType, setResetType] = useState(''); // 'team' or 'player'

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const tokenParam = urlParams.get('token');
    const typeParam = urlParams.get('type');

    if (!tokenParam || !typeParam || !['team', 'player'].includes(typeParam)) {
      setMessage({
        type: 'error',
        text: 'Invalid or missing reset link parameters. Please request a new password reset.'
      });
      return;
    }

    setToken(tokenParam);
    setResetType(typeParam);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return;
    }

    if (password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long'
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = resetType === 'team' 
        ? '/api/teams/password-reset-complete'
        : '/api/players/password-reset-complete';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: 'Password reset successfully! You can now log in with your new password.'
        });
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to appropriate page after 3 seconds
        setTimeout(() => {
          if (resetType === 'team') {
            navigate('/leagues/registration');
          } else {
            navigate('/leagues/team-finder');
          }
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error resetting password'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error resetting password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    return resetType === 'team' ? 'Reset Team Captain Password' : 'Reset Player Password';
  };

  const getRedirectText = () => {
    return resetType === 'team' 
      ? 'You will be redirected to the team registration page...'
      : 'You will be redirected to the team finder page...';
  };

  return (
    <div className="password-reset-page">
      <div className="password-reset-container">
        <div className="password-reset-card">
          <h1>{getPageTitle()}</h1>
          
          {!token || !resetType ? (
            <div className="error-state">
              <p>Invalid reset link. Please request a new password reset.</p>
              <button 
                className="back-button"
                onClick={() => navigate('/leagues/registration')}
              >
                Go to League Registration
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="password-reset-form">
              <div className="form-group">
                <label htmlFor="password">New Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="reset-submit-button"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {message && (
            <div className={`reset-message ${message.type}`}>
              {message.text}
              {message.type === 'success' && (
                <p className="redirect-text">{getRedirectText()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;