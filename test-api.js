// Simple Node.js test for the rescue report API
const https = require('http');

const data = JSON.stringify({
    animalType: "Dog",
    urgencyLevel: "urgent",
    animalCondition: "Injured",
    location: "Test Location",
    reporterName: "Test Reporter",
    reporterPhone: "555-1234",
    reporterEmail: "test@example.com",
    latitude: 45.5017,
    longitude: -73.5673
});

const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/RescueReports',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧪 Testing Rescue Report API...');
console.log('Request data:', data);

const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('📤 Response:', responseData);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('🎉 SUCCESS!');
        } else {
            console.log('❌ ERROR!');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.write(data);
req.end();
