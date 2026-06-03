const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const router = express.Router();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Billiards-Site'
};

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT admin_id, username, password_hash FROM Admin WHERE username = ?',
      [username]
    );
    
    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      message: 'Login successful',
      admin_id: admin.admin_id,
      username: admin.username
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TEMPORARY EMERGENCY RESET - Remove this after you regain access!
router.post('/emergency-reset', async (req, res) => {
  try {
    const { username, newPassword, secret } = req.body;

    // Simple secret key protection - set this in your .env as EMERGENCY_SECRET
    if (secret !== process.env.EMERGENCY_SECRET) {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Username and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT admin_id FROM Admin WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Username not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await connection.execute(
      'UPDATE Admin SET password_hash = ? WHERE username = ?',
      [passwordHash, username]
    );

    await connection.end();

    res.json({ 
      success: true, 
      message: 'Password successfully reset. REMOVE THIS ENDPOINT NOW!' 
    });

  } catch (error) {
    console.error('Emergency reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
