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
const uploadsDir = '/var/www/LPWebsite/LPWebsite/backend/public/uploads/gallery';
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
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, filename, original_name, image_path, upload_date, display_order, active
      FROM HomeGallery 
      WHERE active = true 
      ORDER BY display_order ASC, upload_date DESC
    `);
    
    console.log('Retrieved gallery images:', rows.map(row => ({
      id: row.id,
      filename: row.filename,
      image_path: row.image_path,
      active: row.active
    })));
    
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload new gallery image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { originalname, filename } = req.file;
    const imagePath = `/uploads/gallery/${filename}`;
    
    console.log('File uploaded:', {
      originalname,
      filename,
      imagePath,
      fileSize: req.file.size,
      savedTo: req.file.path
    });

    // Get next display order
    const [maxOrderResult] = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM HomeGallery'
    );
    const displayOrder = maxOrderResult[0].next_order;

    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO HomeGallery (filename, original_name, image_path, display_order, active) VALUES (?, ?, ?, ?, ?)',
      [filename, originalname, imagePath, displayOrder, true]
    );

    console.log('Database record created:', {
      id: result.insertId,
      filename,
      originalname,
      imagePath,
      displayOrder
    });

    res.json({ 
      success: true, 
      id: result.insertId,
      imagePath: imagePath,
      filename: filename,
      originalName: originalname,
      displayOrder: displayOrder
    });
  } catch (err) {
    console.error('Image upload error:', err);
    
    // Clean up file if database insertion failed
    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ error: err.message });
  }
});

// Update image display order
router.put('/:id/order', async (req, res) => {
  try {
    const { displayOrder } = req.body;
    const imageId = req.params.id;

    await pool.query(
      'UPDATE HomeGallery SET display_order = ? WHERE id = ?',
      [displayOrder, imageId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Order update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Toggle image active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const imageId = req.params.id;

    await pool.query(
      'UPDATE HomeGallery SET active = NOT active WHERE id = ?',
      [imageId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Toggle error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete gallery image
router.delete('/:id', async (req, res) => {
  try {
    const imageId = req.params.id;

    // Get image info before deletion
    const [imageInfo] = await pool.query(
      'SELECT filename, image_path FROM HomeGallery WHERE id = ?',
      [imageId]
    );

    if (imageInfo.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from database
    await pool.query('DELETE FROM HomeGallery WHERE id = ?', [imageId]);

    // Delete physical file
    const filePath = path.join(uploadsDir, imageInfo[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Image deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk reorder images
router.put('/reorder', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { imageOrders } = req.body; // Array of {id, displayOrder}
    
    await connection.beginTransaction();
    
    for (const item of imageOrders) {
      await connection.query(
        'UPDATE HomeGallery SET display_order = ? WHERE id = ?',
        [item.displayOrder, item.id]
      );
    }
    
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error('Bulk reorder error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;