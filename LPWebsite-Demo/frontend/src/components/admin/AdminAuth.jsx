import React, { useState } from 'react';
import './AdminAuth.css';

const AdminAuth = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin();
        setError('');
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__container">
        <h1 className="admin-auth__title">Admin Login</h1>
        <form onSubmit={handleSubmit} className="admin-auth__form">
          <div className="admin-auth__field">
            <label htmlFor="username" className="admin-auth__label">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-auth__input"
              required
            />
          </div>
          <div className="admin-auth__field">
            <label htmlFor="password" className="admin-auth__label">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-auth__input"
              required
            />
          </div>
          {error && <div className="admin-auth__error">{error}</div>}
          <button type="submit" className="admin-auth__submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth;