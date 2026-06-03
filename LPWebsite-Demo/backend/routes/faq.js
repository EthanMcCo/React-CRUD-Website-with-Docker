// Updated faq.js route file
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

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

//get all FAQs ordered by topic, then by ID
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FAQ ORDER BY topic, faq_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

//add new FAQ with topic
router.post('/', async (req, res) => {
  const { question, answer, topic } = req.body;
  
  // Validate required fields
  if (!question || !answer || !topic) {
    return res.status(400).json({ error: 'Question, answer, and topic are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO FAQ (question, answer, topic) VALUES (?, ?, ?)',
      [question, answer, topic]
    );
    res.json({ 
      message: 'FAQ added successfully', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

//update FAQ
router.put('/:id', async (req, res) => {
  const { question, answer, topic } = req.body;
  
  // Validate required fields
  if (!question || !answer || !topic) {
    return res.status(400).json({ error: 'Question, answer, and topic are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE FAQ SET question = ?, answer = ?, topic = ? WHERE faq_id = ?',
      [question, answer, topic, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ updated successfully' });
  } catch (err) {
    console.error('Database update error:', err);
    res.status(500).json({ error: err.message });
  }
});

//delete FAQ
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM FAQ WHERE faq_id = ?', [req.params.id]);
    res.json({ message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error('Database delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

//get FAQs by category
router.get('/category/:topic', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM FAQ WHERE topic = ? ORDER BY faq_id DESC', [req.params.topic]);
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;