const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3000;

// The target URL for your n8n webhooks or other external APIs
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Proxy middleware to bypass CORS during development.
// It forwards requests from `localhost:3000/proxy` to the `API_TARGET`.
app.use('/proxy', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: (path, req) => {
    // Rewrites '/proxy/webhook/abc' to '/webhook/abc'
    return path.replace('/proxy', '');
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the proxy request
    console.log(`[PROXY] Forwarding request to: ${API_TARGET}${req.originalUrl.replace('/proxy', '')}`);
    console.log(`[PROXY] Method: ${req.method}`);
    console.log(`[PROXY] Headers:`, req.headers);
    
    // For FormData, let the browser set the proper Content-Type with boundary
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      console.log('[PROXY] FormData detected, preserving Content-Type');
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log the response
    console.log(`[PROXY] Response from ${API_TARGET}: ${proxyRes.statusCode}`);
    console.log(`[PROXY] Response headers:`, proxyRes.headers);
    
    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Error:', err);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      details: err.stack
    });
  }
}));

// Route cho admin panel
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/admin.html');
});

// Serve static files from the current directory ('.')
app.use(express.static('.'));

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Development server is running!`);
  console.log(`✅ Main app available at: http://localhost:${PORT}`);
  console.log(`🔗 Proxy enabled: /proxy -> ${API_TARGET}`);
  console.log('\n');
}); 