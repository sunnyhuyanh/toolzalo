/**
 * Production-ready server for Zalo Automation
 * Final version with the most robust proxy configuration
 */

const express = require('express');
const path =require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// CRITICAL: Health check must be first
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', port: PORT, timestamp: new Date() });
});

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// The Most Robust Webhook Proxy
const webhookProxy = createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true, // Absolutely essential for virtual hosted sites
  ws: true, // Proxy websockets
  
  onProxyReq: (proxyReq, req, res) => {
    // Set headers to make the request look like it's coming from a real browser
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
    proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
    proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.8');
    proxyReq.setHeader('Connection', 'keep-alive');
    
    // Rewrite the 'host' header to the target's host
    proxyReq.setHeader('host', new URL(API_TARGET).host);

    console.log(`[PROXY] Requesting: ${req.method} ${req.originalUrl}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
  },
  
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] Response from ${API_TARGET}: ${proxyRes.statusCode}`);
  },

  onError: (err, req, res) => {
    console.error('--- PROXY ERROR ---');
    console.error(err);
    if (!res.headersSent) {
      res.status(502).json({ 
        error: 'Proxy Error', 
        message: 'Could not connect to webhook server.', 
        details: err.message,
        code: err.code
      });
    }
  },
  
  // Increase timeouts
  proxyTimeout: 30000, // 30 seconds
  timeout: 30000, // 30 seconds
});

app.use('/webhook', webhookProxy);

// Serve user-facing index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Health check available at /health`);
    console.log(`🔑 Admin panel available at /admin`);
    console.log(`🔗 Webhook proxy enabled on /webhook/*`);
    console.log('========================================');
});