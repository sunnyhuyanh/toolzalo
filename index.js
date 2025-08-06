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

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint - MUST BE BEFORE static files and catch-all
app.get('/health', (req, res) => {
  console.log('[HEALTH] Health check requested');
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

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
    
    // Check if response was already sent
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Proxy Error',
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
}));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Catch-all for SPA routing - MUST BE LAST
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/webhook/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = path.join(__dirname, 'index.html');
  
  // Check if index.html exists
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start the server with error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Webhook proxy enabled: /webhook/* -> ${API_TARGET}`);
  console.log(`✅ Health check available at /health`);
  console.log(`🧪 Test endpoint available at /api/test`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('========================================');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});