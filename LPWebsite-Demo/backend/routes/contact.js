const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const emailService = require('../services/emailService');

const nodemailer = require('nodemailer');

const gmailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendGmailEmail = async (emailData) => {
  const mailOptions = {
    from: `"Leather Pocket Pool League" <${process.env.GMAIL_USER}>`,
    to: emailData.to,
    subject: emailData.subject,
    html: emailData.htmlContent
  };
  
  try {
    const result = await gmailTransporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

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

//test route for Gmail SMTP verification
router.post('/test-gmail', async (req, res) => {
  try {
    if (!process.env.GMAIL_USER) {
      throw new Error('GMAIL_USER environment variable is not set');
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      throw new Error('GMAIL_APP_PASSWORD environment variable is not set');
    }

    const result = await sendGmailEmail({
      to: 'starwarfare817@gmail.com',
      subject: 'Gmail SMTP Test',
      htmlContent: '<h1>Test Success!</h1><p>Your Gmail SMTP is working correctly.</p>'
    });

    res.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

//handle team contact form submissions
router.post('/team', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { teamId, senderName, senderEmail, message } = req.body;

    if (!teamId || !senderName || !senderEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    await connection.beginTransaction();

    const [teams] = await connection.query(
      'SELECT name, captain_email FROM Team WHERE team_id = ?',
      [teamId]
    );

    if (teams.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    const team = teams[0];

    await connection.query(
      'INSERT INTO ContactRequest (team_id, sender_name, sender_email, message) VALUES (?, ?, ?, ?)',
      [teamId, senderName, senderEmail, message]
    );

    try {
      await sendGmailEmail({
        to: team.captain_email,
        subject: `Contact Request for ${team.name}`,
        htmlContent: `
          <h2>New Contact Request</h2>
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Team:</strong> ${team.name}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>This message was sent through the Leather Pocket website contact form.</em></p>
        `
      });

      await sendGmailEmail({
        to: senderEmail,
        subject: `Contact request sent to ${team.name}`,
        htmlContent: `
          <h2>Contact Request Sent</h2>
          <p>Hi ${senderName},</p>
          <p>Your contact request has been sent to <strong>${team.name}</strong>.</p>
          <p>They should respond directly to your email address.</p>
          <br>
          <p>Thanks,<br>Leather Pocket Pool League</p>
        `
      });

      await connection.commit();
      res.json({ success: true });

    } catch (emailError) {
      await connection.rollback();
      res.status(500).json({
        success: false,
        error: 'Failed to send email. Please try again later.'
      });
    }

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  } finally {
    connection.release();
  }
});

//new player contact route
router.post('/player', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { playerId, senderName, senderEmail, message } = req.body;

    if (!playerId || !senderName || !senderEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    await connection.beginTransaction();

    //get player details
    const [players] = await connection.query(
      'SELECT name, email FROM PlayerFinder WHERE player_id = ? AND active = TRUE',
      [playerId]
    );

    if (players.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Player not found or profile is inactive'
      });
    }

    const player = players[0];

    try {
      await sendGmailEmail({
        to: player.email,
        subject: `Contact Request from ${senderName}`,
        htmlContent: `
          <h2>New Contact Request</h2>
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Player:</strong> ${player.name}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p><em>This message was sent through the Leather Pocket website player finder.</em></p>
        `
      });

      await sendGmailEmail({
        to: senderEmail,
        subject: `Contact request sent to ${player.name}`,
        htmlContent: `
          <h2>Contact Request Sent</h2>
          <p>Hi ${senderName},</p>
          <p>Your contact request has been sent to <strong>${player.name}</strong>.</p>
          <p>They should respond directly to your email address.</p>
          <br>
          <p>Thanks,<br>Leather Pocket Pool League</p>
        `
      });

      await connection.commit();
      res.json({ success: true });

    } catch (emailError) {
      await connection.rollback();
      res.status(500).json({
        success: false,
        error: 'Failed to send email. Please try again later.'
      });
    }

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;