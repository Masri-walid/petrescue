const https = require('http');

const API_BASE = 'http://localhost:8080/api';

async function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testAuthFlow() {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Register a citizen
    console.log('1️⃣ Testing Citizen Registration...');
    const citizenData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe2@example.com',
        password: 'password123',
        phone: '555-1234',
        role: 'citizen'
    };

    try {
        const registerResponse = await makeRequest('POST', '/auth/register', citizenData);
        console.log(`   Status: ${registerResponse.status}`);
        if (registerResponse.status === 201 || registerResponse.status === 200) {
            console.log('   ✅ Citizen registration successful');
            console.log(`   Token: ${registerResponse.data.token ? 'Present' : 'Missing'}`);
        } else {
            console.log('   ❌ Citizen registration failed');
            console.log(`   Error: ${JSON.stringify(registerResponse.data)}`);
        }
    } catch (error) {
        console.log('   ❌ Citizen registration error:', error.message);
    }

    // Test 2: Register a veterinarian with location
    console.log('\n2️⃣ Testing Veterinarian Registration...');
    const vetData = {
        firstName: 'Dr. Jane',
        lastName: 'Smith',
        email: 'jane.smith@vetclinic.com',
        password: 'password123',
        phone: '555-5678',
        role: 'veterinarian',
        address: '123 Vet Street',
        city: 'Montreal',
        state: 'QC',
        zipCode: 'H1A 1A1'
    };

    try {
        const registerResponse = await makeRequest('POST', '/auth/register', vetData);
        console.log(`   Status: ${registerResponse.status}`);
        if (registerResponse.status === 201 || registerResponse.status === 200) {
            console.log('   ✅ Veterinarian registration successful');
            console.log(`   Token: ${registerResponse.data.token ? 'Present' : 'Missing'}`);
        } else {
            console.log('   ❌ Veterinarian registration failed');
            console.log(`   Error: ${JSON.stringify(registerResponse.data)}`);
        }
    } catch (error) {
        console.log('   ❌ Veterinarian registration error:', error.message);
    }

    // Test 3: Login without specifying user type
    console.log('\n3️⃣ Testing Login (without user type)...');
    const loginData = {
        email: 'john.doe2@example.com',
        password: 'password123'
    };

    try {
        const loginResponse = await makeRequest('POST', '/auth/login', loginData);
        console.log(`   Status: ${loginResponse.status}`);
        if (loginResponse.status === 200) {
            console.log('   ✅ Login successful');
            console.log(`   Token: ${loginResponse.data.token ? 'Present' : 'Missing'}`);
            console.log(`   User Type: ${loginResponse.data.user?.userType || 'Not specified'}`);
        } else {
            console.log('   ❌ Login failed');
            console.log(`   Error: ${JSON.stringify(loginResponse.data)}`);
        }
    } catch (error) {
        console.log('   ❌ Login error:', error.message);
    }

    console.log('\n🎉 Authentication flow test completed!');
}

testAuthFlow().catch(console.error);
