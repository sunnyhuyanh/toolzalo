const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// The target URL for your n8n webhooks
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Proxy middleware for webhooks
app.use('/webhook', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/webhook': '/webhook'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Forwarding request to: ${API_TARGET}${req.originalUrl}`);
    console.log(`[PROXY] Method: ${req.method}`);
    console.log(`[PROXY] Headers:`, req.headers);
    
    // If request has body, log it
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[PROXY] Body:`, JSON.stringify(req.body, null, 2));
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response from ${API_TARGET}: ${proxyRes.statusCode}`);
    
    // Set CORS headers for response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Error:', err);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}));

// Catch-all for SPA routing (serves index.html for any unmatched route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Webhook proxy enabled: /webhook -> ${API_TARGET}`);
  console.log(`✅ Health check available at /health`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
});