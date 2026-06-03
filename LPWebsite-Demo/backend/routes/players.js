const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

//create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//get all players
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        player_id,
        name,
        email,
        bio,
        play_nights,
        skill_level,
        created_at,
        active
      FROM PlayerFinder
      WHERE active = true
      ORDER BY created_at DESC
    `);

    const players = rows.map(player => ({
      ...player,
      play_nights: JSON.parse(player.play_nights)
    }));

    res.json({
      success: true,
      players
    });
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//hash password helper function
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

//authenticate player
router.post('/authenticate', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email, password } = req.body;

    //input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    //hash the provided password
    const hashedPassword = hashPassword(password);

    //get user by email and password hash (case insensitive email)
    const [users] = await connection.query(
      'SELECT player_id FROM PlayerFinder WHERE LOWER(email) = LOWER(?) AND password_hash = ? AND active = true',
      [email, hashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    //authentication successful
    res.json({
      success: true,
      playerId: users[0].player_id
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during authentication'
    });
  } finally {
    connection.release();
  }
});

// Password reset request for players
router.post('/password-reset-request', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if player exists with this email (case insensitive)
    const [players] = await connection.query(
      'SELECT player_id, name, email FROM PlayerFinder WHERE LOWER(email) = LOWER(?) AND active = true',
      [email]
    );

    if (players.length === 0) {
      // For security, always return success even if email doesn't exist
      return res.json({
        success: true,
        message: 'If a player account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database (case insensitive email match)
    await connection.query(
      'UPDATE PlayerFinder SET reset_token_hash = ?, reset_token_expires = ? WHERE LOWER(email) = LOWER(?) AND active = true',
      [resetTokenHash, expiresAt, email]
    );

    // Check if SMTP configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP configuration not found, password reset email cannot be sent');
      return res.json({
        success: true,
        message: 'If a player account exists with this email, a password reset link has been sent.'
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://45.44.97.112'}/reset-password?token=${resetToken}&type=player`;
    
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset - Leather Pocket Player Profile',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your player profile.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #004d00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Player: ${players[0].name}</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Still return success for security (don't reveal if email exists)
      return res.json({
        success: true,
        message: 'If a player account exists with this email, a password reset link has been sent.'
      });
    }

    res.json({
      success: true,
      message: 'If a player account exists with this email, a password reset link has been sent.'
    });

  } catch (err) {
    console.error('Error sending password reset:', err);
    res.status(500).json({
      success: false,
      error: 'Error processing password reset request'
    });
  } finally {
    connection.release();
  }
});

// Password reset completion for players
router.post('/password-reset-complete', async (req, res) => {
  const connection = await pool.getConnection();
  
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

    // Find player with valid reset token
    const [players] = await connection.query(
      'SELECT player_id, email FROM PlayerFinder WHERE reset_token_hash = ? AND reset_token_expires > NOW() AND active = true',
      [tokenHash]
    );

    if (players.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Hash new password and update
    const newPasswordHash = hashPassword(newPassword);

    await connection.query(
      'UPDATE PlayerFinder SET password_hash = ?, reset_token_hash = NULL, reset_token_expires = NULL WHERE player_id = ?',
      [newPasswordHash, players[0].player_id]
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
  } finally {
    connection.release();
  }
});

//register new player
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { name, email, password, bio, skillLevel, playNights } = req.body;

    //validate required fields
    if (!name || !email || !password || !skillLevel || !playNights || playNights.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    //check if email already exists (case insensitive)
    const [existingUsers] = await connection.query(
      'SELECT player_id FROM PlayerFinder WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    //hash password with crypto
    const passwordHash = hashPassword(password);

    //insert new player
    const [result] = await connection.query(
      `INSERT INTO PlayerFinder (
        name,
        email,
        password_hash,
        bio,
        play_nights,
        skill_level
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        passwordHash,
        bio || null,
        JSON.stringify(playNights),
        skillLevel
      ]
    );

    res.json({
      success: true,
      playerId: result.insertId,
      message: 'Player registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during registration'
    });
  } finally {
    connection.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        player_id,
        name,
        email,
        bio,
        play_nights,
        skill_level,
        created_at,
        active
      FROM PlayerFinder
      WHERE player_id = ? AND active = true
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const player = {
      ...rows[0],
      play_nights: JSON.parse(rows[0].play_nights)
    };

    res.json({
      success: true,
      player
    });

  } catch (err) {
    console.error('Error fetching player:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//update player
router.put('/:id', async (req, res) => {
  try {
    const { bio, skillLevel, playNights } = req.body;
    
    const [result] = await pool.query(`
      UPDATE PlayerFinder 
      SET bio = ?, 
          skill_level = ?,
          play_nights = ?
      WHERE player_id = ? AND active = true
    `, [bio, skillLevel, JSON.stringify(playNights), req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (err) {
    console.error('Error updating player:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

//delete player (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(`
      UPDATE PlayerFinder 
      SET active = false 
      WHERE player_id = ?
    `, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting player:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;