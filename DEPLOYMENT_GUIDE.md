# Hướng dẫn Deploy Production

## 🔴 LƯU Ý QUAN TRỌNG VỀ CORS

Khi deploy lên production, bạn sẽ gặp lỗi CORS khi gọi webhook n8n. Có 3 cách giải quyết:

### Cách 1: Cấu hình CORS trên n8n (RECOMMENDED)

Trong n8n workflow, thêm **"Respond to Webhook"** node với cấu hình:

1. Click vào **"Respond to Webhook"** node
2. Trong phần **Options**, thêm:
   - **Response Headers**:
     ```
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, POST, OPTIONS
     Access-Control-Allow-Headers: Content-Type
     ```

3. Hoặc chỉ cho phép domain của bạn:
   ```
   Access-Control-Allow-Origin: https://your-domain.com
   ```

### Cách 2: Sử dụng Backend Server làm Proxy

Nếu bạn có backend server riêng (Node.js, PHP, Python...), tạo endpoint proxy:

```javascript
// Node.js Express example
app.post('/api/webhook/*', async (req, res) => {
  const webhookPath = req.params[0];
  const response = await fetch(`https://n8nhosting-60996536.phoai.vn/webhook/${webhookPath}`, {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  res.json(data);
});
```

### Cách 3: Deploy với Vercel/Netlify Functions

Tạo serverless function làm proxy:

**`/api/webhook.js` (Vercel)**:
```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const response = await fetch('https://n8nhosting-60996536.phoai.vn' + req.url.replace('/api', ''), {
    method: req.method,
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  return res.status(200).json(data);
}
```

## 🚀 Deploy Options

### 1. Deploy lên Vercel (FREE)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
```

### 2. Deploy lên Netlify (FREE)

```bash
# Build static files
npm run build

# Deploy to Netlify
# Drag & drop thư mục vào netlify.com
```

### 3. Deploy lên VPS với Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/zalo-automation;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy to n8n (if using backend proxy)
    location /api/webhook/ {
        proxy_pass https://n8nhosting-60996536.phoai.vn/webhook/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 Checklist trước khi Deploy

- [ ] Đã cấu hình CORS trên n8n webhooks
- [ ] Đã test webhook trên production domain
- [ ] Đã cập nhật Supabase URL & keys cho production
- [ ] Đã cấu hình domain trong Supabase Auth settings
- [ ] Đã test đăng nhập/đăng xuất
- [ ] Đã kiểm tra console không có lỗi

## 🔧 Debug CORS Issues

Nếu vẫn gặp lỗi CORS:

1. **Check browser console** - xem chi tiết lỗi
2. **Check Network tab** - xem response headers
3. **Test với curl**:
   ```bash
   curl -X POST https://n8nhosting-60996536.phoai.vn/webhook/zalo-automation \
        -H "Content-Type: application/json" \
        -d '{"nick":"test"}' \
        -v
   ```
4. **Kiểm tra n8n logs** - xem request có đến n8n không

## 💡 Tips

- Luôn sử dụng HTTPS cho production
- Set up monitoring (Sentry, LogRocket)
- Enable rate limiting để tránh spam
- Backup database định kỳ
- Use environment variables cho sensitive data