const express = require('express');
const cors = require('cors');
const app = express();
const port = 5148;

// Enable CORS for all origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));

// Parse JSON bodies
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test Node.js API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test registration endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  
  const { firstName, lastName, email, password, userType } = req.body;
  
  // Create test user
  const testUser = {
    id: 1,
    firstName,
    lastName,
    email,
    userType: userType || 'citizen'
  };
  
  res.json({
    success: true,
    message: 'Registration successful',
    token: 'test-jwt-token-12345',
    user: testUser
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;
  
  // Check for test user
  if (email === 'user@example.com' && password === 'string') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'test-jwt-token-12345',
      user: {
        id: 1,
        firstName: 'Test',
        lastName: 'User',
        email: 'user@example.com',
        userType: 'citizen'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Test rescue report endpoint
app.post('/api/RescueReports', (req, res) => {
  console.log('Rescue report request received:', req.body);
  
  res.json({
    success: true,
    message: 'Rescue report created successfully',
    data: {
      id: 1,
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Test API server running at http://localhost:${port}`);
  console.log(`Test endpoints:`);
  console.log(`  GET  http://localhost:${port}/api/test`);
  console.log(`  POST http://localhost:${port}/api/auth/register`);
  console.log(`  POST http://localhost:${port}/api/auth/login`);
  console.log(`  POST http://localhost:${port}/api/RescueReports`);
});
