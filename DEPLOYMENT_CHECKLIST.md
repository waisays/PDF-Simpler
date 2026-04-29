# PDF Simpler - Phase 2 Deployment Checklist

## ✅ Pre-Deployment Checklist

### Database Setup
- [ ] Create MySQL database on Hostinger
- [ ] Run database_schema.sql to create tables
- [ ] Verify stripe_customer_id column exists in users table
- [ ] Test database connection from application
- [ ] Set up database backups

### Environment Configuration
- [ ] Update .env with production values:
  - [ ] DB_HOST, DB_USER, DB_PASS, DB_NAME
  - [ ] JWT_SECRET (use strong random string)
  - [ ] STRIPE_SECRET_KEY (live mode)
  - [ ] STRIPE_WEBHOOK_SECRET
  - [ ] EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
  - [ ] BASE_URL (production domain)
  - [ ] NODE_ENV=production

### Stripe Configuration
- [ ] Create Stripe account (if not already)
- [ ] Set up Pro plan product ($4.99/month)
- [ ] Configure webhook endpoint
- [ ] Test webhook signature verification
- [ ] Verify checkout session creation
- [ ] Test subscription upgrade flow
- [ ] Test subscription cancellation flow

### Email Service Setup
- [ ] Create email account (Gmail recommended)
- [ ] Generate app password for SMTP
- [ ] Test email sending functionality
- [ ] Verify email templates render correctly
- [ ] Test welcome email delivery
- [ ] Test password reset email flow
- [ ] Test task completion notifications
- [ ] Test subscription emails

### File Upload Configuration
- [ ] Create tmp/ directory on server
- [ ] Set proper permissions (755)
- [ ] Configure upload limits in Hostinger
- [ ] Test file upload functionality
- [ ] Verify file cleanup cron job works

### SSL/HTTPS Setup
- [ ] Enable SSL certificate on Hostinger
- [ ] Configure HTTPS redirect
- [ ] Update BASE_URL to use https://
- [ ] Test secure connections

### Domain Configuration
- [ ] Point domain to Hostinger server
- [ ] Configure DNS records
- [ ] Test domain resolution
- [ ] Verify SSL certificate

## 🚀 Deployment Steps

### 1. Upload Files to Hostinger
```bash
# Upload all files via FTP or File Manager
# Exclude: node_modules, .git, .env
```

### 2. Install Dependencies
```bash
ssh user@hostinger-server
cd public_html
npm install --production
```

### 3. Setup Environment
```bash
# Create .env file with production values
cp .env.example .env
nano .env  # Add production values
```

### 4. Initialize Database
```bash
# Run database schema
mysql -u username -p database_name < database_schema.sql
```

### 5. Start Application
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name pdf-simpler
pm2 save
pm2 startup

# Or using Node directly
node server.js
```

### 6. Configure Webhook
```bash
# Set up Stripe webhook
# Endpoint: https://yourdomain.com/api/user/webhook
# Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_succeeded
```

### 7. Test Application
- [ ] Test user registration
- [ ] Test user login
- [ ] Test password reset
- [ ] Test file upload and processing
- [ ] Test payment flow
- [ ] Test email notifications
- [ ] Test analytics dashboard

## 🔧 Post-Deployment Tasks

### Monitoring Setup
- [ ] Set up application monitoring
- [ ] Configure error logging
- [ ] Set up uptime monitoring
- [ ] Monitor disk space usage
- [ ] Monitor database performance

### Backup Strategy
- [ ] Set up automated database backups
- [ ] Configure file backup for uploads
- [ ] Test restore procedures
- [ ] Document backup locations

### Security Hardening
- [ ] Review and update security headers
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

### Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Monitor response times
- [ ] Set up CDN if needed

## 📊 Testing Checklist

### Functional Testing
- [ ] All 35+ tools work correctly
- [ ] File conversions produce valid output
- [ ] User authentication works
- [ ] Payment processing completes
- [ ] Email notifications arrive
- [ ] Analytics display correctly

### Integration Testing
- [ ] Stripe webhooks process correctly
- [ ] Email service sends messages
- [ ] Database operations complete
- [ ] File cleanup runs on schedule
- [ ] Rate limiting enforced

### User Experience Testing
- [ ] Responsive design works on mobile
- [ ] Loading states display properly
- [ ] Error messages are clear
- [ ] Navigation flows smoothly
- [ ] Forms validate correctly

## 🚨 Rollback Plan

### If Deployment Fails
1. Restore previous version from git
2. Restore database from backup
3. Restart application
4. Verify functionality
5. Investigate failure cause

### Emergency Contacts
- [ ] Developer: [Contact Info]
- [ ] Hostinger Support: [Contact Info]
- [ ] Stripe Support: [Contact Info]

## 📝 Documentation Updates

- [ ] Update API documentation with production URLs
- [ ] Update deployment guide with specific Hostinger steps
- [ ] Document any custom configurations
- [ ] Create troubleshooting guide
- [ ] Update README with production links

## ✅ Final Verification

Before going live:
- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Backups verified
- [ ] Team notified
- [ ] Users informed (if applicable)

---

**Deployment Status**: Ready for Production
**Phase**: 2 Complete
**Target Date**: [Insert Date]
**Deployed By**: [Insert Name]