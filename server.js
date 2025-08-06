const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
// Railway sẽ tự động cung cấp biến môi trường PORT
const PORT = process.env.PORT || 3000;

// URL webhook n8n thực tế của bạn
const API_TARGET = 'https://n8nhosting-60996536.phoai.vn';

// Cấu hình Proxy cho tất cả các request tới /webhook/*
// Ví dụ: app.up.railway.app/webhook/abc -> n8n.../webhook/abc
app.use('/webhook', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true, // Bắt buộc phải có cho proxy
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Forwarding request: ${req.method} ${req.originalUrl} -> ${API_TARGET}${req.originalUrl}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Error:', err);
    res.status(500).send('Proxy Error');
  }
}));

// Phục vụ các file tĩnh (HTML, JS, CSS) từ thư mục gốc
app.use(express.static(path.join(__dirname, '/')));

// Với mọi request khác không khớp, trả về index.html
// Điều này quan trọng để ứng dụng hoạt động như một Single Page Application (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Webhook proxy enabled: /webhook -> ${API_TARGET}`);
});
