# Hướng dẫn cấu hình Routing

## Tổng quan
Hệ thống được thiết kế với cấu trúc URL rõ ràng:
- `domain.com` → Giao diện đăng nhập user (index.html)
- `domain.com/admin` → Admin panel (admin.html)

## Cách 1: Sử dụng .htaccess (Apache Server)

File `.htaccess` đã được tạo sẵn. Chỉ cần upload lên server Apache.

**Yêu cầu**: 
- Apache với mod_rewrite enabled
- AllowOverride All trong cấu hình Apache

## Cách 2: Cấu hình Nginx

1. Mở file cấu hình Nginx của domain
2. Thêm nội dung từ file `nginx.conf` vào server block
3. Thay đổi `your-domain.com` và `/path/to/your/project`
4. Reload Nginx: `sudo nginx -s reload`

## Cách 3: Development Server (Node.js)

Tạo file `server.js`:

```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API routes (if needed)
app.use('/api', require('./api/routes'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

Chạy: `node server.js`

## Cách 4: Python Simple Server

Tạo file `server.py`:

```python
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class MyHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        elif self.path == '/admin':
            self.path = '/admin.html'
        return SimpleHTTPRequestHandler.do_GET(self)

os.chdir('.')
httpd = HTTPServer(('localhost', 8000), MyHandler)
print('Server running at http://localhost:8000')
httpd.serve_forever()
```

Chạy: `python server.py`

## Cách 5: Vercel Deployment

Tạo file `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/admin", "destination": "/admin.html" }
  ]
}
```

## Cách 6: Netlify Deployment

Tạo file `_redirects`:

```
/              /index.html    200
/admin         /admin.html    200
```

## Cách 7: GitHub Pages

GitHub Pages không hỗ trợ server-side routing. Sử dụng:

1. Truy cập trực tiếp: `username.github.io/repo/index.html`
2. Admin: `username.github.io/repo/admin.html`
3. Hoặc include file `router.js` trong HTML để handle client-side routing

## Cách 8: IIS (Windows Server)

Tạo file `web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Admin Route">
          <match url="^admin/?$" />
          <action type="Rewrite" url="/admin.html" />
        </rule>
        <rule name="Root Route">
          <match url="^$" />
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Testing

Sau khi cấu hình, test các URL sau:
- `http://domain.com` → Phải hiển thị trang đăng nhập
- `http://domain.com/admin` → Phải hiển thị admin panel (yêu cầu đăng nhập admin)

## Security Notes

1. **Kiểm tra quyền admin**: File admin.html đã có code kiểm tra quyền admin
2. **HTTPS**: Luôn sử dụng HTTPS trong production
3. **Headers bảo mật**: Đã config trong Nginx, thêm tương tự cho các server khác
4. **Rate limiting**: Nên thêm rate limiting cho các endpoint API

## Troubleshooting

### Lỗi 404 khi truy cập /admin
- Kiểm tra file .htaccess hoặc cấu hình server
- Đảm bảo mod_rewrite enabled (Apache)
- Check quyền đọc file

### Redirect loop
- Clear cache browser
- Kiểm tra cấu hình không có rule conflict

### Không redirect được
- Kiểm tra AllowOverride (Apache)
- Reload/restart web server sau khi thay đổi config 