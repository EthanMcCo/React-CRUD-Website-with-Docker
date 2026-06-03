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
const uploadsDir = '/var/www/LPWebsite/LPWebsite/backend/public/uploads/shop';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for shop image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'shop-' + uniqueSuffix + path.extname(file.originalname));
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

// =======================================
// CATEGORY ROUTES
// =======================================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        category_id, 
        name, 
        display_name, 
        description, 
        display_order, 
        image_path, 
        active,
        created_at
      FROM ShopCategories 
      WHERE active = true 
      ORDER BY display_order ASC, display_name ASC
    `);
    
    res.json({
      success: true,
      categories: rows
    });
  } catch (err) {
    console.error('Error fetching shop categories:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get all categories (admin view - includes inactive)
router.get('/categories/admin', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        category_id, 
        name, 
        display_name, 
        description, 
        display_order, 
        image_path, 
        active,
        created_at
      FROM ShopCategories 
      ORDER BY display_order ASC, display_name ASC
    `);
    
    res.json({
      success: true,
      categories: rows
    });
  } catch (err) {
    console.error('Error fetching shop categories for admin:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, display_name, description, display_order } = req.body;
    
    if (!name || !display_name) {
      return res.status(400).json({ 
        success: false,
        error: 'Name and display name are required' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO ShopCategories (name, display_name, description, display_order) VALUES (?, ?, ?, ?)',
      [name, display_name, description, display_order || 0]
    );
    
    res.json({ 
      success: true, 
      category_id: result.insertId,
      message: 'Category created successfully'
    });
  } catch (err) {
    console.error('Error creating shop category:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ 
        success: false,
        error: 'Category name already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, display_name, description, display_order, active } = req.body;
    
    const [result] = await pool.query(
      'UPDATE ShopCategories SET name = ?, display_name = ?, description = ?, display_order = ?, active = ? WHERE category_id = ?',
      [name, display_name, description, display_order, active, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({ 
      success: true,
      message: 'Category updated successfully'
    });
  } catch (err) {
    console.error('Error updating shop category:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Upload image for category
router.post('/categories/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided' 
      });
    }

    const categoryId = req.params.id;
    const imagePath = `/uploads/shop/${req.file.filename}`;

    // Get old image path to delete it
    const [oldCategory] = await pool.query(
      'SELECT image_path FROM ShopCategories WHERE category_id = ?',
      [categoryId]
    );

    // Update category with new image path
    await pool.query(
      'UPDATE ShopCategories SET image_path = ? WHERE category_id = ?',
      [imagePath, categoryId]
    );

    // Delete old image file if it exists
    if (oldCategory[0]?.image_path && oldCategory[0].image_path.startsWith('/uploads/')) {
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
    console.error('Category image upload error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete category image
router.delete('/categories/:id/image', async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Get current image path
    const [category] = await pool.query(
      'SELECT image_path FROM ShopCategories WHERE category_id = ?',
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
      'UPDATE ShopCategories SET image_path = NULL WHERE category_id = ?',
      [categoryId]
    );

    res.json({ 
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    console.error('Category image deletion error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check if any shop items use this category
    const [items] = await connection.query(
      'SELECT COUNT(*) as count FROM ShopItems WHERE category_id = ?',
      [req.params.id]
    );
    
    if (items[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'Cannot delete category with existing shop items. Move or delete the items first.' 
      });
    }

    // Get image path before deletion
    const [category] = await connection.query(
      'SELECT image_path FROM ShopCategories WHERE category_id = ?',
      [req.params.id]
    );
    
    // Delete the category
    const [deleteResult] = await connection.query(
      'DELETE FROM ShopCategories WHERE category_id = ?',
      [req.params.id]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
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
    res.json({ 
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Category deletion error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  } finally {
    connection.release();
  }
});

// =======================================
// SHOP ITEMS ROUTES
// =======================================

// Get all shop items with optional filtering
router.get('/items', async (req, res) => {
  try {
    const { 
      category_id, 
      status, 
      featured, 
      search, 
      sort_by = 'name', 
      sort_order = 'ASC',
      limit,
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT 
        si.item_id,
        si.name,
        si.description,
        si.short_description,
        si.price,
        si.category_id,
        si.image_path,
        si.additional_images,
        si.status,
        si.stock_quantity,
        si.featured,
        si.created_at,
        sc.display_name as category_name
      FROM ShopItems si
      LEFT JOIN ShopCategories sc ON si.category_id = sc.category_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (category_id) {
      query += ' AND si.category_id = ?';
      params.push(category_id);
    }
    
    if (status) {
      query += ' AND si.status = ?';
      params.push(status);
    } else {
      // Default to active items for public view
      query += ' AND si.status = "active"';
    }
    
    if (featured === 'true') {
      query += ' AND si.featured = true';
    }
    
    if (search) {
      query += ' AND (si.name LIKE ? OR si.description LIKE ? OR si.short_description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add sorting
    const validSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sort_by) && validSortOrders.includes(sort_order.toUpperCase())) {
      query += ` ORDER BY si.${sort_by} ${sort_order.toUpperCase()}`;
      
      // Featured items first if not explicitly sorting by featured
      if (sort_by !== 'featured') {
        query = query.replace(`ORDER BY si.${sort_by}`, `ORDER BY si.featured DESC, si.${sort_by}`);
      }
    } else {
      query += ' ORDER BY si.featured DESC, si.name ASC';
    }
    
    // Add pagination
    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    }
    
    const [rows] = await pool.query(query, params);
    
    // Parse additional_images JSON field
    const items = rows.map(item => ({
      ...item,
      additional_images: item.additional_images ? JSON.parse(item.additional_images) : []
    }));
    
    res.json({
      success: true,
      items: items
    });
  } catch (err) {
    console.error('Error fetching shop items:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get single shop item
router.get('/items/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        si.item_id,
        si.name,
        si.description,
        si.short_description,
        si.price,
        si.category_id,
        si.image_path,
        si.additional_images,
        si.status,
        si.stock_quantity,
        si.featured,
        si.created_at,
        sc.display_name as category_name
      FROM ShopItems si
      LEFT JOIN ShopCategories sc ON si.category_id = sc.category_id
      WHERE si.item_id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }
    
    const item = {
      ...rows[0],
      additional_images: rows[0].additional_images ? JSON.parse(rows[0].additional_images) : []
    };
    
    res.json({
      success: true,
      item: item
    });
  } catch (err) {
    console.error('Error fetching shop item:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Create new shop item
router.post('/items', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      short_description, 
      price, 
      category_id, 
      status = 'active',
      stock_quantity = 0,
      featured = false 
    } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }
    
    const [result] = await pool.query(`
      INSERT INTO ShopItems 
      (name, description, short_description, price, category_id, status, stock_quantity, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description, short_description, price, category_id, status, stock_quantity, featured]);
    
    res.json({
      success: true,
      item_id: result.insertId,
      message: 'Shop item created successfully'
    });
  } catch (err) {
    console.error('Error creating shop item:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Update shop item
router.put('/items/:id', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      short_description, 
      price, 
      category_id, 
      status,
      stock_quantity,
      featured 
    } = req.body;
    
    const [result] = await pool.query(`
      UPDATE ShopItems 
      SET name = ?, description = ?, short_description = ?, price = ?, 
          category_id = ?, status = ?, stock_quantity = ?, featured = ?
      WHERE item_id = ?
    `, [name, description, short_description, price, category_id, status, stock_quantity, featured, req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop item updated successfully'
    });
  } catch (err) {
    console.error('Error updating shop item:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Upload primary image for shop item
router.post('/items/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided' 
      });
    }

    const itemId = req.params.id;
    const imagePath = `/uploads/shop/${req.file.filename}`;

    // Get old image path to delete it
    const [oldItem] = await pool.query(
      'SELECT image_path FROM ShopItems WHERE item_id = ?',
      [itemId]
    );

    // Update item with new image path
    await pool.query(
      'UPDATE ShopItems SET image_path = ? WHERE item_id = ?',
      [imagePath, itemId]
    );

    // Delete old image file if it exists
    if (oldItem[0]?.image_path && oldItem[0].image_path.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../public', oldItem[0].image_path);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json({ 
      success: true, 
      imagePath: imagePath 
    });
  } catch (err) {
    console.error('Shop item image upload error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete primary image for shop item
router.delete('/items/:id/image', async (req, res) => {
  try {
    const itemId = req.params.id;

    // Get current image path
    const [item] = await pool.query(
      'SELECT image_path FROM ShopItems WHERE item_id = ?',
      [itemId]
    );

    if (item[0]?.image_path && item[0].image_path.startsWith('/uploads/')) {
      // Delete image file
      const imagePath = path.join(__dirname, '../public', item[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove image path from database
    await pool.query(
      'UPDATE ShopItems SET image_path = NULL WHERE item_id = ?',
      [itemId]
    );

    res.json({ 
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    console.error('Shop item image deletion error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete shop item
router.delete('/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;

    // Get image paths before deletion
    const [item] = await pool.query(
      'SELECT image_path, additional_images FROM ShopItems WHERE item_id = ?',
      [itemId]
    );

    const [result] = await pool.query(
      'DELETE FROM ShopItems WHERE item_id = ?',
      [itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Shop item not found'
      });
    }

    // Delete primary image file if it exists
    if (item[0]?.image_path && item[0].image_path.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../public', item[0].image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete additional images if they exist
    if (item[0]?.additional_images) {
      const additionalImages = JSON.parse(item[0].additional_images);
      additionalImages.forEach(imagePath => {
        if (imagePath && imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '../public', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Shop item deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting shop item:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/items', async (req, res) => {
  try {
    const { 
      category_id, 
      status, 
      featured, 
      search, 
      sort_by = 'name', 
      sort_order = 'ASC',
      limit,
      offset = 0,
      admin // NEW: Admin flag to get all items regardless of status
    } = req.query;
    
    let query = `
      SELECT 
        si.item_id,
        si.name,
        si.description,
        si.short_description,
        si.price,
        si.category_id,
        si.image_path,
        si.additional_images,
        si.status,
        si.stock_quantity,
        si.featured,
        si.created_at,
        sc.display_name as category_name
      FROM ShopItems si
      LEFT JOIN ShopCategories sc ON si.category_id = sc.category_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (category_id) {
      query += ' AND si.category_id = ?';
      params.push(category_id);
    }
    
    // UPDATED: Handle status filtering with admin override
    if (admin === 'true') {
      // Admin view: show all items regardless of status
      if (status && status !== 'all') {
        query += ' AND si.status = ?';
        params.push(status);
      }
      // Don't add default status filter for admin
    } else {
      // Public view: only show active items by default
      if (status && status !== 'all') {
        query += ' AND si.status = ?';
        params.push(status);
      } else {
        query += ' AND si.status = "active"';
      }
    }
    
    if (featured === 'true') {
      query += ' AND si.featured = true';
    }
    
    if (search) {
      query += ' AND (si.name LIKE ? OR si.description LIKE ? OR si.short_description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add sorting
    const validSortFields = ['name', 'price', 'created_at', 'stock_quantity'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sort_by) && validSortOrders.includes(sort_order.toUpperCase())) {
      query += ` ORDER BY si.${sort_by} ${sort_order.toUpperCase()}`;
      
      // Featured items first if not explicitly sorting by featured (and not admin view)
      if (sort_by !== 'featured' && admin !== 'true') {
        query = query.replace(`ORDER BY si.${sort_by}`, `ORDER BY si.featured DESC, si.${sort_by}`);
      }
    } else {
      if (admin === 'true') {
        query += ' ORDER BY si.created_at DESC'; // Admin: newest first
      } else {
        query += ' ORDER BY si.featured DESC, si.name ASC'; // Public: featured first
      }
    }
    
    // Add pagination
    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));
    }
    
    console.log('Executing query:', query); // Debug log
    console.log('With params:', params); // Debug log
    
    const [rows] = await pool.query(query, params);
    
    console.log(`Found ${rows.length} shop items`); // Debug log
    
    // Parse additional_images JSON field
    const items = rows.map(item => ({
      ...item,
      additional_images: item.additional_images ? JSON.parse(item.additional_images) : []
    }));
    
    res.json({
      success: true,
      items: items,
      debug: {
        query_type: admin === 'true' ? 'admin' : 'public',
        total_found: items.length
      }
    });
  } catch (err) {
    console.error('Error fetching shop items:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Get featured items (for homepage or featured section)
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        si.item_id,
        si.name,
        si.short_description,
        si.price,
        si.image_path,
        si.status,
        sc.display_name as category_name
      FROM ShopItems si
      LEFT JOIN ShopCategories sc ON si.category_id = sc.category_id
      WHERE si.featured = true AND si.status = 'active'
      ORDER BY si.created_at DESC
      LIMIT 6
    `);
    
    res.json({
      success: true,
      items: rows
    });
  } catch (err) {
    console.error('Error fetching featured items:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;