const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//get all league teams
router.get('/league-teams', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT
        t.team_id,
        t.name as team_name,
        t.accepting_new_players,
        tlr.registration_status,
        tlr.league_id,
        l.play_night
      FROM Team t
      INNER JOIN TeamLeagueRegistration tlr ON t.team_id = tlr.team_id
      INNER JOIN League l ON tlr.league_id = l.league_id
      ORDER BY t.team_id DESC
    `);

    //group teams by status
    const groupedTeams = {
      tentative: teams.filter(team => !team.registration_status || team.registration_status === 'tentative'),
      registered: teams.filter(team => team.registration_status === 'confirmed')
    };

    res.json(groupedTeams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: err.message });
  }
});

//get detailed team information for admin panel
router.get('/admin/teams', async (req, res) => {
  try {
    const [teams] = await pool.query(`
      SELECT
        t.team_id,
        t.name as team_name,
        t.captain_email,
        t.accepting_new_players,
        COALESCE(tlr.registration_status, 'unassigned') as registration_status,
        tlr.registration_date,
        tlr.payment_date,
        l.play_night,
        l.league_id,
        GROUP_CONCAT(tp.player_name) as players
      FROM Team t
      LEFT JOIN TeamLeagueRegistration tlr ON t.team_id = tlr.team_id
      LEFT JOIN League l ON tlr.league_id = l.league_id
      LEFT JOIN TeamPlayer tp ON t.team_id = tp.team_id
      GROUP BY t.team_id
      ORDER BY tlr.registration_date DESC
    `);

    res.json({
      success: true,
      teams: teams.map(team => ({
        ...team,
        players: team.players ? team.players.split(',') : []
      }))
    });
  } catch (err) {
    console.error('Error fetching teams for admin:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

//assign team to a league season (admin)
router.put('/admin/teams/:teamId/assign', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { teamId } = req.params;
    const { league_id } = req.body;

    if (!league_id) {
      return res.status(400).json({ success: false, error: 'league_id is required' });
    }

    await connection.beginTransaction();

    // Verify the league exists
    const [leagues] = await connection.query(
      'SELECT league_id FROM League WHERE league_id = ?',
      [league_id]
    );
    if (leagues.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'League season not found' });
    }

    // Remove any existing registration for this team, then insert new one
    await connection.query('DELETE FROM TeamLeagueRegistration WHERE team_id = ?', [teamId]);
    await connection.query(
      'INSERT INTO TeamLeagueRegistration (team_id, league_id, registration_status, registration_date) VALUES (?, ?, ?, CURDATE())',
      [teamId, league_id, 'tentative']
    );

    await connection.commit();
    res.json({ success: true, message: 'Team assigned to season successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Error assigning team to season:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

//update team registration status (admin)
router.put('/admin/teams/:teamId/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId } = req.params;
    const { status } = req.body;

    if (!['tentative', 'confirmed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be either "tentative" or "confirmed"'
      });
    }

    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      `UPDATE TeamLeagueRegistration 
       SET registration_status = ?,
           payment_date = CASE 
             WHEN ? = 'confirmed' THEN CURDATE()
             ELSE NULL
           END
       WHERE team_id = ?`,
      [status, status, teamId]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Team registration not found'
      });
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: `Team registration status updated to ${status}`
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error updating team status:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//delete team (admin)
router.delete('/admin/teams/:teamId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId } = req.params;

    await connection.beginTransaction();

    console.log(`Admin deleting team ID: ${teamId}`);

    //delete contact requests first (most likely to cause FK constraint issues)
    await connection.query(
      'DELETE FROM ContactRequest WHERE team_id = ?',
      [teamId]
    );

    //delete team players
    await connection.query(
      'DELETE FROM TeamPlayer WHERE team_id = ?',
      [teamId]
    );

    //delete team league registrations
    await connection.query(
      'DELETE FROM TeamLeagueRegistration WHERE team_id = ?',
      [teamId]
    );

    //delete the team
    const [deleteResult] = await connection.query(
      'DELETE FROM Team WHERE team_id = ?',
      [teamId]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Team and related records deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error deleting team:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//register a new team with players
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamName, captainEmail, league_id, players, contactByPlayers, password } = req.body;
    
    // Validate required fields
    if (!teamName || !captainEmail || !league_id || !players || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if email already exists (case insensitive)
    const [existingTeam] = await connection.query(
      'SELECT team_id FROM Team WHERE LOWER(captain_email) = LOWER(?)',
      [captainEmail]
    );

    if (existingTeam.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'A team with this captain email already exists'
      });
    }

    // Hash the password
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    await connection.beginTransaction();
    
    console.log('Received registration request:', {
      teamName,
      captainEmail,
      league_id,
      playerCount: players.length,
      contactByPlayers
    });

    //find the specific league and validate it's active and accepting registrations
    const [leagues] = await connection.query(`
      SELECT league_id, name, season_name, skill_cap, max_teams, play_night,
             is_active, registration_open, season_start_date, season_end_date
      FROM League 
      WHERE league_id = ?
        AND is_active = TRUE 
        AND registration_open = TRUE
        AND (season_end_date IS NULL OR season_end_date >= CURDATE())
    `, [league_id]);

    console.log('League lookup result:', leagues);
    
    if (leagues.length === 0) {
      // Get details about why the league was rejected
      const [debugLeague] = await connection.query(`
        SELECT league_id, name, is_active, registration_open, 
               season_start_date, season_end_date, CURDATE() as current_date
        FROM League WHERE league_id = ?
      `, [league_id]);
      
      console.log('Debug league info:', debugLeague);
      
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `Selected league is not available for registration. It may be inactive, full, or registration may be closed.`
      });
    }

    const league = leagues[0];
    const leagueId = league.league_id;

    // Check if league has reached max teams
    const [teamCount] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM TeamLeagueRegistration 
      WHERE league_id = ? AND registration_status != 'cancelled'
    `, [leagueId]);

    if (teamCount[0].count >= league.max_teams) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `League is full. Maximum ${league.max_teams} teams allowed for ${league.name}.`
      });
    }

    //insert team
    const [teamResult] = await connection.query(
      'INSERT INTO Team (name, captain_email, accepting_new_players, password_hash) VALUES (?, ?, ?, ?)',
      [teamName, captainEmail, contactByPlayers ? 1 : 0, passwordHash]
    );

    const teamId = teamResult.insertId;

    //create TeamLeagueRegistration record with league_id
    await connection.query(
      'INSERT INTO TeamLeagueRegistration (team_id, league_id, registration_status, registration_date) VALUES (?, ?, ?, CURDATE())',
      [teamId, leagueId, 'tentative']
    );

    //insert players
    const playerInsertPromises = players
      .filter(playerName => playerName.trim())
      .map(async (playerName) => {
        const [playerResult] = await connection.query(
          'INSERT INTO TeamPlayer (team_id, player_name, join_date) VALUES (?, ?, CURDATE())',
          [teamId, playerName.trim()]
        );
        console.log('Player inserted:', playerName, playerResult);
        return playerResult;
      });

    await Promise.all(playerInsertPromises);
    await connection.commit();
    
    console.log('Transaction committed successfully');
    
    res.json({ 
      success: true, 
      message: 'Team registered successfully', 
      teamId: teamId 
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error in team registration:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to register team'
    });
  } finally {
    connection.release();
  }
});

//test route to verify database connection
router.get('/test-connection', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      result 
    });
  } catch (err) {
    console.error('Database connection test failed:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

//team captain authentication
router.post('/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const [teams] = await pool.query(
      'SELECT team_id, name, captain_email FROM Team WHERE LOWER(captain_email) = LOWER(?) AND password_hash = ?',
      [email, passwordHash]
    );

    if (teams.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      team: teams[0]
    });

  } catch (err) {
    console.error('Error authenticating team:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Password reset request for teams
router.post('/password-reset-request', async (req, res) => {
  console.log('=== PASSWORD RESET REQUEST START ===');
  console.log('Request body:', req.body);
  
  try {
    const { email } = req.body;
    console.log('Extracted email:', email);

    if (!email) {
      console.log('ERROR: No email provided');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if team exists with this email (case insensitive)
    console.log('Checking for team with email:', email);
    const [teams] = await pool.query(
      'SELECT team_id, name, captain_email FROM Team WHERE LOWER(captain_email) = LOWER(?)',
      [email]
    );
    console.log('Teams found:', teams.length);

    if (teams.length === 0) {
      console.log('No team found with email, returning success for security');
      // For security, always return success even if email doesn't exist
      return res.json({
        success: true,
        message: 'If a team account exists with this email, a password reset link has been sent.'
      });
    }

    console.log('Team found:', teams[0].name);

    // Generate secure reset token
    console.log('Generating reset token...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    console.log('Token generated, expires at:', expiresAt);

    // Store reset token in database (case insensitive email match)
    console.log('Storing reset token in database...');
    try {
      const updateResult = await pool.query(
        'UPDATE Team SET reset_token_hash = ?, reset_token_expires = ? WHERE LOWER(captain_email) = LOWER(?)',
        [resetTokenHash, expiresAt, email]
      );
      console.log('Database update result:', updateResult);
    } catch (dbError) {
      console.error('Database error storing reset token:', dbError);
      // Check if it's a column missing error
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.error('Missing database columns for password reset');
        return res.status(500).json({
          success: false,
          error: 'Database not configured for password reset functionality. Please contact support.'
        });
      }
      throw dbError; // Re-throw other database errors
    }

    // Check if SMTP configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration not found, password reset email cannot be sent');
      return res.json({
        success: true,
        message: 'If a team account exists with this email, a password reset link has been sent.'
      });
    }

    // Send reset email using Mailersend
    try {
      await emailService.sendPasswordResetEmail({
        email,
        resetToken,
        teamName: teams[0].name,
        frontendUrl: process.env.FRONTEND_URL
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Still return success for security (don't reveal if email exists)
      return res.json({
        success: true,
        message: 'If a team account exists with this email, a password reset link has been sent.'
      });
    }

    res.json({
      success: true,
      message: 'If a team account exists with this email, a password reset link has been sent.'
    });

  } catch (err) {
    console.error('=== PASSWORD RESET ERROR ===');
    console.error('Error details:', err);
    console.error('Error stack:', err.stack);
    console.error('================================');
    res.status(500).json({
      success: false,
      error: 'Error processing password reset request'
    });
  }
});

// Password reset completion for teams
router.post('/password-reset-complete', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find team with valid reset token
    const [teams] = await pool.query(
      'SELECT team_id, captain_email FROM Team WHERE reset_token_hash = ? AND reset_token_expires > NOW()',
      [tokenHash]
    );

    if (teams.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash new password and update
    const newPasswordHash = crypto.createHash('sha256').update(newPassword).digest('hex');

    await pool.query(
      'UPDATE Team SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE team_id = ?',
      [newPasswordHash, teams[0].team_id]
    );

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (err) {
    console.error('Error completing password reset:', err);
    res.status(500).json({
      success: false,
      error: 'Error completing password reset'
    });
  }
});

//get team details for authenticated captain
router.get('/profile/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const [teams] = await pool.query(`
      SELECT 
        t.team_id,
        t.name as team_name,
        t.captain_email,
        t.accepting_new_players,
        tlr.registration_status,
        tlr.registration_date,
        tlr.payment_date,
        l.play_night,
        l.league_id
      FROM Team t
      LEFT JOIN TeamLeagueRegistration tlr ON t.team_id = tlr.team_id
      LEFT JOIN League l ON tlr.league_id = l.league_id
      WHERE t.team_id = ?
    `, [teamId]);

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    const [players] = await pool.query(
      'SELECT player_name, contact_info, join_date FROM TeamPlayer WHERE team_id = ? ORDER BY join_date',
      [teamId]
    );

    res.json({
      success: true,
      team: {
        ...teams[0],
        players: players
      }
    });

  } catch (err) {
    console.error('Error fetching team profile:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//update team information
router.put('/profile/:teamId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId } = req.params;
    const { teamName, acceptingNewPlayers } = req.body;

    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      'UPDATE Team SET name = ?, accepting_new_players = ? WHERE team_id = ?',
      [teamName, acceptingNewPlayers ? 1 : 0, teamId]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Team updated successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error updating team:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//add player to team
router.post('/profile/:teamId/players', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId } = req.params;
    const { playerName, contactInfo } = req.body;

    if (!playerName) {
      return res.status(400).json({
        success: false,
        error: 'Player name is required'
      });
    }

    await connection.beginTransaction();

    //check if player already exists on team
    const [existingPlayer] = await connection.query(
      'SELECT * FROM TeamPlayer WHERE team_id = ? AND player_name = ?',
      [teamId, playerName]
    );

    if (existingPlayer.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'Player already exists on this team'
      });
    }

    await connection.query(
      'INSERT INTO TeamPlayer (team_id, player_name, contact_info, join_date) VALUES (?, ?, ?, CURDATE())',
      [teamId, playerName, contactInfo || '']
    );

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Player added successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error adding player:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//remove player from team
router.delete('/profile/:teamId/players/:playerName', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId, playerName } = req.params;

    await connection.beginTransaction();

    const [deleteResult] = await connection.query(
      'DELETE FROM TeamPlayer WHERE team_id = ? AND player_name = ?',
      [teamId, decodeURIComponent(playerName)]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Player not found on this team'
      });
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Player removed successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error removing player:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//delete team (captain)
router.delete('/profile/:teamId', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId } = req.params;

    await connection.beginTransaction();

    console.log(`Starting deletion process for team ID: ${teamId}`);

    // Check what records exist before deletion
    const [contactRequests] = await connection.query(
      'SELECT COUNT(*) as count FROM ContactRequest WHERE team_id = ?',
      [teamId]
    );
    const [teamPlayers] = await connection.query(
      'SELECT COUNT(*) as count FROM TeamPlayer WHERE team_id = ?',
      [teamId]
    );
    const [teamRegistrations] = await connection.query(
      'SELECT COUNT(*) as count FROM TeamLeagueRegistration WHERE team_id = ?',
      [teamId]
    );

    console.log('Records to delete:', {
      contactRequests: contactRequests[0].count,
      teamPlayers: teamPlayers[0].count,
      teamRegistrations: teamRegistrations[0].count
    });

    //delete contact requests first (most likely to cause FK constraint issues)
    console.log('Deleting contact requests...');
    await connection.query(
      'DELETE FROM ContactRequest WHERE team_id = ?',
      [teamId]
    );

    //delete team players
    console.log('Deleting team players...');
    await connection.query(
      'DELETE FROM TeamPlayer WHERE team_id = ?',
      [teamId]
    );

    //delete team league registrations
    console.log('Deleting team league registrations...');
    await connection.query(
      'DELETE FROM TeamLeagueRegistration WHERE team_id = ?',
      [teamId]
    );

    //delete the team
    console.log('Deleting team record...');
    const [deleteResult] = await connection.query(
      'DELETE FROM Team WHERE team_id = ?',
      [teamId]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error deleting team:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

// LEAGUE SEASON MANAGEMENT ROUTES

// Get all league seasons
router.get('/admin/seasons', async (req, res) => {
  try {
    const [seasons] = await pool.query(`
      SELECT 
        league_id,
        name,
        season_name,
        play_night,
        play_time,
        skill_cap,
        season_start_date,
        season_end_date,
        playoff_start_date,
        max_teams,
        tables_reserved,
        is_active,
        registration_open,
        created_at
      FROM League
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      seasons
    });
  } catch (err) {
    console.error('Error fetching league seasons:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Create a new league season
router.post('/admin/seasons', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      name,
      season_name,
      play_night,
      play_time,
      skill_cap,
      season_start_date,
      season_end_date,
      playoff_start_date,
      max_teams,
      tables_reserved,
      table_type
    } = req.body;

    // Normalize optional date field
    const playoffDateValue = playoff_start_date || null;

    // Validate required fields
    if (!name || !season_name || !play_night || !play_time || !skill_cap || !season_start_date || !season_end_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate dates
    const startDate = new Date(season_start_date);
    const endDate = new Date(season_end_date);
    const playoffDate = playoffDateValue ? new Date(playoffDateValue) : null;

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        error: 'Season start date must be before end date'
      });
    }

    if (playoffDate && playoffDate <= endDate) {
      return res.status(400).json({
        success: false,
        error: 'Playoff start date must be after season end date'
      });
    }

    await connection.beginTransaction();

    // Create the league season
    const [result] = await connection.query(`
      INSERT INTO League (
        name, season_name, play_night, play_time, skill_cap,
        season_start_date, season_end_date, playoff_start_date,
        max_teams, tables_reserved, table_type, is_active, registration_open
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE)
    `, [
      name, season_name, play_night, play_time, skill_cap,
      season_start_date, season_end_date, playoffDateValue,
      max_teams || 8, tables_reserved || 4, table_type || 1
    ]);

    const leagueId = result.insertId;

    // Create recurring pattern for weekly league nights
    const endTime = '23:00:00'; // Default end time for league nights
    
    const [recurringResult] = await connection.query(`
      INSERT INTO RecurringEventPatterns (
        title, description, day_of_week, start_time, end_time, 
        tables_used, pattern_start_date, pattern_end_date, is_active, event_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'league')
    `, [
      `${name} - ${season_name}`,
      `Weekly ${name} league night for ${season_name} season`,
      play_night,
      play_time,
      endTime,
      tables_reserved || 4,
      season_start_date,
      season_end_date
    ]);

    const recurringPatternId = recurringResult.insertId;

    // Link recurring pattern to league season
    await connection.query(`
      INSERT INTO LeagueSeasonEvents (league_id, event_type, recurring_pattern_id)
      VALUES (?, ?, ?)
    `, [leagueId, 'season_start', recurringPatternId]);

    // Create one-time playoff events (if provided)
    if (playoffDateValue) {
      const [playoffEventResult] = await connection.query(`
        INSERT INTO Events (title, description, event_date, start_time, end_time, tables_used, is_recurring, event_type)
        VALUES (?, ?, ?, ?, ?, ?, FALSE, 'league')
      `, [
        `${name} - ${season_name} Playoffs Begin`,
        `${season_name} playoffs begin for ${name}`,
        playoffDateValue,
        play_time,
        endTime,
        tables_reserved || 4
      ]);

      // Link playoff event to league season
      await connection.query(`
        INSERT INTO LeagueSeasonEvents (league_id, event_type, event_id)
        VALUES (?, ?, ?)
      `, [leagueId, 'playoff_start', playoffEventResult.insertId]);
    }

    await connection.commit();

    res.json({
      success: true,
      league_id: leagueId,
      message: 'League season created successfully with recurring weekly events and playoff dates'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error creating league season:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

// Update a league season
router.put('/admin/seasons/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const {
      name,
      season_name,
      play_night,
      play_time,
      skill_cap,
      season_start_date,
      season_end_date,
      playoff_start_date,
      max_teams,
      tables_reserved,
      is_active,
      registration_open
    } = req.body;

    // Normalize optional date field
    const playoffDateValue = playoff_start_date || null;

    await connection.beginTransaction();

    // Get current league data to check what changed
    const [currentLeague] = await connection.query(
      'SELECT * FROM League WHERE league_id = ?',
      [id]
    );

    if (currentLeague.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'League season not found'
      });
    }

    const current = currentLeague[0];

    // Update league data
    const [result] = await connection.query(`
      UPDATE League SET
        name = ?, season_name = ?, play_night = ?, play_time = ?, skill_cap = ?,
        season_start_date = ?, season_end_date = ?, playoff_start_date = ?,
        max_teams = ?, tables_reserved = ?
      WHERE league_id = ?
    `, [
      name, season_name, play_night, play_time, skill_cap,
      season_start_date, season_end_date, playoffDateValue,
      max_teams, tables_reserved, id
    ]);

    // Update associated calendar events
    const [eventLinks] = await connection.query(`
      SELECT recurring_pattern_id, event_id, event_type FROM LeagueSeasonEvents WHERE league_id = ?
    `, [id]);

    // Update recurring pattern for weekly league nights
    const recurringPatternId = eventLinks.find(link => link.recurring_pattern_id)?.recurring_pattern_id;
    if (recurringPatternId) {
      await connection.query(`
        UPDATE RecurringEventPatterns SET
          title = ?, description = ?, day_of_week = ?, start_time = ?, end_time = ?,
          tables_used = ?, pattern_start_date = ?, pattern_end_date = ?, event_type = 'league'
        WHERE pattern_id = ?
      `, [
        `${name} - ${season_name}`,
        `Weekly ${name} league night for ${season_name} season`,
        play_night,
        play_time,
        '23:00:00',
        tables_reserved || 4,
        season_start_date,
        season_end_date,
        recurringPatternId
      ]);
    }

    // Handle playoff event updates
    const playoffEventLink = eventLinks.find(link => link.event_type === 'playoff_start');
    
    if (playoffDateValue) {
      if (playoffEventLink?.event_id) {
        // Update existing playoff event
        await connection.query(`
          UPDATE Events SET
            title = ?, description = ?, event_date = ?, start_time = ?, event_type = 'league'
          WHERE event_id = ?
        `, [
          `${name} - ${season_name} Playoffs Begin`,
          `${season_name} playoffs begin for ${name}`,
          playoffDateValue,
          play_time,
          playoffEventLink.event_id
        ]);
      } else {
        // Create new playoff event
        const [playoffEventResult] = await connection.query(`
          INSERT INTO Events (title, description, event_date, start_time, end_time, tables_used, is_recurring, event_type)
          VALUES (?, ?, ?, ?, ?, ?, FALSE, 'league')
        `, [
          `${name} - ${season_name} Playoffs Begin`,
          `${season_name} playoffs begin for ${name}`,
          playoffDateValue,
          play_time,
          '23:00:00',
          tables_reserved || 4
        ]);

        // Link new playoff event to league season
        await connection.query(`
          INSERT INTO LeagueSeasonEvents (league_id, event_type, event_id)
          VALUES (?, ?, ?)
        `, [id, 'playoff_start', playoffEventResult.insertId]);
      }
    } else if (playoffEventLink?.event_id) {
      // Remove playoff event if date was cleared
      await connection.query('DELETE FROM Events WHERE event_id = ?', [playoffEventLink.event_id]);
      await connection.query(
        'DELETE FROM LeagueSeasonEvents WHERE league_id = ? AND event_type = ?',
        [id, 'playoff_start']
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'League season and calendar events updated successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error updating league season:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

// End a league season (soft delete teams)
router.post('/admin/seasons/:id/end', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Update league status
    const [leagueResult] = await connection.query(`
      UPDATE League SET 
        is_active = FALSE, 
        registration_open = FALSE 
      WHERE league_id = ?
    `, [id]);

    // Deactivate associated recurring patterns
    const [eventLinks] = await connection.query(`
      SELECT recurring_pattern_id FROM LeagueSeasonEvents WHERE league_id = ?
    `, [id]);

    if (eventLinks.length > 0) {
      const recurringPatternIds = eventLinks.map(link => link.recurring_pattern_id).filter(Boolean);
      if (recurringPatternIds.length > 0) {
        await connection.query(`
          UPDATE RecurringEventPatterns 
          SET is_active = FALSE, pattern_end_date = CURDATE()
          WHERE pattern_id IN (${recurringPatternIds.map(() => '?').join(',')})
        `, recurringPatternIds);
      }
    }

    if (leagueResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'League season not found'
      });
    }

    // Get all teams registered for this league
    const [teams] = await connection.query(`
      SELECT DISTINCT t.team_id 
      FROM Team t
      JOIN TeamLeagueRegistration tlr ON t.team_id = tlr.team_id
      WHERE tlr.league_id = ? AND t.is_active = TRUE
    `, [id]);

    // Soft delete teams (deactivate them)
    if (teams.length > 0) {
      const teamIds = teams.map(team => team.team_id);
      await connection.query(`
        UPDATE Team SET 
          is_active = FALSE, 
          deactivated_at = CURRENT_TIMESTAMP,
          deactivation_reason = 'Season ended'
        WHERE team_id IN (${teamIds.map(() => '?').join(',')})
      `, teamIds);

      // Deactivate team registrations
      await connection.query(`
        UPDATE TeamLeagueRegistration SET 
          is_active = FALSE 
        WHERE league_id = ?
      `, [id]);
    }

    await connection.commit();

    res.json({
      success: true,
      message: `League season ended successfully. ${teams.length} teams deactivated.`,
      teams_affected: teams.length
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error ending league season:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

// Delete a league season and its events
router.delete('/admin/seasons/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get associated events and recurring patterns to delete them
    const [eventLinks] = await connection.query(`
      SELECT event_id, recurring_pattern_id FROM LeagueSeasonEvents WHERE league_id = ?
    `, [id]);

    // Delete associated one-time events
    if (eventLinks.length > 0) {
      const eventIds = eventLinks.map(link => link.event_id).filter(Boolean);
      if (eventIds.length > 0) {
        await connection.query(`
          DELETE FROM Events WHERE event_id IN (${eventIds.map(() => '?').join(',')})
        `, eventIds);
      }

      // Delete associated recurring patterns
      const recurringPatternIds = eventLinks.map(link => link.recurring_pattern_id).filter(Boolean);
      if (recurringPatternIds.length > 0) {
        // First delete exceptions for these patterns
        await connection.query(`
          DELETE FROM RecurringEventExceptions 
          WHERE pattern_id IN (${recurringPatternIds.map(() => '?').join(',')})
        `, recurringPatternIds);

        // Then delete the patterns themselves
        await connection.query(`
          DELETE FROM RecurringEventPatterns 
          WHERE pattern_id IN (${recurringPatternIds.map(() => '?').join(',')})
        `, recurringPatternIds);
      }
    }

    // Delete event links
    await connection.query(`
      DELETE FROM LeagueSeasonEvents WHERE league_id = ?
    `, [id]);

    // Delete team registrations
    await connection.query(`
      DELETE FROM TeamLeagueRegistration WHERE league_id = ?
    `, [id]);

    // Delete the league season
    const [result] = await connection.query(`
      DELETE FROM League WHERE league_id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'League season not found'
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'League season and associated events deleted successfully'
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error deleting league season:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  } finally {
    connection.release();
  }
});

//get public team roster (for potential players to view)
router.get('/roster/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Get basic team info
    const [teams] = await pool.query(`
      SELECT 
        t.team_id,
        t.name as team_name,
        t.accepting_new_players,
        l.play_night,
        l.name as league_name,
        l.season_name,
        l.skill_cap
      FROM Team t
      LEFT JOIN TeamLeagueRegistration tlr ON t.team_id = tlr.team_id
      LEFT JOIN League l ON tlr.league_id = l.league_id
      WHERE t.team_id = ?
    `, [teamId]);

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    // Get players (only names, no contact info for privacy)
    const [players] = await pool.query(
      'SELECT player_name, join_date FROM TeamPlayer WHERE team_id = ? ORDER BY join_date',
      [teamId]
    );

    res.json({
      success: true,
      team: {
        ...teams[0],
        players: players,
        player_count: players.length
      }
    });

  } catch (err) {
    console.error('Error fetching team roster:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get available leagues for registration
router.get('/available-leagues', async (req, res) => {
  try {
    const [leagues] = await pool.query(`
      SELECT 
        league_id,
        name,
        season_name,
        play_night,
        play_time,
        skill_cap,
        max_teams,
        season_start_date,
        season_end_date
      FROM League 
      WHERE is_active = TRUE 
        AND registration_open = TRUE
        AND (season_end_date IS NULL OR season_end_date >= CURDATE())
      ORDER BY 
        FIELD(play_night, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        skill_cap ASC
    `);

    // Get current team count for each league
    const leaguesWithCounts = await Promise.all(leagues.map(async (league) => {
      const [teamCount] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM TeamLeagueRegistration 
        WHERE league_id = ? AND registration_status != 'cancelled'
      `, [league.league_id]);

      return {
        ...league,
        current_teams: teamCount[0].count,
        spots_remaining: league.max_teams - teamCount[0].count
      };
    }));

    res.json({
      success: true,
      leagues: leaguesWithCounts
    });
  } catch (err) {
    console.error('Error fetching available leagues:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;