const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Ensure uploads directory exists
const uploadsDir = '/var/www/LPWebsite/LPWebsite/backend/public/uploads/events';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
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

// SIMPLIFIED: Get day name from date string
const getDayName = (dateString) => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  } catch (error) {
    console.error('Error getting day name for:', dateString);
    return null;
  }
};

// SIMPLIFIED: Generate recurring events for a date range
const generateRecurringEvents = async (startDate, endDate) => {
  try {
    const [patterns] = await pool.query(`
      SELECT * FROM RecurringEventPatterns 
      WHERE is_active = TRUE 
      AND (pattern_end_date IS NULL OR pattern_end_date >= ?)
      AND pattern_start_date <= ?
    `, [startDate, endDate]);

    console.log(`Found ${patterns.length} recurring patterns`);

    const recurringEvents = [];

    for (const pattern of patterns) {
      console.log(`Processing pattern: ${pattern.title} on ${pattern.day_of_week}`);
      
      const [exceptions] = await pool.query(
        'SELECT exception_date FROM RecurringEventExceptions WHERE pattern_id = ?',
        [pattern.pattern_id]
      );
      
      const exceptionDates = new Set(exceptions.map(e => formatDate(e.exception_date)));
      console.log(`Pattern ${pattern.pattern_id} has ${exceptionDates.size} exceptions`);

      const start = new Date(Math.max(
        new Date(pattern.pattern_start_date),
        new Date(startDate)
      ));
      const end = new Date(Math.min(
        pattern.pattern_end_date ? new Date(pattern.pattern_end_date) : new Date(endDate),
        new Date(endDate)
      ));

      const current = new Date(start);
      let eventCount = 0;

      while (current <= end) {
        const currentDateStr = formatDate(current);
        const currentDayName = getDayName(currentDateStr);
        
        if (currentDayName === pattern.day_of_week && !exceptionDates.has(currentDateStr)) {
          recurringEvents.push({
            event_id: `recurring_${pattern.pattern_id}_${currentDateStr}`,
            title: pattern.title,
            description: pattern.description,
            event_date: currentDateStr,
            start_time: pattern.start_time,
            end_time: pattern.end_time,
            tables_used: pattern.tables_used,
            image_path: pattern.image_path, // Include image path
            is_recurring: true,
            recurring_pattern_id: pattern.pattern_id,
            event_type: pattern.event_type // Pass through the event_type from the pattern
          });
          eventCount++;
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      console.log(`Generated ${eventCount} events for pattern: ${pattern.title}`);
    }

    console.log(`Total recurring events generated: ${recurringEvents.length}`);
    return recurringEvents;

  } catch (error) {
    console.error('Error generating recurring events:', error);
    return [];
  }
};

// MAIN ROUTE: Get all events for a date range
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/events called with query:', req.query);
    
    const { startDate, endDate } = req.query;
    
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    console.log(`Fetching events from ${start} to ${end}`);

    let oneTimeEvents = [];
    try {
      const [events] = await pool.query(`
        SELECT 
          event_id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          tables_used,
          image_path,
          is_recurring,
          recurring_pattern_id,
          event_type
        FROM Events 
        WHERE event_date BETWEEN ? AND ?
        AND is_recurring = FALSE
        ORDER BY event_date, start_time
      `, [start, end]);

      oneTimeEvents = events.map(event => ({
        ...event,
        event_date: formatDate(event.event_date),
        is_recurring: false
      }));

      console.log(`Found ${oneTimeEvents.length} one-time events`);
    } catch (error) {
      console.error('Error fetching one-time events:', error);
    }

    const recurringEvents = await generateRecurringEvents(start, end);

    const allEvents = [...oneTimeEvents, ...recurringEvents].sort((a, b) => {
      const dateCompare = a.event_date.localeCompare(b.event_date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

    console.log(`Returning ${allEvents.length} total events`);

    res.json({
      success: true,
      events: allEvents
    });

  } catch (error) {
    console.error('Error in GET /events:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get upcoming events (next 30 days)
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Fetching upcoming events from ${today} to ${futureDate}`);

    let oneTimeEvents = [];
    try {
      const [events] = await pool.query(`
        SELECT 
          event_id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          tables_used,
          image_path,
          is_recurring,
          recurring_pattern_id,
          event_type
        FROM Events 
        WHERE event_date BETWEEN ? AND ?
        AND is_recurring = FALSE
        ORDER BY event_date, start_time
      `, [today, futureDate]);

      oneTimeEvents = events.map(event => ({
        ...event,
        event_date: formatDate(event.event_date),
        is_recurring: false
      }));
    } catch (error) {
      console.error('Error fetching upcoming one-time events:', error);
    }

    const recurringEvents = await generateRecurringEvents(today, futureDate);

    const allEvents = [...oneTimeEvents, ...recurringEvents].sort((a, b) => {
      const dateCompare = a.event_date.localeCompare(b.event_date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

    res.json({
      success: true,
      events: allEvents
    });

  } catch (error) {
    console.error('Error in GET /events/upcoming:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get events for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    console.log(`Getting events for specific date: ${date}`);

    let oneTimeEvents = [];
    try {
      const [events] = await pool.query(`
        SELECT 
          event_id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          tables_used,
          image_path,
          is_recurring,
          recurring_pattern_id
        FROM Events 
        WHERE event_date = ?
        AND is_recurring = FALSE
        ORDER BY start_time
      `, [date]);

      oneTimeEvents = events.map(event => ({
        ...event,
        event_date: formatDate(event.event_date),
        is_recurring: false
      }));
    } catch (error) {
      console.error('Error fetching one-time events for date:', error);
    }

    const recurringEvents = await generateRecurringEvents(date, date);

    const allEvents = [...oneTimeEvents, ...recurringEvents].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });

    res.json({
      success: true,
      events: allEvents
    });

  } catch (error) {
    console.error('Error fetching events for date:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new one-time event
router.post('/', async (req, res) => {
  try {
    const { title, description, event_date, start_time, end_time, tables_used, event_type } = req.body;

    if (!title || !event_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, event_date, start_time, end_time'
      });
    }

    // Validate event_type if provided
    const validEventTypes = ['league', 'tournament', 'other'];
    const finalEventType = validEventTypes.includes(event_type) ? event_type : 'other';

    const [result] = await pool.query(`
      INSERT INTO Events (title, description, event_date, start_time, end_time, tables_used, is_recurring, event_type)
      VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)
    `, [title, description, event_date, start_time, end_time, tables_used, finalEventType]);

    res.json({
      success: true,
      event_id: result.insertId,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload image for one-time event
router.post('/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const eventId = req.params.id;
    const imagePath = `/uploads/events/${req.file.filename}`;

    // Get old image path to delete it
    const [oldEvent] = await pool.query(
      'SELECT image_path FROM Events WHERE event_id = ?',
      [eventId]
    );

    // Update event with new image path
    await pool.query(
      'UPDATE Events SET image_path = ? WHERE event_id = ?',
      [imagePath, eventId]
    );

    // Delete old image file if it exists
    if (oldEvent[0]?.image_path && oldEvent[0].image_path.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../public', oldEvent[0].image_path);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json({ 
      success: true, 
      imagePath: imagePath 
    });
  } catch (error) {
    console.error('Event image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image for one-time event
router.delete('/:id/image', async (req, res) => {
  try {
    const eventId = req.params.id;

    // Get current image path
    const [event] = await pool.query(
      'SELECT image_path FROM Events WHERE event_id = ?',
      [eventId]
    );

    if (event[0]?.image_path && event[0].image_path.startsWith('/uploads/')) {
      // Delete image file
      const imagePath = path.join(__dirname, '../public', event[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image path from database
    await pool.query(
      'UPDATE Events SET image_path = NULL WHERE event_id = ?',
      [eventId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Event image deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a one-time event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, start_time, end_time, tables_used, event_type } = req.body;

    // Validate event_type if provided
    const validEventTypes = ['league', 'tournament', 'other'];
    const finalEventType = validEventTypes.includes(event_type) ? event_type : 'other';

    const [result] = await pool.query(`
      UPDATE Events 
      SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, tables_used = ?, event_type = ?
      WHERE event_id = ? AND is_recurring = FALSE
    `, [title, description, event_date, start_time, end_time, tables_used, finalEventType, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or is a recurring event'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully'
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a one-time event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get image path before deletion
    const [event] = await pool.query(
      'SELECT image_path FROM Events WHERE event_id = ? AND is_recurring = FALSE',
      [id]
    );

    const [result] = await pool.query(
      'DELETE FROM Events WHERE event_id = ? AND is_recurring = FALSE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or is a recurring event'
      });
    }

    // Delete image file if it exists
    if (event[0]?.image_path && event[0].image_path.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', event[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// RECURRING EVENTS ROUTES

// Get all recurring patterns
router.get('/recurring', async (req, res) => {
  try {
    const [patterns] = await pool.query(`
      SELECT 
        pattern_id,
        title,
        description,
        day_of_week,
        start_time,
        end_time,
        tables_used,
        pattern_start_date,
        pattern_end_date,
        image_path,
        is_active,
        event_type
      FROM RecurringEventPatterns
      ORDER BY day_of_week, start_time
    `);

    const formattedPatterns = patterns.map(pattern => ({
      ...pattern,
      pattern_start_date: formatDate(pattern.pattern_start_date),
      pattern_end_date: formatDate(pattern.pattern_end_date)
    }));

    res.json({
      success: true,
      patterns: formattedPatterns
    });

  } catch (error) {
    console.error('Error fetching recurring patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new recurring pattern
router.post('/recurring', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      day_of_week, 
      start_time, 
      end_time, 
      tables_used, 
      pattern_start_date, 
      pattern_end_date,
      event_type
    } = req.body;

    if (!title || !day_of_week || !start_time || !end_time || !pattern_start_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate event_type if provided
    const validEventTypes = ['league', 'tournament', 'other'];
    const finalEventType = validEventTypes.includes(event_type) ? event_type : 'other';

    const [result] = await pool.query(`
      INSERT INTO RecurringEventPatterns 
      (title, description, day_of_week, start_time, end_time, tables_used, pattern_start_date, pattern_end_date, event_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, day_of_week, start_time, end_time, tables_used, pattern_start_date, pattern_end_date, finalEventType]);

    res.json({
      success: true,
      pattern_id: result.insertId,
      message: 'Recurring pattern created successfully'
    });

  } catch (error) {
    console.error('Error creating recurring pattern:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload image for recurring pattern
router.post('/recurring/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const patternId = req.params.id;
    const imagePath = `/uploads/events/${req.file.filename}`;

    // Get old image path to delete it
    const [oldPattern] = await pool.query(
      'SELECT image_path FROM RecurringEventPatterns WHERE pattern_id = ?',
      [patternId]
    );

    // Update pattern with new image path
    await pool.query(
      'UPDATE RecurringEventPatterns SET image_path = ? WHERE pattern_id = ?',
      [imagePath, patternId]
    );

    // Delete old image file if it exists
    if (oldPattern[0]?.image_path && oldPattern[0].image_path.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../public', oldPattern[0].image_path);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json({ 
      success: true, 
      imagePath: imagePath 
    });
  } catch (error) {
    console.error('Recurring pattern image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image for recurring pattern
router.delete('/recurring/:id/image', async (req, res) => {
  try {
    const patternId = req.params.id;

    // Get current image path
    const [pattern] = await pool.query(
      'SELECT image_path FROM RecurringEventPatterns WHERE pattern_id = ?',
      [patternId]
    );

    if (pattern[0]?.image_path && pattern[0].image_path.startsWith('/uploads/')) {
      // Delete image file
      const imagePath = path.join(__dirname, '../public', pattern[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image path from database
    await pool.query(
      'UPDATE RecurringEventPatterns SET image_path = NULL WHERE pattern_id = ?',
      [patternId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Recurring pattern image deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a recurring pattern
router.put('/recurring/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      day_of_week, 
      start_time, 
      end_time, 
      tables_used, 
      pattern_start_date, 
      pattern_end_date,
      is_active,
      event_type
    } = req.body;

    // Validate event_type if provided
    const validEventTypes = ['league', 'tournament', 'other'];
    const finalEventType = validEventTypes.includes(event_type) ? event_type : 'other';

    const [result] = await pool.query(`
      UPDATE RecurringEventPatterns 
      SET title = ?, description = ?, day_of_week = ?, start_time = ?, end_time = ?, 
          tables_used = ?, pattern_start_date = ?, pattern_end_date = ?, is_active = ?, event_type = ?
      WHERE pattern_id = ?
    `, [title, description, day_of_week, start_time, end_time, tables_used, 
        pattern_start_date, pattern_end_date, is_active, finalEventType, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Recurring pattern not found'
      });
    }

    res.json({
      success: true,
      message: 'Recurring pattern updated successfully'
    });

  } catch (error) {
    console.error('Error updating recurring pattern:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Delete a recurring pattern
router.delete('/recurring/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get image path before deletion
    const [pattern] = await connection.query(
      'SELECT image_path FROM RecurringEventPatterns WHERE pattern_id = ?',
      [id]
    );

    // Delete exceptions first
    await connection.query(
      'DELETE FROM RecurringEventExceptions WHERE pattern_id = ?',
      [id]
    );

    // Delete the pattern
    const [result] = await connection.query(
      'DELETE FROM RecurringEventPatterns WHERE pattern_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Recurring pattern not found'
      });
    }

    // Delete image file if it exists
    if (pattern[0]?.image_path && pattern[0].image_path.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', pattern[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Recurring pattern and all exceptions deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting recurring pattern:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// EXCEPTION ROUTES

// Add exception (skip a recurring event)
router.post('/recurring/:id/exceptions', async (req, res) => {
  try {
    const { id } = req.params;
    const { exception_date, reason } = req.body;

    if (!exception_date) {
      return res.status(400).json({
        success: false,
        error: 'Exception date is required'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO RecurringEventExceptions (pattern_id, exception_date, reason)
      VALUES (?, ?, ?)
    `, [id, exception_date, reason]);

    res.json({
      success: true,
      exception_id: result.insertId,
      message: 'Exception added successfully'
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Exception for this date already exists'
      });
    }
    
    console.error('Error adding exception:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get exceptions for a recurring pattern
router.get('/recurring/:id/exceptions', async (req, res) => {
  try {
    const { id } = req.params;

    const [exceptions] = await pool.query(`
      SELECT exception_id, exception_date, reason, created_at
      FROM RecurringEventExceptions 
      WHERE pattern_id = ?
      ORDER BY exception_date
    `, [id]);

    const formattedExceptions = exceptions.map(exception => ({
      ...exception,
      exception_date: formatDate(exception.exception_date)
    }));

    res.json({
      success: true,
      exceptions: formattedExceptions
    });

  } catch (error) {
    console.error('Error fetching exceptions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Remove exception (restore a skipped recurring event)
router.delete('/recurring/:patternId/exceptions/:exceptionId', async (req, res) => {
  try {
    const { patternId, exceptionId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM RecurringEventExceptions WHERE exception_id = ? AND pattern_id = ?',
      [exceptionId, patternId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exception not found'
      });
    }

    res.json({
      success: true,
      message: 'Exception removed successfully'
    });

  } catch (error) {
    console.error('Error removing exception:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;