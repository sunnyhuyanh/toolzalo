const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// The target URL for your n8n webhooks
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

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
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response from ${API_TARGET}: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Error:', err);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message
    });
  }
}));

// Catch-all for SPA routing (serves index.html for any unmatched route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Webhook proxy enabled: /webhook -> ${API_TARGET}`);
});