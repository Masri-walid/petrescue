const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${req.method} ${path}`);
  
  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  if (path === '/api/test' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Simple test API is running!',
      timestamp: new Date().toISOString()
    }));
  } else if (path === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Registration request:', data);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Registration successful',
          token: 'test-jwt-token-12345',
          user: {
            id: 1,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            userType: data.userType || 'citizen'
          }
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
  } else if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login request:', data);
        
        if (data.email === 'user@example.com' && data.password === 'string') {
          res.writeHead(200);
          res.end(JSON.stringify({
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
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid JSON'
        }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      message: 'Not found'
    }));
  }
});

const port = 5148;
server.listen(port, () => {
  console.log(`Simple API server running at http://localhost:${port}`);
  console.log(`Test endpoints:`);
  console.log(`  GET  http://localhost:${port}/api/test`);
  console.log(`  POST http://localhost:${port}/api/auth/register`);
  console.log(`  POST http://localhost:${port}/api/auth/login`);
});
