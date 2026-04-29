# Changelog

All notable changes to PDF Simpler will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of PDF Simpler
- 30+ PDF and file processing tools
- User authentication with JWT
- Free and Pro tier system
- Rate limiting (20 tasks/day for free users)
- Modern responsive UI with dark mode
- File upload with drag-and-drop support
- Automatic file cleanup (2 hours)
- MySQL database integration
- RESTful API endpoints

### Tools Implemented
- **Edit & Sign**: Merge, Split, Compress, Rotate, Organize, Extract Pages, Delete Pages, Crop, Password Protect, Unlock
- **Convert from PDF**: PDF to Word, JPG, PNG, Excel, PPTX, HTML, Text
- **Convert to PDF**: Word, Excel, PPTX, JPG, PNG, HTML, Images to PDF
- **Image Tools**: Compress Images, Merge Images, JPG to PNG, PNG to JPG

### Security Features
- JWT authentication with bcrypt password hashing
- File type validation
- Rate limiting
- CORS protection
- Helmet security headers
- Automatic file cleanup

### Documentation
- Comprehensive README.md
- API documentation (API.md)
- Development guide (DEVELOPMENT.md)
- Deployment guide (DEPLOYMENT.md)
- Database schema (database_schema.sql)

## [1.0.0] - 2026-04-29

### Added
- Initial project setup
- Express server configuration
- MySQL database connection
- Authentication system
- File upload handling
- PDF processing services
- Conversion services
- Frontend UI components
- Tool registry system
- User dashboard
- Rate limiting implementation
- File cleanup cron job

### Features
- User registration and login
- JWT token management
- File upload with 100MB limit
- PDF merge, split, compress, rotate
- Image to PDF conversion
- Image compression and format conversion
- Task history tracking
- Daily task limits
- Dark mode support
- Responsive design
- Mobile-friendly interface

### API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/tools/list
- POST /api/tools/:slug
- GET /api/tools/download/:filename
- GET /api/user/dashboard
- POST /api/user/upgrade
- GET /api/health

### Database Schema
- users table
- tasks table
- tools table

### Frontend Pages
- Home page with tool grid
- Tool pages for each tool
- Login page
- Register page
- User dashboard

### Security
- Password hashing with bcrypt
- JWT token authentication
- File type validation
- Rate limiting
- Input sanitization
- SQL injection prevention

## [Future Releases]

### [2.0.0] - Phase 2
- Office file conversions (LibreOffice)
- Stripe payment integration
- Enhanced dashboard
- Download history
- Email notifications
- Password reset functionality

### [3.0.0] - Phase 3
- OCR with tesseract.js
- AI PDF Summarizer
- Advanced PDF editing
- Form filling
- Digital signatures
- Batch processing

### [4.0.0] - Phase 4
- Worker queue for heavy processing
- CDN integration
- Multi-language support
- API rate limiting per user
- Webhook support
- Real-time processing updates
- Mobile apps (iOS/Android)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-04-29 | Initial release with core features |
| 2.0.0 | TBD | Phase 2 features |
| 3.0.0 | TBD | Phase 3 features |
| 4.0.0 | TBD | Phase 4 features |

---

## Breaking Changes

### Version 2.0.0 (Planned)
- Changes to authentication flow
- Updated API response formats
- Database schema modifications

### Version 3.0.0 (Planned)
- New tool categories
- Updated file processing pipeline
- Changes to rate limiting logic

---

## Deprecations

### Version 1.0.0
- None currently deprecated

### Version 2.0.0 (Planned)
- Old authentication endpoints will be deprecated
- Legacy tool endpoints will be removed

---

## Security Updates

### Version 1.0.0
- Initial security implementation
- JWT authentication
- File validation
- Rate limiting

### Future Security Updates
- Regular dependency updates
- Security patches
- Vulnerability fixes

---

## Performance Improvements

### Version 1.0.0
- Optimized database queries
- Efficient file processing
- Responsive UI

### Future Performance Updates
- Caching implementation
- Database optimization
- CDN integration
- Load balancing

---

## Bug Fixes

### Version 1.0.0
- Fixed file upload issues
- Resolved authentication problems
- Corrected database connection issues
- Fixed UI rendering bugs

### Future Bug Fixes
- Ongoing bug fixes and improvements
- User-reported issues
- Performance optimizations

---

## Contributors

- PDF Simpler Development Team

---

## License

MIT License - See LICENSE file for details