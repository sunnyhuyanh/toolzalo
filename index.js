// Error handling for production
process.on('uncaughtException', (err, origin) => {
  console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  process.exit(1);
});

/**
 * Production-ready server for Zalo Automation
 * Final version with a buffered Axios proxy to ensure data integrity
 */

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; // Use Railway's PORT or fallback to 3000
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

app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Custom Buffered Axios Proxy Middleware
app.use('/webhook/*', async (req, res) => {
  const targetUrl = `${API_TARGET}${req.originalUrl}`;
  console.log(`[BUFFERED PROXY] ${req.method} -> ${targetUrl}`);

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers['user-agent'],
      },
      // IMPORTANT: We receive the response as a buffer to handle any data type
      responseType: 'arraybuffer', 
      timeout: 60000,
    });

    // Forward headers from the target
    res.set(response.headers);
    // Ensure CORS is allowed
    res.set('Access-Control-Allow-Origin', '*');
    
    // Send the complete response buffer
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error('--- [BUFFERED PROXY ERROR] ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      // Forward the error response from the target
      res.status(error.response.status).set(error.response.headers).send(error.response.data);
    } else {
      console.error('Error Code:', error.code);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'Proxy Error',
          message: 'Could not connect to the webhook server.',
          code: error.code || 'UNKNOWN'
        });
      }
    }
  }
});

// Serve user-facing index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const host = process.env.RAILWAY_PUBLIC_DOMAIN || `localhost:${PORT}`;
    console.log('========================================');
    console.log(`🚀 Server running on ${process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + host : 'http://' + host}`);
    console.log(`✅ Health check available at /health`);
    console.log(`🔑 Admin panel available at /admin`);
    console.log(`🔗 Buffered Axios proxy enabled on /webhook/*`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Port: ${PORT}`);
    console.log('========================================');
});