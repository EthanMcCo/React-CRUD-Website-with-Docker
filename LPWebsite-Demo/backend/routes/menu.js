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
const uploadsDir = '/var/www/LPWebsite/LPWebsite/backend/public/uploads/categories';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all categories (updated to include image info)
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT category_id, name, display_name, display_order, active, image_path, image_position
      FROM MenuCategories 
      WHERE active = true 
      ORDER BY display_order, display_name
    `);
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new category (updated to handle image)
router.post('/categories', async (req, res) => {
  try {
    const { name, display_name, display_order, image_position } = req.body;
    
    console.log('Received category data:', req.body); // Debug log
    
    // Validate input
    if (!name || !display_name) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO MenuCategories (name, display_name, display_order, image_position) VALUES (?, ?, ?, ?)',
      [name, display_name, display_order || 0, image_position || 'none']
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Category creation error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update category (updated to handle image)
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, display_name, display_order, active, image_position } = req.body;
    
    await pool.query(
      'UPDATE MenuCategories SET name = ?, display_name = ?, display_order = ?, active = ?, image_position = ? WHERE category_id = ?',
      [name, display_name, display_order, active, image_position || 'none', req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload image for category
router.post('/categories/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const categoryId = req.params.id;
    const imagePath = `/uploads/categories/${req.file.filename}`;

    // Get old image path to delete it
    const [oldCategory] = await pool.query(
      'SELECT image_path FROM MenuCategories WHERE category_id = ?',
      [categoryId]
    );

    // Update category with new image path
    await pool.query(
      'UPDATE MenuCategories SET image_path = ? WHERE category_id = ?',
      [imagePath, categoryId]
    );

    // Delete old image file if it exists and is not a default image
    if (oldCategory[0]?.image_path && 
        oldCategory[0].image_path.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../public', oldCategory[0].image_path);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json({ 
      success: true, 
      imagePath: imagePath 
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete category image
router.delete('/categories/:id/image', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Get current image path
    const [category] = await pool.query(
      'SELECT image_path FROM MenuCategories WHERE category_id = ?',
      [categoryId]
    );

    if (category[0]?.image_path && category[0].image_path.startsWith('/uploads/')) {
      // Delete image file
      const imagePath = path.join(__dirname, '../public', category[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image path from database
    await pool.query(
      'UPDATE MenuCategories SET image_path = NULL, image_position = "none" WHERE category_id = ?',
      [categoryId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Image deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Soft delete category (updated to handle image cleanup)
router.delete('/categories/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if any menu items use this category
    const [items] = await connection.query(
      'SELECT COUNT(*) as count FROM Food WHERE category_id = ?',
      [req.params.id]
    );
    
    if (items[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Cannot delete category with existing menu items. Move or delete the items first.' 
      });
    }

    // Get image path before deletion
    const [category] = await connection.query(
      'SELECT image_path FROM MenuCategories WHERE category_id = ?',
      [req.params.id]
    );
    
    // HARD DELETE - actually remove the category from database
    const [deleteResult] = await connection.query(
      'DELETE FROM MenuCategories WHERE category_id = ?',
      [req.params.id]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: 'Category not found'
      });
    }

    // Delete image file if it exists
    if (category[0]?.image_path && category[0].image_path.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', category[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error('Category deletion error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// Get all menu items - UPDATED to handle both old and new structure
router.get('/', async (req, res) => {
  try {
    // Try the new structure with categories and card_size
    try {
      const [rows] = await pool.query(`
        SELECT 
          f.item_id, f.name, f.description, f.price, f.card_size,
          mc.name as type, mc.display_name as type_display,
          mc.display_order, mc.image_path, mc.image_position
        FROM Food f
        JOIN MenuCategories mc ON f.category_id = mc.category_id
        WHERE mc.active = true
        ORDER BY mc.display_order, mc.display_name, 
                 CASE WHEN f.card_size = 'large' THEN 1 ELSE 2 END, f.name
      `);
      res.json(rows);
    } catch (joinError) {
      // If JOIN fails (category_id doesn't exist yet), fall back to old structure
      console.log('Falling back to old structure:', joinError.message);
      const [rows] = await pool.query('SELECT *, "small" as card_size FROM Food ORDER BY type');
      res.json(rows);
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new menu item
router.post('/', async (req, res) => {
  try {
    const { name, description, price, type, cardSize } = req.body;
    
    // Check if we're using the new category structure
    const [categoryCheck] = await pool.query('SHOW COLUMNS FROM Food LIKE "category_id"');
    
    if (categoryCheck.length > 0) {
      // New structure - find category_id from type name
      const [categories] = await pool.query(
        'SELECT category_id FROM MenuCategories WHERE name = ?',
        [type]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      const [result] = await pool.query(
        'INSERT INTO Food (name, description, price, category_id, card_size) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, categories[0].category_id, cardSize || 'small']
      );
      res.json({ success: true, id: result.insertId });
    } else {
      // Old structure
      const [result] = await pool.query(
        'INSERT INTO Food (name, description, price, type, card_size) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, type, cardSize || 'small']
      );
      res.json({ success: true, id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Food WHERE item_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, type, cardSize } = req.body;
    
    // Check if we're using the new category structure
    const [categoryCheck] = await pool.query('SHOW COLUMNS FROM Food LIKE "category_id"');
    
    if (categoryCheck.length > 0) {
      // New structure - find category_id from type name
      const [categories] = await pool.query(
        'SELECT category_id FROM MenuCategories WHERE name = ?',
        [type]
      );
      
      if (categories.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      
      await pool.query(
        'UPDATE Food SET name = ?, description = ?, price = ?, category_id = ?, card_size = ? WHERE item_id = ?',
        [name, description, price, categories[0].category_id, cardSize || 'small', req.params.id]
      );
    } else {
      // Old structure
      await pool.query(
        'UPDATE Food SET name = ?, description = ?, price = ?, type = ?, card_size = ? WHERE item_id = ?',
        [name, description, price, type, cardSize || 'small', req.params.id]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;