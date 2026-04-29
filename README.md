# PDF Simpler

Your All-in-One PDF & File Toolkit - A Node.js/Express full-stack application providing 30+ PDF and file processing tools.

## Features

- **30+ PDF Tools**: Merge, split, compress, rotate, convert, and more
- **File Format Support**: PDF, Word, Excel, PowerPoint, Images, HTML, Text
- **User Authentication**: JWT-based auth with free and pro tiers
- **Rate Limiting**: 20 free tasks/day, unlimited for pro users
- **Modern UI**: Clean, responsive design with dark mode support
- **Secure Processing**: Files auto-deleted after 2 hours

## Tech Stack

- **Backend**: Node.js 20 + Express 4
- **Database**: MySQL (mysql2)
- **Auth**: JWT + bcrypt
- **PDF Processing**: pdf-lib
- **Image Processing**: sharp
- **File Upload**: multer
- **Frontend**: Vanilla HTML + CSS + JavaScript

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/waisays/pdf-simpler.git
   cd pdf-simpler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up MySQL database**
   ```bash
   mysql -u root -p < database_schema.sql
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Environment Variables

```env
PORT=3000
NODE_ENV=production

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=pdf_simpler

# JWT
JWT_SECRET=your_random_64_char_string
JWT_EXPIRES_IN=7d

# App
BASE_URL=http://localhost:3000
FREE_DAILY_LIMIT=20
UPLOAD_MAX_MB=100
TMP_CLEANUP_HOURS=2
```

## Available Tools

### Edit & Sign
- Merge PDF, Split PDF, Compress PDF, Rotate PDF
- Organize PDF, Extract Pages, Delete Pages, Crop PDF
- Password Protect, Unlock, Sign, Fill, Annotate
- Add/Remove Watermark, OCR, Image to Text

### Convert from PDF
- PDF to Word, JPG, PNG, Excel, PowerPoint
- PDF to HTML, Text

### Convert to PDF
- Word, Excel, PowerPoint to PDF
- JPG, PNG, Images to PDF
- HTML to PDF

### Image Tools
- Compress Images, Merge Images
- JPG to PNG, PNG to JPG

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tools
- `POST /api/tools/:slug` - Process file with tool
- `GET /api/tools/list` - Get available tools
- `GET /api/tools/download/:filename` - Download processed file

### User
- `GET /api/user/dashboard` - Get user dashboard
- `POST /api/user/upgrade` - Upgrade to Pro

## Project Structure

```
pdf-simpler/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── toolController.js     # Tool processing
│   └── userController.js     # User management
├── middleware/
│   ├── auth.js              # JWT middleware
│   └── upload.js            # File upload config
├── routes/
│   ├── auth.js              # Auth routes
│   ├── tools.js             # Tool routes
│   └── user.js              # User routes
├── services/
│   ├── pdfService.js        # PDF operations
│   ├── conversionService.js # File conversions
│   └── toolRegistry.js      # Tool definitions
├── frontend/
│   ├── index.html           # Home page
│   ├── tool.html            # Tool page
│   ├── login.html           # Login page
│   ├── register.html        # Register page
│   ├── dashboard.html       # User dashboard
│   ├── css/
│   │   └── main.css         # Main stylesheet
│   └── js/
│       ├── main.js          # Main functionality
│       ├── auth.js          # Auth logic
│       ├── upload.js        # File upload
│       └── dashboard.js     # Dashboard logic
├── tmp/
│   ├── uploads/             # Temporary uploads
│   └── processed/           # Processed files
├── utils/
│   └── fileCleanup.js       # File cleanup cron
├── server.js                # Express app
└── package.json
```

## Development

### Running in development mode
```bash
npm run dev
```

### Running tests
```bash
npm test
```

### Building for production
```bash
npm start
```

## Deployment

### Hostinger VPS Deployment

1. **Upload files** via File Manager or Git
2. **Set Node.js version** to 20 in hPanel
3. **Configure environment variables** in hPanel
4. **Run npm install** in terminal
5. **Start the application**

### Important Notes for Hostinger

- Use `localhost` instead of `127.0.0.1` for MySQL
- The application includes `family: 4` in MySQL config to force IPv4
- Ensure all environment variables are set in hPanel

## Security Features

- JWT authentication with secure token storage
- Password hashing with bcrypt
- File type validation
- Rate limiting for free users
- Automatic file cleanup
- CORS protection
- Helmet security headers

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

For support, email support@pdfsimpler.com or open an issue on GitHub.

## Roadmap

- [ ] Phase 2: Office file conversions (LibreOffice)
- [ ] Phase 2: Stripe payment integration
- [ ] Phase 3: OCR with tesseract.js
- [ ] Phase 3: AI PDF Summarizer
- [ ] Phase 4: Worker queue for heavy processing
- [ ] Phase 4: CDN integration
- [ ] Phase 4: Multi-language support

---

Built with ❤️ using Node.js, Express, and modern web technologies.