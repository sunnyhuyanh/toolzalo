# 🔧 Railway Deployment Fix Guide

## ✅ Đã sửa các lỗi sau:

### 1. **Lỗi routing order** (CRITICAL FIX)
- ❌ **Lỗi cũ**: Health check endpoint đặt SAU catch-all route `app.get('*')`
- ✅ **Đã sửa**: Health check endpoint đặt TRƯỚC tất cả routes khác
- **Impact**: Railway không thể health check → app failed

### 2. **Thêm error handling**
- ✅ Thêm graceful shutdown handlers (SIGTERM, SIGINT)
- ✅ Thêm server error handler
- ✅ Thêm middleware error handler
- ✅ Listen on `0.0.0.0` để Railway có thể bind

### 3. **Thêm logging chi tiết**
- ✅ Request logging với timestamp
- ✅ Health check logging
- ✅ Better error messages

### 4. **Cải thiện proxy middleware**
- ✅ Check headersSent trước khi response
- ✅ Better error handling cho proxy

## 🚀 Deploy lên Railway - Step by Step

### Step 1: Commit và push code
```bash
git add .
git commit -m "Fix Railway deployment - health check routing"
git push origin main
```

### Step 2: Trên Railway Dashboard
1. Go to project settings
2. Set environment variables:
   ```
   NODE_ENV=production
   ```
3. Deploy settings đã có trong `railway.json`:
   - Health check path: `/health`
   - Start command: `npm start`

### Step 3: Monitor deployment
```bash
railway logs --follow
```

## 🧪 Verify deployment

### Test health check:
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-06T16:00:00.000Z",
  "port": "8880",
  "environment": "production"
}
```

### Test API endpoint:
```bash
curl https://your-app.railway.app/api/test
```

### Test webhook proxy:
```bash
curl -X POST https://your-app.railway.app/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🔴 Nếu vẫn còn lỗi

### Option 1: Dùng server đơn giản hơn
```bash
# Trong package.json, đổi start script:
"start": "node server-simple.js"
```

### Option 2: Debug với Railway CLI
```bash
railway run node index.js
```

### Option 3: Check Railway logs
```bash
railway logs | grep ERROR
railway logs | grep HEALTH
```

## 📊 Local test đã pass
```
✅ Health Check: PASSED (Status: 200)
✅ Test API: PASSED (Status: 200)  
✅ Static File: PASSED (Status: 200)
✅ Webhook Proxy GET: PASSED (Status: 200)
✅ Non-existent Route: PASSED (Status: 404)
```

## 🎯 Key points để nhớ

1. **Railway tự động set PORT** - KHÔNG hardcode port
2. **Health check PHẢI ở đầu** - Trước static files và catch-all
3. **Listen on 0.0.0.0** - Không dùng localhost
4. **Graceful shutdown** - Handle SIGTERM properly
5. **No console.log spam** - Chỉ log essential info

## 💡 Quick debug commands

```bash
# Check if port is correct
echo $PORT

# Test health locally
curl http://localhost:$PORT/health

# Check process
ps aux | grep node

# View real-time logs
railway logs -f
```

---
**Status**: Code đã được test locally và sẵn sàng deploy! 🚀