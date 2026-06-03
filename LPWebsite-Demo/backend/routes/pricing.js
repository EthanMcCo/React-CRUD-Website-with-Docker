const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get all pricing information (public endpoint)
router.get('/', async (req, res) => {
  try {
    // Get pricing settings for display text
    const [settingsResults] = await pool.query(`
      SELECT setting_key, setting_value 
      FROM BusinessSettings 
      WHERE category = 'pricing'
    `);
    
    const settings = {};
    settingsResults.forEach(setting => {
      settings[setting.setting_key] = setting.setting_value;
    });

    // Get deal pricing with table information
    const [dealResults] = await pool.query(`
      SELECT 
        pr.id,
        tt.table_name as tableType,
        pr.price,
        pr.price_unit,
        tt.table_description
      FROM PricingRates pr
      JOIN TableTypes tt ON pr.table_type_id = tt.id
      WHERE pr.pricing_type = 'deal' AND pr.is_active = TRUE AND tt.is_active = TRUE
      ORDER BY tt.sort_order, tt.table_name
    `);
    
    // Get regular table pricing
    const [tableResults] = await pool.query(`
      SELECT 
        pr.id,
        tt.table_name as tableType,
        pr.price,
        pr.price_unit,
        tt.table_description
      FROM PricingRates pr
      JOIN TableTypes tt ON pr.table_type_id = tt.id
      WHERE pr.pricing_type = 'regular' AND pr.is_active = TRUE AND tt.is_active = TRUE
      ORDER BY tt.sort_order, tt.table_name
    `);

    // Get table counts from TableTypes
    const [tableCountResults] = await pool.query(`
      SELECT table_name, table_count 
      FROM TableTypes 
      WHERE is_active = TRUE AND table_count > 0
      ORDER BY sort_order, table_name
    `);
    
    const tableCounts = {};
    tableCountResults.forEach(table => {
      tableCounts[table.table_name] = table.table_count;
    });
    
    res.json({
      deals: dealResults,
      tables: tableResults,
      settings: settings,
      tableCounts: tableCounts,
      success: true
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ error: 'Failed to fetch pricing information', success: false });
  }
});

// Get all table types for admin management
router.get('/table-types', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        tt.*,
        (SELECT COUNT(*) FROM PricingRates pr WHERE pr.table_type_id = tt.id AND pr.is_active = TRUE) as pricing_count
      FROM TableTypes tt
      ORDER BY tt.sort_order, tt.table_name
    `);
    
    res.json({
      tableTypes: results,
      success: true
    });
  } catch (error) {
    console.error('Error fetching table types:', error);
    res.status(500).json({ error: 'Failed to fetch table types', success: false });
  }
});

// Get all pricing rates for admin management
router.get('/rates', async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        pr.*,
        tt.table_name,
        tt.table_description
      FROM PricingRates pr
      JOIN TableTypes tt ON pr.table_type_id = tt.id
      ORDER BY tt.sort_order, tt.table_name, pr.pricing_type
    `);
    
    res.json({
      rates: results,
      success: true
    });
  } catch (error) {
    console.error('Error fetching pricing rates:', error);
    res.status(500).json({ error: 'Failed to fetch pricing rates', success: false });
  }
});

// Create new table type
router.post('/table-types', async (req, res) => {
  try {
    const { table_name, table_description, sort_order, table_count } = req.body;
    
    if (!table_name) {
      return res.status(400).json({ error: 'Table name is required', success: false });
    }

    const [result] = await pool.query(
      'INSERT INTO TableTypes (table_name, table_description, sort_order, table_count) VALUES (?, ?, ?, ?)',
      [table_name, table_description || '', sort_order || 0, table_count || 0]
    );
    
    res.json({ 
      success: true, 
      message: 'Table type created successfully',
      tableTypeId: result.insertId
    });
  } catch (error) {
    console.error('Error creating table type:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Table type already exists', success: false });
    } else {
      res.status(500).json({ error: 'Failed to create table type', success: false });
    }
  }
});

// Update table type
router.put('/table-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { table_name, table_description, sort_order, table_count, is_active } = req.body;
    
    await pool.query(
      'UPDATE TableTypes SET table_name = ?, table_description = ?, sort_order = ?, table_count = ?, is_active = ? WHERE id = ?',
      [table_name, table_description, sort_order, table_count || 0, is_active, id]
    );
    
    res.json({ success: true, message: 'Table type updated successfully' });
  } catch (error) {
    console.error('Error updating table type:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Table type name already exists', success: false });
    } else {
      res.status(500).json({ error: 'Failed to update table type', success: false });
    }
  }
});

// Delete table type (soft delete by setting is_active = false)
router.delete('/table-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete table type and associated pricing rates
    await pool.query('UPDATE TableTypes SET is_active = FALSE WHERE id = ?', [id]);
    await pool.query('UPDATE PricingRates SET is_active = FALSE WHERE table_type_id = ?', [id]);
    
    res.json({ success: true, message: 'Table type deleted successfully' });
  } catch (error) {
    console.error('Error deleting table type:', error);
    res.status(500).json({ error: 'Failed to delete table type', success: false });
  }
});

// Create or update pricing rate
router.post('/rates', async (req, res) => {
  try {
    const { table_type_id, pricing_type, price, price_unit } = req.body;
    
    if (!table_type_id || !pricing_type || price === undefined) {
      return res.status(400).json({ 
        error: 'Table type ID, pricing type, and price are required', 
        success: false 
      });
    }

    // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert functionality
    await pool.query(`
      INSERT INTO PricingRates (table_type_id, pricing_type, price, price_unit) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      price = VALUES(price), 
      price_unit = VALUES(price_unit),
      is_active = TRUE,
      updated_at = CURRENT_TIMESTAMP
    `, [table_type_id, pricing_type, price, price_unit || 'hour']);
    
    res.json({ success: true, message: 'Pricing rate saved successfully' });
  } catch (error) {
    console.error('Error saving pricing rate:', error);
    res.status(500).json({ error: 'Failed to save pricing rate', success: false });
  }
});

// Update pricing rate
router.put('/rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, price_unit, is_active } = req.body;
    
    await pool.query(
      'UPDATE PricingRates SET price = ?, price_unit = ?, is_active = ? WHERE id = ?',
      [price, price_unit, is_active, id]
    );
    
    res.json({ success: true, message: 'Pricing rate updated successfully' });
  } catch (error) {
    console.error('Error updating pricing rate:', error);
    res.status(500).json({ error: 'Failed to update pricing rate', success: false });
  }
});

// Delete pricing rate
router.delete('/rates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('UPDATE PricingRates SET is_active = FALSE WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Pricing rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting pricing rate:', error);
    res.status(500).json({ error: 'Failed to delete pricing rate', success: false });
  }
});

// Legacy endpoints for backward compatibility
router.put('/deal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    await pool.query(
      'UPDATE PricingRates pr JOIN TableTypes tt ON pr.table_type_id = tt.id SET pr.price = ? WHERE pr.id = ? AND pr.pricing_type = "deal"',
      [price, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating deal price:', error);
    res.status(500).json({ error: 'Failed to update deal price' });
  }
});

router.put('/table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    await pool.query(
      'UPDATE PricingRates pr JOIN TableTypes tt ON pr.table_type_id = tt.id SET pr.price = ? WHERE pr.id = ? AND pr.pricing_type = "regular"',
      [price, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating table price:', error);
    res.status(500).json({ error: 'Failed to update table price' });
  }
});

module.exports = router;