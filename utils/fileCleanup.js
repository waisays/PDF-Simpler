const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const uploadDir = path.join(__dirname, '../tmp/uploads');
const processedDir = path.join(__dirname, '../tmp/processed');

// Cleanup function to delete old files
function cleanupOldFiles(directory, maxAgeHours = 2) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory ${directory} does not exist, skipping cleanup.`);
      return;
    }

    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > maxAgeMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`Deleted old file: ${file}`);
      }
    });

    if (deletedCount > 0) {
      console.log(`Cleanup completed: ${deletedCount} files deleted from ${directory}`);
    } else {
      console.log(`No old files to delete in ${directory}`);
    }

  } catch (error) {
    console.error(`Error cleaning up directory ${directory}:`, error);
  }
}

// Main cleanup function
function performCleanup() {
  console.log('Starting file cleanup...');
  const maxAgeHours = parseInt(process.env.TMP_CLEANUP_HOURS) || 2;

  cleanupOldFiles(uploadDir, maxAgeHours);
  cleanupOldFiles(processedDir, maxAgeHours);

  console.log('File cleanup completed.');
}

// Start cron job (runs every hour)
function startCleanupCron() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    performCleanup();
  });

  console.log('File cleanup cron job scheduled (runs every hour).');

  // Run cleanup immediately on startup
  performCleanup();
}

// Manual cleanup trigger (for testing)
function triggerCleanup() {
  performCleanup();
}

module.exports = {
  startCleanupCron,
  triggerCleanup,
  performCleanup
};
