# PDF Simpler - Development Guide

## Local Development Setup

### Prerequisites
- Node.js 20+
- MySQL 8.0+
- npm or yarn

### Database Setup

1. **Create MySQL database**
   ```sql
   CREATE DATABASE pdf_simpler;
   ```

2. **Run the schema**
   ```bash
   mysql -u root -p pdf_simpler < database_schema.sql
   ```

3. **Update .env with your database credentials**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=pdf_simpler
   ```

### Running the Application

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Open http://localhost:3000
   - API health check: http://localhost:3000/api/health

## Testing API Endpoints

### Authentication
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get current user (requires token)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Tools
```bash
# Get available tools
curl -X GET http://localhost:3000/api/tools/list

# Process a file (example: compress PDF)
curl -X POST http://localhost:3000/api/tools/compress-pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf"

# Download processed file
curl -X GET http://localhost:3000/api/tools/download/filename.pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output downloaded.pdf
```

### User Dashboard
```bash
# Get dashboard data
curl -X GET http://localhost:3000/api/user/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## File Structure Details

### Backend Components

#### Config (`config/`)
- `db.js` - MySQL connection pool with error handling

#### Controllers (`controllers/`)
- `authController.js` - User registration, login, profile management
- `toolController.js` - Tool processing logic with rate limiting
- `userController.js` - Dashboard and user management

#### Middleware (`middleware/`)
- `auth.js` - JWT verification middleware
- `upload.js` - Multer file upload configuration

#### Routes (`routes/`)
- `auth.js` - Authentication endpoints
- `tools.js` - Tool processing and download endpoints
- `user.js` - User dashboard and upgrade endpoints

#### Services (`services/`)
- `pdfService.js` - PDF operations using pdf-lib
- `conversionService.js` - File format conversions
- `toolRegistry.js` - Tool definitions and metadata

#### Utils (`utils/`)
- `fileCleanup.js` - Scheduled file cleanup with node-cron

### Frontend Components

#### Pages (`frontend/`)
- `index.html` - Home page with tool grid
- `tool.html` - Generic tool page
- `login.html` - User login
- `register.html` - User registration
- `dashboard.html` - User dashboard

#### Styles (`frontend/css/`)
- `main.css` - Complete styling with dark mode support

#### JavaScript (`frontend/js/`)
- `main.js` - Core functionality and UI interactions
- `auth.js` - Authentication logic
- `upload.js` - File upload and processing
- `dashboard.js` - Dashboard functionality

## Development Workflow

### Adding New Tools

1. **Add tool to registry** (`services/toolRegistry.js`)
   ```javascript
   { slug: 'new-tool', name: 'New Tool', category: 'edit', npmPkg: 'pdf-lib' }
   ```

2. **Implement service logic** (`services/pdfService.js` or `conversionService.js`)
   ```javascript
   async function newTool(inputPath, options) {
     // Implementation
     return outputPath;
   }
   ```

3. **Add route handler** (`controllers/toolController.js`)
   ```javascript
   case 'new-tool':
     outputPath = await pdfService.newTool(inputPath, req.body.options);
     break;
   ```

4. **Add tool options UI** (`frontend/js/upload.js`)
   ```javascript
   case 'new-tool':
     optionsHTML = `<div class="form-group">...</div>`;
     break;
   ```

### Database Migrations

Create new migration files in the `migrations/` directory:

```sql
-- migrations/001_add_new_feature.sql
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Deployment

### Hostinger Deployment

1. **Upload files**
   - Use File Manager or Git
   - Upload all files except `node_modules/` and `.env`

2. **Configure environment**
   - Set Node.js version to 20 in hPanel
   - Add environment variables in hPanel

3. **Install dependencies**
   ```bash
   npm install --production
   ```

4. **Start application**
   - Set entry point to `server.js`
   - Restart Node.js app

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=u161272042_pdfsimpler
DB_PASS=your_secure_password
DB_NAME=u161272042_pdfsimpler
JWT_SECRET=your_64_char_random_secret
BASE_URL=https://pdfsimpler.com
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists
- Try `localhost` instead of `127.0.0.1`

**File Upload Not Working**
- Check `tmp/` directory permissions
- Verify file size limits
- Ensure multer is configured correctly

**JWT Token Issues**
- Clear browser localStorage
- Check `JWT_SECRET` matches between restarts
- Verify token expiration time

**Port Already in Use**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

## Performance Optimization

### Database
- Use connection pooling (already implemented)
- Add indexes to frequently queried columns
- Consider read replicas for scaling

### File Processing
- Implement worker queues for heavy operations
- Add caching for processed files
- Use CDN for static assets

### Frontend
- Minify CSS and JavaScript
- Implement lazy loading for images
- Add service worker for offline support

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated**
3. **Use strong JWT secrets**
4. **Implement rate limiting**
5. **Validate and sanitize all inputs**
6. **Never commit `.env` files**
7. **Use prepared statements for SQL**
8. **Implement CORS properly**

## Monitoring and Logging

### Adding Logging
```javascript
const logger = require('./utils/logger');

logger.info('User registered', { userId: user.id });
logger.error('Database error', { error: err.message });
```

### Health Checks
- `/api/health` - Basic health status
- Add database connection status
- Monitor disk space for temp files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details