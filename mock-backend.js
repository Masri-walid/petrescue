const http = require('http');
const url = require('url');

const PORT = 8080;

// Mock user data
const mockUser = {
  id: "7a2025af-d204-4f17-8e7c-3f027b6d8594",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe2@example.com",
  phone: "555-1234",
  role: "citizen",
  address: "123 Test St",
  city: "Montreal",
  state: "QC",
  zipCode: "H1A 1A1",
  latitude: 45.5017,
  longitude: -73.5673,
  profileImageUrl: null,
  isActive: true,
  isVerified: false
};

const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function handleCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, statusCode, data) {
  handleCORS(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    handleCORS(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (path === '/api/health' && method === 'GET') {
    sendJSON(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    return;
  }

  // Login endpoint
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        console.log('Login request:', loginData);
        
        // Simple validation
        if (loginData.email === 'john.doe2@example.com' && loginData.password === 'password123') {
          sendJSON(res, 200, {
            success: true,
            message: 'Login successful',
            token: mockToken,
            user: mockUser
          });
        } else {
          sendJSON(res, 401, {
            success: false,
            message: 'Invalid email or password',
            token: null,
            user: null
          });
        }
      } catch (error) {
        sendJSON(res, 400, {
          success: false,
          message: 'Invalid JSON',
          token: null,
          user: null
        });
      }
    });
    return;
  }

  // Profile endpoint
  if (path === '/api/auth/profile' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sendJSON(res, 200, mockUser);
    } else {
      sendJSON(res, 401, {
        message: 'Unauthorized'
      });
    }
    return;
  }

  // Register endpoint
  if (path === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const registerData = JSON.parse(body);
        console.log('Register request:', registerData);
        
        // Create new user based on registration data
        const newUser = {
          ...mockUser,
          id: `new-${Date.now()}`,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          role: registerData.role || 'citizen',
          address: registerData.address || null,
          city: registerData.city || null,
          state: registerData.state || null,
          zipCode: registerData.zipCode || null,
          latitude: registerData.latitude || null,
          longitude: registerData.longitude || null
        };
        
        sendJSON(res, 200, {
          success: true,
          message: 'Registration successful',
          token: mockToken,
          user: newUser
        });
      } catch (error) {
        sendJSON(res, 400, {
          success: false,
          message: 'Invalid JSON',
          token: null,
          user: null
        });
      }
    });
    return;
  }

  // Rescue reports endpoint
  if (path === '/api/RescueReports' && method === 'POST') {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data properly
      console.log('📸 Rescue report with photos received (multipart)');
      console.log('Content-Type:', contentType);

      // For mock purposes, we'll just consume the data and respond
      let totalSize = 0;
      req.on('data', chunk => {
        totalSize += chunk.length;
      });

      req.on('end', () => {
        console.log(`📊 Received ${totalSize} bytes of multipart data`);
        const reportId = `report-${Date.now()}`;
        sendJSON(res, 201, reportId);
      });

      req.on('error', (error) => {
        console.error('❌ Error processing multipart data:', error);
        sendJSON(res, 400, { message: 'Error processing multipart data' });
      });

      return;
    }

    // Handle JSON requests (fallback)
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const reportData = JSON.parse(body);
        console.log('📝 Rescue report request (JSON):', reportData);

        const reportId = `report-${Date.now()}`;
        sendJSON(res, 201, reportId);
      } catch (error) {
        console.error('❌ JSON parsing error:', error);
        sendJSON(res, 400, {
          message: 'Invalid JSON'
        });
      }
    });
    return;
  }

  // Unhandled reports count endpoint
  if (path === '/api/RescueReports/unhandled/count' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendJSON(res, 401, {
        message: 'Authorization header required'
      });
      return;
    }

    // Mock response with random count for testing
    const count = Math.floor(Math.random() * 8) + 1; // 1-8 unhandled reports
    sendJSON(res, 200, { count });
    return;
  }

  // Rescue reports list endpoint
  if (path === '/api/rescuereports' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendJSON(res, 401, {
        message: 'Authorization header required'
      });
      return;
    }

    // Mock response with sample reports
    const mockReports = [
      {
        id: 'report-1',
        animalType: 'dog',
        breed: 'Golden Retriever',
        location: 'Downtown Montreal',
        urgencyLevel: 'urgent',
        animalCondition: 'injured',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'reported'
      },
      {
        id: 'report-2',
        animalType: 'cat',
        breed: 'Tabby',
        location: 'Old Port',
        urgencyLevel: 'moderate',
        animalCondition: 'good',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        status: 'reported'
      },
      {
        id: 'report-3',
        animalType: 'dog',
        breed: 'Mixed',
        location: 'Plateau',
        urgencyLevel: 'critical',
        animalCondition: 'sick',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: 'reported'
      }
    ];

    sendJSON(res, 200, { data: mockReports });
    return;
  }

  // Rescue report assignment endpoint
  if (path.match(/^\/api\/RescueReports\/[^\/]+\/assign$/) && method === 'PUT') {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendJSON(res, 401, {
        message: 'Authorization header required'
      });
      return;
    }

    console.log('Rescue report assignment request received');
    sendJSON(res, 204, null); // No content response for successful assignment
    return;
  }

  // Animals endpoint
  if (path === '/api/animals' && method === 'POST') {
    // Simple auth check - just require any Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendJSON(res, 401, {
        message: 'Authorization header required'
      });
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const animalData = JSON.parse(body);
        console.log('Animal creation request:', animalData);

        const animalId = `animal-${Date.now()}`;
        sendJSON(res, 201, animalId);
      } catch (error) {
        sendJSON(res, 400, {
          message: 'Invalid JSON'
        });
      }
    });
    return;
  }

  // 404 for all other routes
  sendJSON(res, 404, {
    message: 'Not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/profile');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/RescueReports');
  console.log('  GET  /api/RescueReports/unhandled/count');
  console.log('  GET  /api/rescuereports?status=reported');
  console.log('  PUT  /api/RescueReports/:id/assign');
  console.log('  POST /api/animals');
});
