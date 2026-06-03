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

// SIMPLIFIED: Helper function to format any date to YYYY-MM-DD
const formatDate = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

// Get all announcements (admin view)
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/announcements called with query:', req.query);
    
    const { adminView } = req.query;
    let query = 'SELECT * FROM Announcements';
    let params = [];
    
    // If not admin view, only show active, non-expired announcements
    if (!adminView) {
      const today = new Date().toISOString().split('T')[0];
      query += ' WHERE is_active = TRUE AND expiry_date >= ?';
      params.push(today);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [announcements] = await pool.query(query, params);
    
    const formattedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      expiry_date: formatDate(announcement.expiry_date)
    }));

    res.json({
      success: true,
      announcements: formattedAnnouncements
    });
  } catch (error) {
    console.error('Error in GET /announcements:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get upcoming public announcements (for frontend Events page)
router.get('/public/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching announcements for date:', today);
    
    const [announcements] = await pool.query(`
      SELECT title, description, expiry_date, created_at
      FROM Announcements 
      WHERE is_active = TRUE 
      AND expiry_date >= ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [today]);
    
    console.log(`Found ${announcements.length} active announcements`);
    
    const formattedAnnouncements = announcements.map(announcement => ({
      ...announcement,
      expiry_date: formatDate(announcement.expiry_date)
    }));

    console.log('Returning announcements:', formattedAnnouncements);

    res.json({
      success: true,
      announcements: formattedAnnouncements
    });
  } catch (error) {
    console.error('Error in GET /announcements/public/upcoming:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new announcement
router.post('/', async (req, res) => {
  try {
    const { title, description, expiry_date, is_active } = req.body;

    if (!title || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'Title and expiry date are required'
      });
    }

    // Validate expiry date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (expiry_date < today) {
      return res.status(400).json({
        success: false,
        error: 'Expiry date cannot be in the past'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO Announcements (title, description, expiry_date, is_active)
      VALUES (?, ?, ?, ?)
    `, [title, description, expiry_date, is_active !== false]); // Default to true

    res.json({
      success: true,
      announcement_id: result.insertId,
      message: 'Announcement created successfully'
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, expiry_date, is_active } = req.body;

    if (!title || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'Title and expiry date are required'
      });
    }

    const [result] = await pool.query(`
      UPDATE Announcements 
      SET title = ?, description = ?, expiry_date = ?, is_active = ?
      WHERE announcement_id = ?
    `, [title, description, expiry_date, is_active, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully'
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete announcement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM Announcements WHERE announcement_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;