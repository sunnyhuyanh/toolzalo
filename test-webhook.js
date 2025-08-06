/**
 * Test script for webhook functionality
 * Run: node test-webhook.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const WEBHOOK_PATH = '/webhook/your-webhook-id'; // Replace with your actual webhook ID

// Test data
const testData = {
  event: 'test',
  timestamp: new Date().toISOString(),
  data: {
    message: 'Test webhook from Railway deployment',
    user: 'test-user',
    action: 'test-action'
  }
};

// Function to test webhook
async function testWebhook() {
  console.log('🧪 Starting webhook test...');
  console.log(`📍 Target URL: ${BASE_URL}${WEBHOOK_PATH}`);
  console.log('📦 Test Data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(`${BASE_URL}${WEBHOOK_PATH}`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Test-Script'
      }
    });
    
    console.log('✅ Webhook test successful!');
    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Response:', response.data);
  } catch (error) {
    console.error('❌ Webhook test failed!');
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error('📥 Error Response:', error.response.data);
    } else if (error.request) {
      console.error('🚫 No response received from server');
      console.error('Request details:', error.request._header);
    } else {
      console.error('🔥 Error:', error.message);
    }
  }
}

// Run test
testWebhook();