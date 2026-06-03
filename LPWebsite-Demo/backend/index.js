require('dotenv').config({ path: '/var/www/LPWebsite/LPWebsite/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path'); // Add this
const faqRoutes = require('./routes/faq');
const teamRoutes = require('./routes/teams');
const contactRoutes = require('./routes/contact');
const playerRoutes = require('./routes/players');
const menuRoutes = require('./routes/menu');
const pricingRoutes = require('./routes/pricing');
const eventsRoutes = require('./routes/events');
const announcementRoutes = require('./routes/announcements');
const shopRoutes = require('./routes/shop');
const businessSettingsRoutes = require('./routes/business-settings');
const homeGalleryRoutes = require('./routes/home-gallery');
const authRoutes = require('./routes/auth');
const app = express();

app.use(cors({
  origin: ['http://192.168.0.111', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ADDED: Serve static files from public directory with proper headers
app.use('/uploads', express.static('/var/www/LPWebsite/LPWebsite/backend/public/uploads', {
  maxAge: '1y', // Cache for 1 year
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    time: new Date().toISOString()
  });
});

// Routes
app.use('/api/faqs', faqRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/business-settings', businessSettingsRoutes);
app.use('/api/home-gallery', homeGalleryRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const port = process.env.BACKEND_PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment:', {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    backend_port: port
  });
});