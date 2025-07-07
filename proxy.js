const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

// Proxy configuration for N8N webhooks
const proxyOptions = {
  target: 'https://n8nhosting-60996536.phoai.vn',
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    '^/api/webhook': '/webhook'
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    console.log(`✅ Response ${proxyRes.statusCode} for ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
};

// Apply the proxy middleware
app.use('/api/webhook', createProxyMiddleware(proxyOptions));

// Serve static files (HTML, CSS, JS)
app.use(express.static('.', {
  setHeaders: (res, path) => {
    // Add CORS headers to static files too
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Custom route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Proxy server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log(`🌐 Proxy server running on: http://localhost:${PORT}`);
  console.log('📱 Access your app at: http://localhost:3000');
  console.log('🔧 Test webhooks at: http://localhost:3000/test-webhook.html');
  console.log('❤️  Health check: http://localhost:3000/health');
  console.log('🔄 Proxy target: https://n8nhosting-60996536.phoai.vn');
  console.log('🚀 =================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Proxy server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Proxy server shutting down...');
  process.exit(0);
}); 