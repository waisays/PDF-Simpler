// Simple test examples for PDF Simpler
// Run with: npm test

const request = require('supertest');
const app = require('../server');

describe('PDF Simpler API Tests', () => {

  // Health Check Tests
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // Tools List Tests
  describe('GET /api/tools/list', () => {
    it('should return list of tools', async () => {
      const response = await request(app)
        .get('/api/tools/list')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('tools');
      expect(Array.isArray(response.body.tools)).toBe(true);
      expect(response.body.tools.length).toBeGreaterThan(0);
    });

    it('should filter tools by category', async () => {
      const response = await request(app)
        .get('/api/tools/list?category=edit')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('tools');
      response.body.tools.forEach(tool => {
        expect(tool.category).toBe('edit');
      });
    });
  });

  // Authentication Tests
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'test123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
    });

    it('should reject invalid email', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'test123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject short password', async () => {
      const invalidUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Tool Processing Tests
  describe('POST /api/tools/:slug', () => {
    it('should return 404 for non-existent tool', async () => {
      const response = await request(app)
        .post('/api/tools/non-existent-tool')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing file', async () => {
      const response = await request(app)
        .post('/api/tools/compress-pdf')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Protected Routes Tests
  describe('Protected Routes', () => {
    let authToken;

    beforeAll(async () => {
      // Register and login to get token
      const newUser = {
        name: 'Auth Test User',
        email: `authtest${Date.now()}@example.com`,
        password: 'test123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      authToken = registerResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
    });

    it('should reject protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  // User Dashboard Tests
  describe('GET /api/user/dashboard', () => {
    let authToken;

    beforeAll(async () => {
      // Register and login to get token
      const newUser = {
        name: 'Dashboard Test User',
        email: `dashboard${Date.now()}@example.com`,
        password: 'test123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      authToken = registerResponse.body.token;
    });

    it('should return dashboard data', async () => {
      const response = await request(app)
        .get('/api/user/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('stats');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });
  });
});

// PDF Service Tests
describe('PDF Service Tests', () => {
  const pdfService = require('../services/pdfService');
  const fs = require('fs');
  const path = require('path');

  // These tests require actual PDF files and are integration tests
  // They should be run separately with proper test data

  describe('PDF Operations', () => {
    it('should have merge function', () => {
      expect(typeof pdfService.merge).toBe('function');
    });

    it('should have split function', () => {
      expect(typeof pdfService.split).toBe('function');
    });

    it('should have compress function', () => {
      expect(typeof pdfService.compress).toBe('function');
    });

    it('should have rotate function', () => {
      expect(typeof pdfService.rotate).toBe('function');
    });

    it('should have imageToPdf function', () => {
      expect(typeof pdfService.imageToPdf).toBe('function');
    });
  });
});

// Conversion Service Tests
describe('Conversion Service Tests', () => {
  const conversionService = require('../services/conversionService');

  describe('Conversion Functions', () => {
    it('should have compressImage function', () => {
      expect(typeof conversionService.compressImage).toBe('function');
    });

    it('should have jpgToPng function', () => {
      expect(typeof conversionService.jpgToPng).toBe('function');
    });

    it('should have pngToJpg function', () => {
      expect(typeof conversionService.pngToJpg).toBe('function');
    });

    it('should have pdfToText function', () => {
      expect(typeof conversionService.pdfToText).toBe('function');
    });
  });
});

// Tool Registry Tests
describe('Tool Registry Tests', () => {
  const TOOLS = require('../services/toolRegistry');

  it('should export tools array', () => {
    expect(Array.isArray(TOOLS)).toBe(true);
  });

  it('should have required tool properties', () => {
    TOOLS.forEach(tool => {
      expect(tool).toHaveProperty('slug');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('category');
      expect(tool).toHaveProperty('npmPkg');
    });
  });

  it('should have unique slugs', () => {
    const slugs = TOOLS.map(tool => tool.slug);
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  it('should have valid categories', () => {
    const validCategories = ['edit', 'convert_from', 'convert_to', 'image', 'audio', 'video', 'ai'];
    TOOLS.forEach(tool => {
      expect(validCategories).toContain(tool.category);
    });
  });
});

// Middleware Tests
describe('Middleware Tests', () => {
  const authMiddleware = require('../middleware/auth');

  it('should export auth middleware function', () => {
    expect(typeof authMiddleware).toBe('function');
  });

  it('should accept required parameter', () => {
    const middleware = authMiddleware(true);
    expect(typeof middleware).toBe('function');
  });

  it('should accept optional parameter', () => {
    const middleware = authMiddleware(false);
    expect(typeof middleware).toBe('function');
  });
});

// Database Tests
describe('Database Tests', () => {
  const db = require('../config/db');

  it('should export database pool', () => {
    expect(db).toBeDefined();
    expect(typeof db.query).toBe('function');
  });

  it('should have connection methods', () => {
    expect(typeof db.getConnection).toBe('function');
    expect(typeof db.execute).toBe('function');
  });
});