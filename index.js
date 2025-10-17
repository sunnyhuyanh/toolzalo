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
const cors = require('cors');
const multer = require('multer');
const supabaseService = require('./supabase-service');
const CONFIG = require('./config');

// --- FIX: Initialize Supabase on server start ---
if (!CONFIG || !CONFIG.supabase) {
  console.error('FATAL: Supabase configuration is missing in config.js');
  process.exit(1);
}

console.log('🔧 [CONFIG] Supabase URL:', CONFIG.supabase.url);
console.log('🔧 [CONFIG] Service key ends with:', CONFIG.supabase.serviceRoleKey.slice(-20));

supabaseService.init(CONFIG.supabase).then(success => {
  if (!success) {
    console.error('FATAL: Supabase client failed to initialize. Check config and network.');
    process.exit(1);
  }
  console.log('✅ Supabase service initialized with updated config');
});
// --- END FIX ---

const app = express();
const PORT = process.env.PORT || 3000; // Use Railway's PORT or fallback to 3000
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// API endpoint for file uploads
app.post('/api/upload', upload.single('image'), async (req, res) => {
  // --- DEBUG LOG ---
  console.log('✅ [SERVER] Received a request to /api/upload');
  console.log('📁 [SERVER] File info:', {
    originalname: req.file?.originalname,
    mimetype: req.file?.mimetype,
    size: req.file?.size,
    bufferLength: req.file?.buffer?.length
  });
  
  if (!req.file) {
    console.error('[SERVER] No file was uploaded in the request.');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  console.log('🔄 [SERVER] Calling supabaseService.uploadFile...');
  const { publicURL, error } = await supabaseService.uploadFile(req.file);

  if (error) {
    console.error('❌ [SERVER] Upload failed:', error);
    return res.status(500).json({ error: `File upload failed: ${error.message}` });
  }

  console.log('✅ [SERVER] Upload successful! URL:', publicURL);
  res.status(200).json({ imageUrl: publicURL });
});

// Handle OPTIONS requests for CORS preflight
app.options('/webhook/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Also support legacy/test path that some users configured in n8n
app.options('/webhook-test/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Custom Buffered Axios Proxy Middleware
app.use(['/webhook/*', '/webhook-test/*'], async (req, res) => {
  const targetUrl = `${API_TARGET}${req.originalUrl}`;
  console.log(`[PROXY] ${req.method} -> ${targetUrl}`);
  
  // Log request body for debugging
  if (req.body) {
    console.log('[PROXY] Request body:', JSON.stringify(req.body).substring(0, 200));
  }

  try {
    // Prepare headers - forward all relevant headers
    const proxyHeaders = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
      'User-Agent': req.headers['user-agent'] || 'Zalo-Automation-Proxy/1.0',
    };
    
    // Remove headers that shouldn't be forwarded
    const headersToSkip = ['host', 'connection', 'content-length'];
    Object.keys(req.headers).forEach(key => {
      if (!headersToSkip.includes(key.toLowerCase()) && !proxyHeaders[key]) {
        proxyHeaders[key] = req.headers[key];
      }
    });

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: proxyHeaders,
      responseType: 'arraybuffer',
      timeout: 300000,
      validateStatus: () => true, // Accept any status code
      maxRedirects: 5,
    });

    console.log(`[PROXY] Response status: ${response.status}`);
    
    // Forward all headers from the target response
    Object.keys(response.headers).forEach(key => {
      // Avoid headers that can cause issues when proxying
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'connection') {
        res.setHeader(key, response.headers[key]);
      }
    });

    // Set CORS headers, overwriting if necessary
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Send response
    res.status(response.status).send(response.data);

  } catch (error) {
    console.error('[PROXY ERROR] Full error object:', JSON.stringify(error, null, 2));
    console.error('[PROXY ERROR]:', error.message);
    
    if (error.response) {
      console.error('[PROXY ERROR] Response status:', error.response.status);
      console.error('[PROXY ERROR] Response data:', error.response.data?.toString()?.substring(0, 500));
      
      res.set('Access-Control-Allow-Origin', '*');
      res.status(error.response.status).send(error.response.data);
    } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      console.error('[PROXY ERROR] Connection issue:', error.code);
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'The webhook server took too long to respond or connection was reset',
        code: error.code
      });
    } else {
      console.error('[PROXY ERROR] Unknown error:', error);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Could not connect to the webhook server',
        details: error.message
      });
    }
  }
});

// Serve user-facing index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    const host = process.env.RAILWAY_PUBLIC_DOMAIN || `localhost:${PORT}`;
    console.log('========================================');
    console.log(`🚀 Server running on ${process.env.RAILWAY_PUBLIC_DOMAIN ? 'https://' + host : 'http://' + host}`);
    console.log(`✅ Health check available at /health`);
    console.log(`🔑 Admin panel available at /admin`);
    console.log(`🔗 Buffered Axios proxy enabled on /webhook/* and /webhook-test/*`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Port: ${PORT}`);
    console.log('========================================');
});

server.setTimeout(300000); // 5 minute server timeout
server.keepAliveTimeout = 300000; // Match server timeout
server.headersTimeout = 300000; // Match server timeout