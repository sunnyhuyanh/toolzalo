#!/usr/bin/env node

/**
 * Local test script to verify all endpoints
 * Run: node test-local.js
 */

const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Start the server
function startServer() {
  return new Promise((resolve, reject) => {
    log('🚀 Starting local server...', 'blue');
    
    const server = spawn('node', ['index.js'], {
      env: { ...process.env, PORT: PORT, NODE_ENV: 'development' },
      cwd: path.dirname(__filename)
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Server is running')) {
        setTimeout(() => resolve(server), 1000); // Wait 1 second for server to fully start
      }
    });

    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    server.on('error', (err) => {
      reject(err);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      reject(new Error('Server failed to start within 10 seconds'));
    }, 10000);
  });
}

// Test endpoints
async function testEndpoints(server) {
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${BASE_URL}/health`,
      expectedStatus: 200,
      checkResponse: (data) => data.status === 'healthy'
    },
    {
      name: 'Test API',
      method: 'GET',
      url: `${BASE_URL}/api/test`,
      expectedStatus: 200,
      checkResponse: (data) => data.message === 'Server is working!'
    },
    {
      name: 'Static File (index.html)',
      method: 'GET',
      url: `${BASE_URL}/`,
      expectedStatus: 200,
      checkResponse: () => true
    },
    {
      name: 'Webhook Proxy (GET)',
      method: 'GET',
      url: `${BASE_URL}/webhook/test`,
      expectedStatus: [200, 404, 502], // Could be any depending on n8n
      checkResponse: () => true
    },
    {
      name: 'Webhook Proxy (POST)',
      method: 'POST',
      url: `${BASE_URL}/webhook/test`,
      data: { test: 'data' },
      expectedStatus: [200, 404, 502], // Could be any depending on n8n
      checkResponse: () => true
    },
    {
      name: 'Non-existent API Route',
      method: 'GET',
      url: `${BASE_URL}/api/nonexistent`,
      expectedStatus: 404,
      checkResponse: (data) => data.error === 'Not found'
    }
  ];

  log('\n📋 Running endpoint tests...', 'blue');
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const config = {
        method: test.method,
        url: test.url,
        validateStatus: () => true // Don't throw on any status
      };

      if (test.data) {
        config.data = test.data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);
      
      const expectedStatuses = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];
      
      const statusOk = expectedStatuses.includes(response.status);
      const responseOk = test.checkResponse(response.data);

      if (statusOk && responseOk) {
        log(`✅ ${test.name}: PASSED (Status: ${response.status})`, 'green');
        passed++;
      } else {
        log(`❌ ${test.name}: FAILED`, 'red');
        log(`   Expected status: ${test.expectedStatus}, Got: ${response.status}`, 'red');
        if (!responseOk) {
          log(`   Response check failed`, 'red');
        }
        failed++;
      }
    } catch (error) {
      log(`❌ ${test.name}: ERROR - ${error.message}`, 'red');
      failed++;
    }
  }

  log(`\n📊 Test Results: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
  
  return failed === 0;
}

// Main test runner
async function runTests() {
  let server = null;
  
  try {
    // Check if axios is installed
    try {
      require.resolve('axios');
    } catch (e) {
      log('Installing axios for testing...', 'yellow');
      require('child_process').execSync('npm install axios', { stdio: 'inherit' });
    }

    server = await startServer();
    const success = await testEndpoints(server);
    
    if (success) {
      log('\n✅ All tests passed! Server is ready for deployment.', 'green');
    } else {
      log('\n⚠️ Some tests failed. Please review and fix before deploying.', 'yellow');
    }
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    if (server) {
      log('\n🛑 Stopping server...', 'blue');
      server.kill();
    }
  }
}

// Run tests
runTests();