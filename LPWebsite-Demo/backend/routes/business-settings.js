const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET all business settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value, setting_type, display_name, category FROM BusinessSettings ORDER BY category, display_name'
    );
    
    res.json({ 
      success: true, 
      settings: rows 
    });
  } catch (error) {
    console.error('Error fetching business settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch business settings' 
    });
  }
});

// GET settings by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value, setting_type, display_name, category FROM BusinessSettings WHERE category = ? ORDER BY display_name',
      [category]
    );
    
    res.json({ 
      success: true, 
      settings: rows 
    });
  } catch (error) {
    console.error('Error fetching business settings by category:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch business settings' 
    });
  }
});

// GET single setting by key
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value, setting_type, display_name, category FROM BusinessSettings WHERE setting_key = ?',
      [key]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.json({ 
      success: true, 
      setting: rows[0] 
    });
  } catch (error) {
    console.error('Error fetching business setting:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch business setting' 
    });
  }
});

// PUT update business setting
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value } = req.body;
    
    if (setting_value === undefined || setting_value === null) {
      return res.status(400).json({
        success: false,
        error: 'Setting value is required'
      });
    }
    
    const [result] = await pool.query(
      'UPDATE BusinessSettings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
      [setting_value, key]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Setting updated successfully' 
    });
  } catch (error) {
    console.error('Error updating business setting:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update business setting' 
    });
  }
});

// PUT update multiple settings at once
router.put('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: 'Settings array is required'
      });
    }
    
    await connection.beginTransaction();
    
    for (const setting of settings) {
      const { setting_key, setting_value } = setting;
      
      if (!setting_key || setting_value === undefined) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: 'Each setting must have setting_key and setting_value'
        });
      }
      
      await connection.query(
        'UPDATE BusinessSettings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
        [setting_value, setting_key]
      );
    }
    
    await connection.commit();
    res.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error updating business settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update business settings' 
    });
  } finally {
    connection.release();
  }
});

// GET settings formatted for public contact page
router.get('/public/contact-info', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM BusinessSettings'
    );
    
    // Convert to key-value object for easier frontend use
    const contactInfo = {};
    rows.forEach(row => {
      contactInfo[row.setting_key] = row.setting_value;
    });
    
    res.json({ 
      success: true, 
      contactInfo 
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch contact information' 
    });
  }
});

module.exports = router;