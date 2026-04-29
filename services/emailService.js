const nodemailer = require('nodemailer');
const db = require('../config/db');

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
  }
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}

// Send welcome email
async function sendWelcomeEmail(userEmail, userName) {
  try {
    const mailOptions = {
      from: `"PDF Simpler" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: userEmail,
      subject: 'Welcome to PDF Simpler! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PDF Simpler! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome to PDF Simpler - your complete PDF and file toolkit!</p>
              <p>You now have access to 30+ powerful tools including:</p>
              <ul>
                <li>✅ PDF editing (merge, split, compress, rotate)</li>
                <li>✅ File conversions (PDF ↔ Word, Excel, PowerPoint)</li>
                <li>✅ Image processing (compress, convert, merge)</li>
                <li>✅ And much more!</li>
              </ul>
              <p><strong>Your Free Plan Benefits:</strong></p>
              <ul>
                <li>20 tasks per day</li>
                <li>All basic PDF tools</li>
                <li>No credit card required</li>
              </ul>
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/" class="button">Start Using PDF Simpler</a>
              <p>Need more? Upgrade to Pro for unlimited tasks and priority processing!</p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The PDF Simpler Team</p>
            </div>
            <div class="footer">
              <p>© 2026 PDF Simpler. All rights reserved.</p>
              <p>You received this email because you signed up for a PDF Simpler account.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send password reset email
async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  try {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password.html?token=${resetToken}`;

    const mailOptions = {
      from: `"PDF Simpler" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: userEmail,
      subject: 'Reset Your Password - PDF Simpler',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password for your PDF Simpler account.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>This link will expire in 1 hour for your security.</p>
              <div class="warning">
                <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
              </div>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The PDF Simpler Team</p>
            </div>
            <div class="footer">
              <p>© 2026 PDF Simpler. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Send task completion email
async function sendTaskCompletionEmail(userEmail, userName, toolName, fileName) {
  try {
    const mailOptions = {
      from: `"PDF Simpler" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: userEmail,
      subject: `Your ${toolName} task is complete! ✅`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .file-info { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Complete! ✅</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! Your <strong>${toolName}</strong> task has been completed successfully.</p>
              <div class="file-info">
                <p><strong>Processed File:</strong> ${fileName}</p>
              </div>
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard.html" class="button">Download Your File</a>
              <p>Your file is ready for download and will be available for the next 2 hours.</p>
              <p>Thanks for using PDF Simpler!</p>
              <p>Best regards,<br>The PDF Simpler Team</p>
            </div>
            <div class="footer">
              <p>© 2026 PDF Simpler. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Task completion email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending task completion email:', error);
    return false;
  }
}

// Send subscription upgrade email
async function sendSubscriptionEmail(userEmail, userName, planType) {
  try {
    const isUpgrade = planType === 'pro';
    const subject = isUpgrade ? 'Welcome to PDF Simpler Pro! 🚀' : 'Your PDF Simpler subscription has been updated';

    const mailOptions = {
      from: `"PDF Simpler" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: userEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: #e0e7ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .features ul { list-style: none; padding: 0; }
            .features li { padding: 8px 0; border-bottom: 1px solid #c7d2fe; }
            .features li:last-child { border-bottom: none; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isUpgrade ? 'Welcome to Pro! 🚀' : 'Subscription Updated'}</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              ${isUpgrade ? `
                <p>Congratulations! You've successfully upgraded to PDF Simpler Pro!</p>
                <div class="features">
                  <h3>🎉 Your Pro Benefits:</h3>
                  <ul>
                    <li>✅ Unlimited tasks per day</li>
                    <li>✅ Priority processing</li>
                    <li>✅ Access to all 30+ tools</li>
                    <li>✅ Enhanced dashboard analytics</li>
                    <li>✅ Priority customer support</li>
                  </ul>
                </div>
              ` : `
                <p>Your subscription has been successfully updated.</p>
              `}
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard.html" class="button">Go to Dashboard</a>
              <p>Start enjoying your enhanced PDF Simpler experience!</p>
              <p>If you have any questions, our support team is here to help.</p>
              <p>Best regards,<br>The PDF Simpler Team</p>
            </div>
            <div class="footer">
              <p>© 2026 PDF Simpler. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Subscription email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending subscription email:', error);
    return false;
  }
}

// Send daily usage summary email (optional feature)
async function sendDailySummaryEmail(userEmail, userName, stats) {
  try {
    const mailOptions = {
      from: `"PDF Simpler" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: userEmail,
      subject: `Your Daily PDF Simpler Summary - ${new Date().toLocaleDateString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .stat-label { font-size: 12px; color: #64748B; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Daily Summary 📊</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Here's your PDF Simpler activity summary for today:</p>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.tasksCompleted}</div>
                  <div class="stat-label">Tasks Completed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.filesProcessed}</div>
                  <div class="stat-label">Files Processed</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.toolsUsed}</div>
                  <div class="stat-label">Different Tools Used</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.successRate}%</div>
                  <div class="stat-label">Success Rate</div>
                </div>
              </div>
              <p>Keep up the great work! Your files are being processed efficiently.</p>
              <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard.html" style="color: #3b82f6; text-decoration: none;">View Detailed Analytics →</a>
              <p>Best regards,<br>The PDF Simpler Team</p>
            </div>
            <div class="footer">
              <p>© 2026 PDF Simpler. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Daily summary email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending daily summary email:', error);
    return false;
  }
}

// Send error notification email (for critical errors)
async function sendErrorNotificationEmail(errorDetails) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pdfsimpler.com';

    const mailOptions = {
      from: `"PDF Simpler System" <${process.env.EMAIL_FROM || 'noreply@pdfsimpler.com'}>`,
      to: adminEmail,
      subject: `🚨 System Error: ${errorDetails.type}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .error-details { background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; color: #64748B; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 System Error Alert</h1>
            </div>
            <div class="content">
              <p><strong>Error Type:</strong> ${errorDetails.type}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p><strong>User:</strong> ${errorDetails.userId || 'N/A'}</p>
              <div class="error-details">
                <p><strong>Error Message:</strong></p>
                <pre>${errorDetails.message}</pre>
              </div>
              <p><strong>Stack Trace:</strong></p>
              <pre style="background: #f3f4f6; padding: 10px; border-radius: 5px; overflow-x: auto;">${errorDetails.stack || 'No stack trace available'}</pre>
              <p>Please investigate this error as soon as possible.</p>
            </div>
            <div class="footer">
              <p>PDF Simpler System Monitor</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Error notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending error notification email:', error);
    return false;
  }
}

module.exports = {
  verifyEmailConfig,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendTaskCompletionEmail,
  sendSubscriptionEmail,
  sendDailySummaryEmail,
  sendErrorNotificationEmail,
  transporter
};