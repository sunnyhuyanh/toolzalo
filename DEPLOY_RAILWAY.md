# 🚂 Hướng dẫn Deploy lên Railway

## 📋 Checklist trước khi deploy

✅ **File package.json** - Đã cấu hình đúng với:
- Dependencies cần thiết (express, http-proxy-middleware, cors)
- Script "start": "node index.js"
- Node engine version: "20.x"

✅ **File index.js** - Đã được cải thiện với:
- CORS middleware cho cross-origin requests
- Body parser cho JSON/URL-encoded requests
- Health check endpoint tại `/health`
- Logging chi tiết cho debug
- Error handling tốt hơn

✅ **File railway.json** - Đã cấu hình:
- Build với NIXPACKS
- Health check path: `/health`
- Start command: `npm start`

## 🚀 Các bước deploy

### 1. Chuẩn bị Railway
```bash
# Cài đặt Railway CLI (nếu chưa có)
npm install -g @railway/cli

# Login vào Railway
railway login
```

### 2. Khởi tạo project
```bash
# Trong thư mục project
railway init

# Hoặc link với project có sẵn
railway link
```

### 3. Cấu hình biến môi trường
```bash
# Set các biến môi trường cần thiết
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set API_TARGET=https://n8nhosting-60996536.phoai.vn
```

### 4. Deploy
```bash
# Deploy lên Railway
railway up

# Hoặc sử dụng GitHub integration
git push origin main
```

### 5. Kiểm tra deployment
```bash
# Xem logs
railway logs

# Mở app trong browser
railway open
```

## 🧪 Test webhook sau khi deploy

### Sử dụng script test có sẵn:
```bash
# Cập nhật BASE_URL trong test-webhook.js
BASE_URL=https://your-app.railway.app node test-webhook.js
```

### Hoặc test bằng cURL:
```bash
curl -X POST https://your-app.railway.app/webhook/your-webhook-id \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{"message":"Hello from Railway"}}'
```

## 📊 Monitoring

### Xem logs realtime:
```bash
railway logs --follow
```

### Check health endpoint:
```bash
curl https://your-app.railway.app/health
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **Port binding error**
   - Railway tự động set PORT, không hardcode port number
   - Sử dụng: `process.env.PORT || 3000`

2. **Webhook không nhận được response**
   - Kiểm tra CORS settings
   - Verify API_TARGET URL
   - Check logs: `railway logs`

3. **Build failed**
   - Kiểm tra package.json syntax
   - Verify node version trong engines
   - Ensure all dependencies listed

4. **Health check failed**
   - Endpoint `/health` phải return status 200
   - Timeout mặc định: 120 seconds

## 📝 Các endpoint có sẵn

- `GET /` - Serve static files (index.html)
- `GET /health` - Health check endpoint
- `ALL /webhook/*` - Proxy to n8n webhooks
- `GET /*` - SPA routing (returns index.html)

## 🔒 Bảo mật

- CORS đã được enable cho tất cả origins
- Request size limit: 10MB
- Error stack traces chỉ hiển thị trong development mode

## 📞 Support

Nếu gặp vấn đề:
1. Check Railway status: https://status.railway.app
2. Review logs: `railway logs`
3. Verify environment variables: `railway variables`
4. Test locally first: `npm start`

---
**Last updated**: Deploy configuration verified and optimized for Railway platform