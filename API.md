# PDF Simpler - API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Health Check

#### GET /api/health
Check server status and uptime.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-29T15:56:26.869Z",
  "uptime": 728.0198763
}
```

---

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "tasks_today": 0,
    "last_reset": "2026-04-29",
    "created_at": "2026-04-29T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already registered

---

#### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "tasks_today": 0,
    "last_reset": "2026-04-29",
    "created_at": "2026-04-29T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials

---

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "tasks_today": 5,
    "last_reset": "2026-04-29",
    "created_at": "2026-04-29T15:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### Tools

#### GET /api/tools/list
Get list of all available tools.

**Query Parameters:**
- `category` (optional) - Filter by category (`edit`, `convert_from`, `convert_to`, `image`, `ai`)

**Response (200 OK):**
```json
{
  "tools": [
    {
      "slug": "merge-pdf",
      "name": "Merge PDF",
      "category": "edit"
    },
    {
      "slug": "compress-pdf",
      "name": "Compress PDF",
      "category": "edit"
    }
  ]
}
```

---

#### POST /api/tools/:slug
Process a file with a specific tool.

**Parameters:**
- `slug` - Tool identifier (e.g., `merge-pdf`, `compress-pdf`)

**Headers:**
```
Authorization: Bearer <your_jwt_token> (optional)
```

**Request Body:**
- `file` - Single file (for most tools)
- `files` - Multiple files (for merge operations)
- Additional tool-specific parameters in form data

**Tool-Specific Parameters:**

**rotate-pdf:**
- `degrees` - Rotation angle (90, 180, 270)

**split-pdf, extract-pdf-pages, delete-pdf-pages:**
- `pages` - Page numbers (e.g., "1,3,5-7")

**password-protect-pdf, unlock-pdf:**
- `password` - PDF password

**compress-images:**
- `quality` - Image quality (1-100, default: 80)

**Response (200 OK):**
```json
{
  "success": true,
  "downloadUrl": "/api/tools/download/processed-file.pdf",
  "filename": "processed-file.pdf",
  "tool": "Compress PDF"
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded or invalid parameters
- `404 Not Found` - Tool not found
- `429 Too Many Requests` - Daily limit exceeded (free users)
- `501 Not Implemented` - Tool not yet implemented

---

#### GET /api/tools/download/:filename
Download a processed file.

**Parameters:**
- `filename` - Name of the file to download

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
- `200 OK` - File download stream
- `401 Unauthorized` - Authentication required
- `404 Not Found` - File not found or expired

---

### User

#### GET /api/user/dashboard
Get user dashboard data including task history.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free",
    "tasks_today": 5,
    "last_reset": "2026-04-29",
    "created_at": "2026-04-29T15:00:00.000Z",
    "remainingTasks": 15,
    "isToday": true
  },
  "tasks": [
    {
      "id": 1,
      "tool_slug": "compress-pdf",
      "input_file": "original.pdf",
      "output_file": "original-compressed.pdf",
      "status": "done",
      "created_at": "2026-04-29T15:30:00.000Z"
    }
  ],
  "stats": {
    "totalTasks": 5,
    "plan": "free",
    "dailyLimit": 20
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Authentication required

---

#### POST /api/user/upgrade
Initiate upgrade to Pro plan.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (501 Not Implemented):**
```json
{
  "error": "Payment integration not yet implemented",
  "message": "Pro plan upgrade will be available in Phase 2"
}
```

---

## Tool Categories

### Edit & Sign
- `merge-pdf` - Combine multiple PDFs
- `split-pdf` - Split PDF into pages
- `compress-pdf` - Reduce file size
- `rotate-pdf` - Rotate pages
- `organize-pdf` - Reorder pages
- `extract-pdf-pages` - Extract specific pages
- `delete-pdf-pages` - Remove pages
- `crop-pdf` - Crop pages
- `password-protect-pdf` - Add password
- `unlock-pdf` - Remove password
- `sign-pdf` - Add signature
- `fill-pdf` - Fill forms
- `annotate-pdf` - Add annotations
- `watermark-pdf` - Add watermark
- `remove-watermark` - Remove watermark
- `ocr-pdf` - OCR processing
- `image-to-text` - Extract text from images

### Convert from PDF
- `pdf-to-word` - PDF to Word
- `pdf-to-jpg` - PDF to JPG images
- `pdf-to-png` - PDF to PNG images
- `pdf-to-excel` - PDF to Excel
- `pdf-to-pptx` - PDF to PowerPoint
- `pdf-to-html` - PDF to HTML
- `pdf-to-text` - Extract text

### Convert to PDF
- `word-to-pdf` - Word to PDF
- `jpg-to-pdf` - JPG to PDF
- `png-to-pdf` - PNG to PDF
- `excel-to-pdf` - Excel to PDF
- `pptx-to-pdf` - PowerPoint to PDF
- `html-to-pdf` - HTML to PDF
- `image-to-pdf` - Image to PDF

### Images
- `compress-images` - Compress image files
- `merge-images` - Combine multiple images
- `jpg-to-png` - JPG to PNG
- `png-to-jpg` - PNG to JPG

### AI
- `pdf-summarizer` - AI-powered PDF summarization

---

## Rate Limiting

### Free Users
- 20 tasks per day
- Resets at midnight UTC

### Pro Users
- Unlimited tasks
- Priority processing

---

## File Limits

- Maximum file size: 100MB
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, WebP, HTML, TXT
- Temporary files are deleted after 2 hours

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 501 | Not Implemented |

---

## Example Usage

### Complete Workflow

1. **Register user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secure123"}'
```

2. **Login and get token:**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123"}' \
  | jq -r '.token')
```

3. **Compress a PDF:**
```bash
curl -X POST http://localhost:3000/api/tools/compress-pdf \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"
```

4. **Download processed file:**
```bash
curl -X GET http://localhost:3000/api/tools/download/document-compressed.pdf \
  -H "Authorization: Bearer $TOKEN" \
  --output compressed.pdf
```

5. **Check dashboard:**
```bash
curl -X GET http://localhost:3000/api/user/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## WebSocket Support (Future)

Planned for real-time processing updates:
- Endpoint: `/ws`
- Events: `processing`, `completed`, `error`

---

## Webhooks (Future)

Planned for automation:
- Endpoint: `/api/webhooks`
- Events: `task.completed`, `user.upgraded`