require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tools');
const userRoutes = require('./routes/user');
const { startCleanupCron } = require('./utils/fileCleanup');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity in development
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/favicon')) {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Start cleanup cron job
startCleanupCron();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`PDF Simpler running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
});

module.exports = app;
