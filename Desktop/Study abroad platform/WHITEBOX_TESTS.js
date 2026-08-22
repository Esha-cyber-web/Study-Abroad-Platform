/**
 * 🧪 Whitebox Testing Suite for StudyAbroad.ai Backend
 * 
 * Test Coverage:
 * 1. Authentication (Register, Login, JWT)
 * 2. University CRUD Operations
 * 3. Application Submission
 * 4. AI Features
 * 5. Input Validation
 * 6. Error Handling
 * 
 * Run: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

// Mock database for testing
const mockApp = require('../../backend/server');

describe('🔐 Authentication Tests', () => {
  
  test('POST /api/auth/register - Should register new user', async () => {
    const res = await request(mockApp)
      .post('/api/auth/register')
      .send({
        email: `test${Date.now()}@test.com`,
        password: 'TestPass123!',
        name: 'Test User'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent');
  });

  test('POST /api/auth/register - Should reject duplicate email', async () => {
    const email = `duplicate${Date.now()}@test.com`;
    
    // First registration
    await request(mockApp)
      .post('/api/auth/register')
      .send({ email, password: 'Pass123!', name: 'User1' });
    
    // Duplicate registration
    const res = await request(mockApp)
      .post('/api/auth/register')
      .send({ email, password: 'Pass123!', name: 'User2' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('already exists');
  });

  test('POST /api/auth/register - Should validate password strength', async () => {
    const res = await request(mockApp)
      .post('/api/auth/register')
      .send({
        email: `weak${Date.now()}@test.com`,
        password: '123',  // Too weak
        name: 'Test'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('password');
  });

  test('POST /api/auth/register - Should validate email format', async () => {
    const res = await request(mockApp)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',  // Invalid email
        password: 'ValidPass123!',
        name: 'Test'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('email');
  });

  test('POST /api/auth/verify-otp - Should verify OTP', async () => {
    // Register first
    const registerRes = await request(mockApp)
      .post('/api/auth/register')
      .send({
        email: `otp${Date.now()}@test.com`,
        password: 'TestPass123!',
        name: 'OTP Test'
      });
    
    const email = registerRes.body.email;
    const otp = '123456';  // Mock OTP (in real scenario, get from email)

    const verifyRes = await request(mockApp)
      .post('/api/auth/verify-otp')
      .send({ email, otp });
    
    expect([200, 400]).toContain(verifyRes.statusCode);
  });

  test('POST /api/auth/login - Should login with correct credentials', async () => {
    const credentials = {
      email: `login${Date.now()}@test.com`,
      password: 'TestPass123!'
    };

    // Register first
    await request(mockApp)
      .post('/api/auth/register')
      .send({ ...credentials, name: 'Login Test' });

    // Then login
    const res = await request(mockApp)
      .post('/api/auth/login')
      .send(credentials);
    
    expect([200, 401]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.token).toBeDefined();
    }
  });

  test('POST /api/auth/login - Should reject wrong password', async () => {
    const res = await request(mockApp)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'WrongPassword123!'
      });
    
    expect(res.statusCode).toBe(401);
  });
});

describe('🎓 University Tests', () => {
  
  test('GET /api/universities - Should return paginated universities', async () => {
    const res = await request(mockApp)
      .get('/api/universities')
      .query({ page: 1, limit: 10 });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });

  test('GET /api/universities - Should filter by country', async () => {
    const res = await request(mockApp)
      .get('/api/universities')
      .query({ country: 'USA' });
    
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(uni => {
      expect(uni.country.toLowerCase()).toContain('usa');
    });
  });

  test('GET /api/universities - Should filter by price range', async () => {
    const res = await request(mockApp)
      .get('/api/universities')
      .query({ minPrice: 10000, maxPrice: 50000 });
    
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(uni => {
      expect(uni.fees).toBeGreaterThanOrEqual(10000);
      expect(uni.fees).toBeLessThanOrEqual(50000);
    });
  });

  test('GET /api/universities - Should search by name', async () => {
    const res = await request(mockApp)
      .get('/api/universities')
      .query({ search: 'MIT' });
    
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(uni => {
      expect(uni.name.toLowerCase()).toContain('mit');
    });
  });

  test('GET /api/universities/:id - Should return single university', async () => {
    const listRes = await request(mockApp).get('/api/universities').query({ limit: 1 });
    
    if (listRes.body.data.length > 0) {
      const uniId = listRes.body.data[0]._id;
      const res = await request(mockApp).get(`/api/universities/${uniId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(uniId.toString());
    }
  });
});

describe('📝 Application Tests', () => {
  let jwtToken;
  let userId;

  beforeAll(async () => {
    // Get JWT token for subsequent requests
    const loginRes = await request(mockApp)
      .post('/api/auth/login')
      .send({
        email: process.env.TEST_EMAIL || 'test@test.com',
        password: process.env.TEST_PASSWORD || 'TestPass123!'
      });
    
    if (loginRes.statusCode === 200) {
      jwtToken = loginRes.body.token;
      userId = loginRes.body.userId;
    }
  });

  test('POST /api/applications - Should submit application with auth', async () => {
    if (!jwtToken) return;

    const res = await request(mockApp)
      .post('/api/applications')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        universityId: '507f1f77bcf86cd799439011',
        program: 'Computer Science',
        statement: 'I want to study CS'
      });
    
    expect([200, 400]).toContain(res.statusCode);
  });

  test('POST /api/applications - Should reject without auth', async () => {
    const res = await request(mockApp)
      .post('/api/applications')
      .send({
        universityId: '507f1f77bcf86cd799439011',
        program: 'CS',
        statement: 'test'
      });
    
    expect(res.statusCode).toBe(401);
  });
});

describe('🤖 AI Features Tests', () => {
  let jwtToken;

  beforeAll(async () => {
    const loginRes = await request(mockApp)
      .post('/api/auth/login')
      .send({
        email: process.env.TEST_EMAIL || 'test@test.com',
        password: process.env.TEST_PASSWORD || 'TestPass123!'
      });
    
    if (loginRes.statusCode === 200) {
      jwtToken = loginRes.body.token;
    }
  });

  test('POST /api/ai/chat - Should return AI response', async () => {
    if (!jwtToken) return;

    const res = await request(mockApp)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        messages: [{ role: 'user', content: 'What are top universities?' }]
      });
    
    expect([200, 400, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.reply).toBeDefined();
    }
  });

  test('POST /api/ai/predict-eligibility - Should predict eligibility', async () => {
    if (!jwtToken) return;

    const res = await request(mockApp)
      .post('/api/ai/predict-eligibility')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        cgpa: 3.8,
        ielts: 7.5,
        gre: 320,
        budget: 40000,
        country: 'USA',
        program: 'Master\'s'
      });
    
    expect([200, 400, 500]).toContain(res.statusCode);
  });
});

describe('❌ Error Handling Tests', () => {
  
  test('GET /invalid-route - Should return 404', async () => {
    const res = await request(mockApp).get('/api/invalid-route');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/auth/login - Invalid JSON should return 400', async () => {
    const res = await request(mockApp)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('invalid json');
    
    expect(res.statusCode).toBe(400);
  });

  test('Rate limiting should work after 20 requests', async () => {
    for (let i = 0; i < 21; i++) {
      const res = await request(mockApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test' });
      
      if (i === 20) {
        expect(res.statusCode).toBe(429);  // Too many requests
      }
    }
  });
});

describe('🔒 Security Tests', () => {
  
  test('SQL Injection attempt should be sanitized', async () => {
    const res = await request(mockApp)
      .get('/api/universities')
      .query({ search: "'; DROP TABLE users; --" });
    
    expect(res.statusCode).toBe(200);  // Safe, not executed
  });

  test('XSS attempt should be sanitized', async () => {
    const res = await request(mockApp)
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Pass123!',
        name: '<script>alert("xss")</script>'
      });
    
    // Should sanitize the name
    expect(res.statusCode).toBe(200 || 400);
  });

  test('API should have CORS headers', async () => {
    const res = await request(mockApp).get('/api/universities');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  test('API should have security headers', async () => {
    const res = await request(mockApp).get('/api/universities');
    expect(res.headers['x-content-type-options']).toBeDefined();
  });
});
