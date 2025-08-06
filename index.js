/**
 * Simplified server for Railway deployment
 * This is a minimal version focused on stability
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CRITICAL: Health check must be first
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Admin routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server working', time: new Date().toISOString() });
});

// Webhook proxy (simplified)
app.all('/webhook/*', async (req, res) => {
  const axios = require('axios');
  const targetUrl = `https://n8nhosting-60996536.phoai.vn${req.originalUrl}`;
  
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        host: 'n8nhosting-60996536.phoai.vn'
      },
      validateStatus: () => true
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Webhook proxy error:', error.message);
    res.status(502).json({ error: 'Proxy error', message: error.message });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Health check available at /health`);
});