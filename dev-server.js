const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// The target URL for your n8n webhooks or other external APIs
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

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
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Error:', err);
    res.status(500).send('Proxy Error');
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