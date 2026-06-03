import React, { useState, useEffect } from 'react';
import PlayerInputs from './PlayerInputs';
import TeamListItem from './TeamListItem';
import ContactForm from '../contact/ContactForm';
import TeamLoginModal from './TeamLoginModal';
import TeamRosterModal from './TeamRosterModal';
import './LeagueRegistration.css';

const LeagueRegistration = () => {
  const [selectedNight, setSelectedNight] = useState('all');
  const [players, setPlayers] = useState(['']);
  const [message, setMessage] = useState(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [teams, setTeams] = useState({
    tentative: [],
    registered: []
  });
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);

  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Team captain login states
  const [showTeamLoginModal, setShowTeamLoginModal] = useState(false);
  const [teamMessage, setTeamMessage] = useState(null);
  const [authenticatedTeam, setAuthenticatedTeam] = useState(null);
  const [teamData, setTeamData] = useState({
    email: '',
    password: ''
  });
  
  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  // Team roster modal states
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [selectedRosterTeam, setSelectedRosterTeam] = useState(null);

  const handleContactClick = (team) => {
    setSelectedTeam(team);
    setContactFormOpen(true);
  };

  const handleViewRoster = (team) => {
    setSelectedRosterTeam(team);
    setShowRosterModal(true);
  };

  const handleCloseRosterModal = () => {
    setShowRosterModal(false);
    setSelectedRosterTeam(null);
  };

  const [formData, setFormData] = useState({
    teamName: '',
    captainEmail: '',
    league_id: '',
    night: '', // Keep for backward compatibility
    contactByPlayers: false,
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchAvailableLeagues();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams/league-teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setMessage({
        type: 'error',
        text: 'Error loading teams. Please try again.'
      });
    }
  };

  const fetchAvailableLeagues = async () => {
    try {
      setLeaguesLoading(true);
      const response = await fetch('/api/teams/available-leagues');
      if (!response.ok) throw new Error('Failed to fetch leagues');
      const data = await response.json();
      if (data.success) {
        setAvailableLeagues(data.leagues);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setMessage({
        type: 'error',
        text: 'Error loading league information. Please try again.'
      });
    } finally {
      setLeaguesLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      setIsMessageVisible(true);
      const timer = setTimeout(() => {
        setIsMessageVisible(false);
        setTimeout(() => {
          setMessage(null);
        }, 500);
      }, [message]);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'league_id') {
      // When league is selected, also store the play night for backend compatibility
      const selectedLeague = availableLeagues.find(league => league.league_id.toString() === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        night: selectedLeague ? selectedLeague.play_night : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password fields
    if (formData.password.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/teams/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: formData.teamName,
          captainEmail: formData.captainEmail,
          league_id: formData.league_id,
          players: players.filter(player => player.trim() !== ''),
          contactByPlayers: formData.contactByPlayers,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Network response was not ok');
      }

      setFormData({
        teamName: '',
        captainEmail: '',
        league_id: '',
        night: '',
        contactByPlayers: false,
        password: '',
        confirmPassword: ''
      });
      setPlayers(['']);
      
      setMessage({
        type: 'success',
        text: 'Team Registration Successful'
      });

      // Fetch updated teams list
      fetchTeams();
    } catch (error) {
      console.error('Error registering team:', error);
      setMessage({
        type: 'error',
        text: 'Error registering team. Please try again.'
      });
    }
  };

  const filterTeams = (teamList) => {
    if (selectedNight === 'all') return teamList;
    return teamList.filter(team => team.play_night === selectedNight);
  };

  const handleTeamLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: teamData.email,
          password: teamData.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthenticatedTeam(data.team);
        setShowTeamLoginModal(true);
        setTeamMessage({ type: 'success', text: 'Login successful!' });
      } else {
        setTeamMessage({ type: 'error', text: data.error || 'Invalid email or password' });
      }
    } catch (error) {
      setTeamMessage({ type: 'error', text: 'Error authenticating team' });
    }
  };

  const handleTeamLoginSuccess = (team) => {
    console.log('Team login successful:', team);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/teams/password-reset-request', {
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

  return (
    <div className="league-registration">
      {/* Message appears outside container for proper positioning */}
      {message && (
        <div className={`message ${message.type} ${!isMessageVisible ? 'fade-out' : ''}`}>
          {message.text}
        </div>
      )}

      {/* Main container wrapper */}
      <div className="league-registration-container">
        {/* Header Section */}
        <header className="league-header">
          <h1>League Registration</h1>
          <p>
            Join our competitive pool leagues! Register your team, find players, or connect with existing teams looking for new members.
          </p>
        </header>


        {/* Main content grid */}
        <div className="registration-container">
          {/* Left side - Team lists */}
          <div className="left-container">
            {/* Night Selection Filter */}
            <div className="night-filter-section">
              <label htmlFor="night-filter">Filter Teams by Night:</label>
              <select 
                id="night-filter"
                value={selectedNight} 
                onChange={(e) => setSelectedNight(e.target.value)}
                className="night-select"
              >
                <option value="all">All Nights</option>
                {[...new Set(availableLeagues.map(league => league.play_night))].map(night => (
                  <option key={night} value={night}>{night}</option>
                ))}
              </select>
            </div>
            {/* Reserved Teams */}
            <div className="registration-box">
              <div className="section-header-with-info">
                <h2>Reserved Teams</h2>
                <div className="info-icon-container">
                  <span className="info-icon">i</span>
                  <span className="team-section-tooltip">
                    These teams have paid their $200 deposit and secured their spot for this night of play.
                  </span>
                </div>
              </div>
              <div className="teams-list-container">
                {filterTeams(teams.registered).map(team => (
                  <TeamListItem 
                      key={team.team_id}
                      teamName={team.team_name}
                      canContact={team.accepting_new_players === 1}
                      onContactClick={() => handleContactClick(team)}
                      onViewRoster={() => handleViewRoster(team)}
                      playNight={team.play_night}
                  />
                ))}
                {filterTeams(teams.registered).length === 0 && (
                  <p className="no-teams">No teams reserved for this night</p>
                )}
              </div>
            </div>
            
            {/* Tentative Teams */}
            <div className="registration-box">
              <div className="section-header-with-info">
                <h2>Tentative Teams</h2>
                <div className="info-icon-container">
                  <span className="info-icon">i</span>
                  <span className="team-section-tooltip">
                    These teams have signed up but have not yet paid their deposit. A team is only reserved once they have paid their $200 deposit.
                  </span>
                </div>
              </div>
              <div className="teams-list-container">
                {filterTeams(teams.tentative).map(team => (
                  <TeamListItem 
                      key={team.team_id}
                      teamName={team.team_name}
                      canContact={team.accepting_new_players === 1}
                      onContactClick={() => handleContactClick(team)}
                      onViewRoster={() => handleViewRoster(team)}
                      playNight={team.play_night}
                  />
                ))}
                {filterTeams(teams.tentative).length === 0 && (
                  <p className="no-teams">No tentative teams for this night</p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Registration and Login forms */}
          <div className="right-side-container">
            {/* Team Captain Login */}
            <div className="captain-login-section">
              <div className="captain-header-with-info">
                <h3>Team Captain Login</h3>
                <div className="info-icon-container">
                  <span className="info-icon">i</span>
                  <span className="team-section-tooltip">
                    Use the email and password you created when registering your team to make changes to your roster/team name.
                  </span>
                </div>
              </div>
              {!showForgotPassword ? (
                <form onSubmit={handleTeamLogin}>
                  <div className="login-row">
                    <input
                      type="email"
                      placeholder="Captain Email"
                      value={teamData.email}
                      onChange={(e) => setTeamData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                      className="login-input"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={teamData.password}
                      onChange={(e) => setTeamData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      required
                      className="login-input"
                    />
                    <button type="submit" className="league-login-button">
                      Manage Team
                    </button>
                  </div>
                  <div className="login-footer">
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
                      Enter your captain email address and we'll send you a password reset link.
                    </p>
                    <p className="contact-text">
                      If you've forgotten your email, please contact the business owners for assistance.
                    </p>
                    <input
                      type="email"
                      placeholder="Captain Email"
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
              {teamMessage && (
                <div className={`captain-message ${teamMessage.type}`}>
                  {teamMessage.text}
                </div>
              )}
              {resetMessage && (
                <div className={`captain-message ${resetMessage.type}`}>
                  {resetMessage.text}
                </div>
              )}
            </div>

            {/* Team Registration Form */}
            <div className="signup-box">
              <h2>Team Registration</h2>
          
            <form onSubmit={handleSubmit} className="registration-form">
              <div className="league-form-group">
                <label htmlFor="teamName">Team Name:</label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="league-form-group">
                <label htmlFor="captainEmail">Captains Email:</label>
                <input
                  type="email"
                  id="captainEmail"
                  name="captainEmail"
                  value={formData.captainEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="league-form-group">
                <label htmlFor="league_id">League:</label>
                <select
                  id="league_id"
                  name="league_id"
                  value={formData.league_id}
                  onChange={handleInputChange}
                  required
                  className="league-select"
                >
                  <option value="">Select a league</option>
                  {availableLeagues.map(league => (
                    <option key={league.league_id} value={league.league_id}>
                      {league.name} - {league.season_name} ({league.play_night} {league.play_time.slice(0, 5)} | Skill Cap: {league.skill_cap} | {league.spots_remaining}/{league.max_teams} spots)
                    </option>
                  ))}
                </select>
                {leaguesLoading && (
                  <p className="no-leagues-message">Loading leagues...</p>
                )}
                {!leaguesLoading && availableLeagues.length === 0 && (
                  <p className="no-leagues-message">No leagues currently accepting registrations</p>
                )}
              </div>

              <div className="league-form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div className="league-form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                />
              </div>

              <div className="league-form-group">
                <label>Players:</label>
                <PlayerInputs players={players} setPlayers={setPlayers} />
              </div>

              <div className="league-form-group checkbox-group">
                <div className="checkbox-label-container">
                  <input
                    type="checkbox"
                    name="contactByPlayers"
                    checked={formData.contactByPlayers}
                    onChange={handleInputChange}
                  />
                  <span>Allow players to contact you about joining?</span>
                </div>
                <div className="info-icon-container">
                  <span className="info-icon">i</span>
                  <span className="team-section-tooltip">
                    By checking this box, you agree to let other players contact you about joining your team. Your email will not be displayed to them until you respond.
                  </span>
                </div>
              </div>

              <button type="submit" className="league-submit-button">
                Submit
              </button>
            </form>
            </div>

          </div>
        </div>

        {/* FAQ Section - now inside main container */}
        <div className="league-faq-section-responsive">
          <p className="faq-text">Have questions about how our leagues work?</p>
          <a href="/about/faq?category=Leagues" className="faq-link-button">
            Check out our League FAQ
          </a>
        </div>
      </div>

      {/* Contact form modal - appears outside main flow */}
      {selectedTeam && (
        <ContactForm 
          recipientName={selectedTeam.team_name}
          recipientId={selectedTeam.team_id}
          recipientType="team"
          messagePlaceholder="Tell the team a bit about yourself..."
          isOpen={contactFormOpen}
          onClose={() => {
            setContactFormOpen(false);
            setSelectedTeam(null);
          }}
        />
      )}

      {/* Team Login Modal */}
      <TeamLoginModal
        isOpen={showTeamLoginModal}
        onClose={() => {
          setShowTeamLoginModal(false);
          setTeamData({ email: '', password: '' });
          setTeamMessage(null);
          setAuthenticatedTeam(null);
        }}
        onLoginSuccess={handleTeamLoginSuccess}
        preAuthenticatedTeam={authenticatedTeam}
      />

      {/* Team Roster Modal */}
      <TeamRosterModal
        isOpen={showRosterModal}
        onClose={handleCloseRosterModal}
        teamId={selectedRosterTeam?.team_id}
        teamName={selectedRosterTeam?.team_name}
      />
    </div>
  );
};

export default LeagueRegistration;