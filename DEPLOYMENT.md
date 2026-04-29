# PDF Simpler - Deployment Guide

## Hostinger VPS Deployment

### Prerequisites
- Hostinger VPS or Shared Hosting plan
- SSH access (for VPS) or File Manager access
- MySQL database access
- Node.js 20+ support

### Step 1: Prepare Your Files

1. **Clone repository locally**
   ```bash
   git clone https://github.com/waisays/pdf-simpler.git
   cd pdf-simpler
   ```

2. **Install dependencies**
   ```bash
   npm install --production
   ```

3. **Create production .env file**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

### Step 2: Set Up Database

1. **Create MySQL database via hPanel**
   - Go to MySQL Databases
   - Create new database: `u161272042_pdfsimpler`
   - Create database user
   - Grant all privileges

2. **Import schema**
   ```bash
   mysql -h localhost -u u161272042_pdfsimpler -p u161272042_pdfsimpler < database_schema.sql
   ```

3. **Verify tables created**
   ```sql
   USE u161272042_pdfsimpler;
   SHOW TABLES;
   ```

### Step 3: Upload Files

#### Option A: Via File Manager
1. Log in to Hostinger hPanel
2. Go to File Manager
3. Navigate to public_html or your domain folder
4. Upload all files except:
   - `node_modules/`
   - `.env`
   - `.git/`
   - `tmp/`

#### Option B: Via Git
1. Set up Git repository on Hostinger
2. Push your code
3. SSH into server and pull changes

#### Option C: Via SFTP
```bash
# Using FileZilla or similar SFTP client
# Connect to your Hostinger server
# Upload files to public_html directory
```

### Step 4: Configure Node.js App

1. **Go to hPanel → Hosting → Setup**
2. **Select Node.js version**: 20.x
3. **Set entry point**: `server.js`
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_USER=u161272042_pdfsimpler
   DB_PASS=your_password
   DB_NAME=u161272042_pdfsimpler
   JWT_SECRET=your_64_char_secret
   BASE_URL=https://pdfsimpler.com
   FREE_DAILY_LIMIT=20
   UPLOAD_MAX_MB=100
   TMP_CLEANUP_HOURS=2
   ```

### Step 5: Install Dependencies

1. **SSH into your server** (VPS) or use **Terminal** in hPanel
   ```bash
   cd public_html
   npm install --production
   ```

2. **Create required directories**
   ```bash
   mkdir -p tmp/uploads tmp/processed
   chmod 755 tmp
   chmod 755 tmp/uploads
   chmod 755 tmp/processed
   ```

### Step 6: Start the Application

1. **Restart Node.js app** in hPanel
2. **Check logs** for any errors
3. **Test your application** at your domain

### Step 7: Configure SSL

1. **Go to hPanel → SSL**
2. **Enable free SSL** (Let's Encrypt)
3. **Force HTTPS** redirect

### Step 8: Test Deployment

1. **Health check**
   ```bash
   curl https://pdfsimpler.com/api/health
   ```

2. **Test file upload**
   - Upload a test PDF
   - Verify processing works
   - Check download functionality

3. **Test authentication**
   - Register a new user
   - Login and verify JWT token
   - Check dashboard

## Troubleshooting

### Database Connection Issues

**Problem**: `ECONNREFUSED ::1:3306`

**Solution**: Use `localhost` instead of `127.0.0.1` in DB_HOST

**Problem**: `Access denied for user`

**Solution**: Verify database credentials and user permissions

### File Upload Issues

**Problem**: Files not uploading

**Solution**:
```bash
# Check directory permissions
ls -la tmp/
chmod 755 tmp/uploads tmp/processed
```

**Problem**: File size limit exceeded

**Solution**: Increase `UPLOAD_MAX_MB` in .env and check nginx/php limits

### Application Not Starting

**Problem**: Port already in use

**Solution**:
```bash
# Find process using port 3000
netstat -tulpn | grep :3000
# Kill the process
kill -9 <PID>
```

**Problem**: Module not found

**Solution**:
```bash
cd public_html
npm install --production
```

### Performance Issues

**Problem**: Slow processing

**Solution**:
- Increase server resources
- Implement caching
- Use CDN for static files
- Optimize database queries

## Security Hardening

### 1. Environment Variables
- Never commit `.env` file
- Use strong JWT secrets (64+ characters)
- Rotate secrets regularly

### 2. File Permissions
```bash
# Restrict file permissions
chmod 644 *.js *.json *.html *.css
chmod 600 .env
chmod 755 tmp/
```

### 3. Firewall Rules
```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 4. Rate Limiting
- Already implemented in application
- Consider nginx rate limiting for DDoS protection

### 5. SSL/TLS
- Force HTTPS redirect
- Use strong cipher suites
- Enable HSTS

## Monitoring

### Application Logs
```bash
# View Node.js logs
tail -f /var/log/nodejs/app.log

# View error logs
tail -f /var/log/nodejs/error.log
```

### Database Monitoring
```bash
# Check MySQL status
mysqladmin status

# Monitor connections
mysqladmin processlist
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## Backup Strategy

### Database Backups
```bash
# Automated daily backup
0 2 * * * mysqldump -u user -p'password' database > /backups/db_$(date +\%Y\%m\%d).sql

# Keep last 7 days
find /backups -name "db_*.sql" -mtime +7 -delete
```

### File Backups
```bash
# Backup important files
tar -czf /backups/files_$(date +\%Y\%m\%d).tar.gz public_html/
```

### Application Backups
```bash
# Full backup
tar -czf /backups/full_$(date +\%Y\%m\%d).tar.gz public_html/ database_backup.sql
```

## Scaling

### Vertical Scaling
- Increase CPU cores
- Add more RAM
- Use SSD storage

### Horizontal Scaling
- Load balancer setup
- Multiple application servers
- Shared database with read replicas

### CDN Integration
```javascript
// Serve static files via CDN
const CDN_URL = process.env.CDN_URL || '';
app.use('/static', express.static(path.join(__dirname, 'frontend'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));
```

## Performance Optimization

### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Optimize tables
OPTIMIZE TABLE users, tasks, tools;
```

### Caching Strategy
```javascript
// Implement Redis caching
const redis = require('redis');
const client = redis.createClient();

async function cacheTools() {
  const tools = await getToolsFromDB();
  await client.set('tools', JSON.stringify(tools), 'EX', 3600);
}
```

### Static File Optimization
```bash
# Minify CSS and JavaScript
npm run build

# Enable gzip compression
# Add to nginx config
gzip on;
gzip_types text/css application/javascript application/json;
```

## Maintenance

### Regular Tasks
- Weekly: Check logs and errors
- Monthly: Update dependencies
- Quarterly: Review and rotate secrets
- Annually: Security audit

### Dependency Updates
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Audit for vulnerabilities
npm audit fix
```

## Rollback Procedure

### If Deployment Fails
1. Restore from backup
2. Revert to previous commit
3. Check database integrity
4. Test thoroughly

### Emergency Rollback
```bash
# Stop application
pm2 stop pdf-simpler

# Restore files
tar -xzf /backups/full_YYYYMMDD.tar.gz

# Restore database
mysql -u user -p'password' database < database_backup.sql

# Restart application
pm2 start pdf-simpler
```

## Support

### Hostinger Resources
- Knowledge Base: https://support.hostinger.com
- Tutorials: https://www.hostinger.com/tutorials
- Community: https://community.hostinger.com

### Application Support
- GitHub Issues: https://github.com/waisays/pdf-simpler/issues
- Email: support@pdfsimpler.com

## Cost Optimization

### Free Tier
- 1GB RAM
- 1 CPU core
- 10GB storage
- Sufficient for small deployments

### Recommended for Production
- 2GB RAM
- 2 CPU cores
- 20GB SSD storage
- ~$5-10/month

### High Traffic
- 4GB+ RAM
- 4+ CPU cores
- 50GB+ SSD storage
- Load balancer
- ~$20-50/month

---

**Last Updated**: April 2026
**Version**: 1.0.0