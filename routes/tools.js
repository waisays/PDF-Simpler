const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const authMiddleware = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

// Process tool (optional auth - guests can process but need auth to download)
router.post('/:slug', authMiddleware(false), (req, res, next) => {
  // Use single or multiple file upload based on tool
  if (req.params.slug === 'merge-pdf' || req.params.slug === 'merge-images') {
    uploadMultiple(req, res, next);
  } else {
    uploadSingle(req, res, next);
  }
}, toolController.processTool);

// Get list of available tools (public)
router.get('/list', toolController.getTools);

// Download processed file (requires authentication)
router.get('/download/:filename', authMiddleware(true), toolController.downloadFile);

module.exports = router;
