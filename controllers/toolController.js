const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const pdfService = require('../services/pdfService');
const convService = require('../services/conversionService');
const TOOLS = require('../services/toolRegistry');
const emailService = require('../services/emailService');

// Rate limiter: 20 tasks/day for free users
async function checkRateLimit(userId) {
  const [rows] = await db.query(
    'SELECT tasks_today, last_reset, plan FROM users WHERE id = ?',
    [userId]
  );
  const user = rows[0];
  const today = new Date().toISOString().slice(0, 10);

  if (user.last_reset < today) {
    await db.query(
      'UPDATE users SET tasks_today = 0, last_reset = ? WHERE id = ?',
      [today, userId]
    );
    return true;
  }

  const dailyLimit = parseInt(process.env.FREE_DAILY_LIMIT) || 20;
  return user.plan === 'pro' || user.tasks_today < dailyLimit;
}

// Process tool request
exports.processTool = async (req, res) => {
  const { slug } = req.params;
  const userId = req.user?.id || null;

  try {
    // Validate tool slug
    const tool = TOOLS.find(t => t.slug === slug);
    if (!tool) {
      return res.status(404).json({ error: `Tool '${slug}' not found.` });
    }

    // Rate limit check for logged-in users
    if (userId) {
      const allowed = await checkRateLimit(userId);
      if (!allowed) {
        return res.status(429).json({
          error: 'Daily limit reached. Upgrade to Pro for unlimited tasks.'
        });
      }
    }

    const inputPath = req.file?.path;
    const files = req.files;

    if (!inputPath && !files) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Route to the correct service
    let outputPath;

    switch (slug) {
      case 'merge-pdf':
        outputPath = await pdfService.merge(files);
        break;

      case 'split-pdf':
        outputPath = await pdfService.split(inputPath, req.body);
        break;

      case 'compress-pdf':
        outputPath = await pdfService.compress(inputPath);
        break;

      case 'rotate-pdf':
        outputPath = await pdfService.rotate(inputPath, req.body.degrees || 90);
        break;

      case 'organize-pdf':
        outputPath = await pdfService.organize(inputPath, req.body.pageOrder);
        break;

      case 'extract-pdf-pages':
        outputPath = await pdfService.extractPages(inputPath, req.body.pages);
        break;

      case 'delete-pdf-pages':
        outputPath = await pdfService.deletePages(inputPath, req.body.pages);
        break;

      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'image-to-pdf':
        outputPath = await pdfService.imageToPdf(inputPath);
        break;

      case 'password-protect-pdf':
        outputPath = await pdfService.passwordProtect(inputPath, req.body.password);
        break;

      case 'unlock-pdf':
        outputPath = await pdfService.unlock(inputPath, req.body.password);
        break;

      case 'compress-images':
        outputPath = await convService.compressImage(inputPath, req.body.quality || 80);
        break;

      case 'jpg-to-png':
        outputPath = await convService.jpgToPng(inputPath);
        break;

      case 'png-to-jpg':
        outputPath = await convService.pngToJpg(inputPath);
        break;

      case 'pdf-to-text':
        outputPath = await convService.pdfToText(inputPath);
        break;

      case 'pdf-to-word':
        outputPath = await convService.pdfToOffice(inputPath, 'docx');
        break;

      case 'pdf-to-excel':
        outputPath = await convService.pdfToOffice(inputPath, 'xlsx');
        break;

      case 'pdf-to-pptx':
        outputPath = await convService.pdfToOffice(inputPath, 'pptx');
        break;

      case 'word-to-pdf':
      case 'excel-to-pdf':
      case 'pptx-to-pdf':
        outputPath = await convService.officeToPdf(inputPath);
        break;

      case 'html-to-pdf':
        outputPath = await convService.htmlToPdf(inputPath);
        break;

      default:
        return res.status(501).json({
          error: `Tool '${slug}' is not yet implemented. Coming soon!`
        });
    }

    const filename = path.basename(outputPath);

    // Log task for authenticated users
    if (userId) {
      await db.query(
        'INSERT INTO tasks (user_id, tool_slug, input_file, output_file, status) VALUES (?,?,?,?,?)',
        [userId, slug, path.basename(inputPath || files[0].originalname), filename, 'done']
      );
      await db.query('UPDATE users SET tasks_today = tasks_today + 1 WHERE id = ?', [userId]);

      // Send task completion email (async, don't block response)
      try {
        const [users] = await db.query(
          'SELECT name, email FROM users WHERE id = ?',
          [userId]
        );

        if (users.length > 0) {
          const user = users[0];
          emailService.sendTaskCompletionEmail(user.email, user.name, tool.name, filename).catch(err => {
            console.error('Failed to send task completion email:', err);
          });
        }
      } catch (emailError) {
        console.error('Error fetching user for email notification:', emailError);
      }
    }

    res.json({
      success: true,
      downloadUrl: `/api/tools/download/${filename}`,
      filename,
      tool: tool.name
    });

  } catch (err) {
    console.error(`[${slug}] Error:`, err);
    res.status(500).json({
      error: 'Processing failed. Please try again.',
      details: err.message
    });
  }
};

// Download processed file
exports.downloadFile = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../tmp/processed', req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found or expired.' });
    }

    res.download(filePath);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Download failed.' });
  }
};

// Get list of available tools
exports.getTools = async (req, res) => {
  try {
    const { category } = req.query;

    let tools = TOOLS;

    if (category) {
      tools = TOOLS.filter(tool => tool.category === category);
    }

    res.json({
      tools: tools.map(tool => ({
        slug: tool.slug,
        name: tool.name,
        category: tool.category
      }))
    });

  } catch (err) {
    console.error('Get tools error:', err);
    res.status(500).json({ error: 'Failed to fetch tools.' });
  }
};
