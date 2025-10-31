# Zalo Group Automation

Hệ thống tự động hóa quản lý nhóm Zalo với multi-user support và admin panel.

## 🚀 Tính năng

- ✅ **Multi-user system** - Hỗ trợ nhiều người dùng với cấu hình riêng
- ✅ **Admin Panel** - Quản lý người dùng, webhook, và nick Zalo
- ✅ **Gửi tin nhắn tự động** - Gửi tin nhắn cho thành viên nhóm
- ✅ **Đăng bài tự động** - Lên lịch đăng bài vào nhiều nhóm
- ✅ **Mời thành viên** - Tự động mời thành viên vào nhóm
- ✅ **Webhook tùy chỉnh** - Mỗi user có webhook riêng

## 📋 Yêu cầu

- Web server (Apache/Nginx/Node.js) 
- Modern browser (Chrome, Firefox, Safari, Edge)
- Proxy server đang chạy (xem file `proxy.js`)
- **Supabase account** - Để lưu trữ dữ liệu người dùng
- Node.js 16+ (cho development server)

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/yourusername/zalo-group-automation.git
cd zalo-group-automation
npm install
```

### 2. Cài đặt Supabase

#### Tạo Supabase Project
1. Truy cập [https://supabase.com](https://supabase.com)
2. Tạo project mới: `zalo-group-automation`
3. Chọn region gần nhất (Singapore cho VN)

#### Thiết lập Database
1. Vào SQL Editor trong Supabase dashboard
2. Copy và chạy nội dung file `supabase-schema.sql`
3. Kiểm tra tables đã được tạo trong Table Editor

#### Cấu hình API Keys
1. Vào Settings → API
2. Copy Project URL và API keys
3. Cập nhật file `config.js`:

```javascript
const config = {
  supabase: {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your_anon_key_here',
    serviceRoleKey: 'your_service_role_key_here'
  }
};
```

📖 **Xem hướng dẫn chi tiết**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### 3. Development Server (Khuyến nghị cho development)

```bash
npm run dev
```

Server sẽ chạy tại:
- User Interface: http://localhost:3000  
- Admin Panel: http://localhost:3000/admin

### 4. Cấu hình routing (Production)

Hệ thống sử dụng cấu trúc URL:
- `domain.com` → Trang đăng nhập user
- `domain.com/admin` → Admin panel

Chọn một trong các cách sau:

#### Apache (.htaccess)
File `.htaccess` đã được tạo sẵn. Upload lên server Apache với mod_rewrite enabled.

#### Nginx
Copy nội dung từ `nginx.conf` vào server block của bạn.

#### Vercel
Deploy với `vercel.json` đã có sẵn:
```bash
vercel
```

#### Netlify
Deploy với `_redirects` đã có sẵn:
```bash
netlify deploy
```

Xem chi tiết trong file [ROUTING_SETUP.md](ROUTING_SETUP.md)

### 3. Chạy proxy server
```bash
npm install
node proxy.js
```

## 👤 Tài khoản mặc định

Sau khi chạy SQL schema, các tài khoản sau sẽ được tạo trong Supabase:

### Admin
- Username: `admin`
- Password: `admin@123`
- Quyền: Quản trị viên (truy cập Admin Panel)

### Demo User  
- Username: `demo`
- Password: `demo123`
- Nick Zalo mẫu: `test`, `Dương Nguyễn`, `Đức Phòng`, `Khánh Duy`

⚠️ **Bảo mật**: Đổi mật khẩu admin sau khi cài đặt!

## 📖 Hướng dẫn sử dụng

### Người dùng thông thường
1. Truy cập `domain.com`
2. Đăng nhập với tài khoản được cấp
3. Sử dụng các tính năng:
   - Gửi tin nhắn cho thành viên nhóm
   - Đăng bài tự động
   - Mời thành viên vào nhóm

### Admin
1. Đăng nhập với tài khoản admin
2. Click "Admin Panel" hoặc truy cập `domain.com/admin`
3. Quản lý:
   - Tạo/sửa/xóa người dùng
   - Cấu hình webhook cho từng user
   - Quản lý danh sách nick Zalo

Xem chi tiết trong [ADMIN_GUIDE.md](ADMIN_GUIDE.md)

## 🏗️ Cấu trúc dự án

```
zalo-group-automation/
├── index.html           # Trang đăng nhập và app chính
├── admin.html           # Admin panel
├── config.js            # Supabase configuration
├── config.example.js    # Config template
├── supabase-service.js  # Supabase service layer
├── supabase-schema.sql  # Database schema cho Supabase
├── webhook-test.js      # Webhook testing utilities
├── auth.js              # Authentication API (legacy)
├── router.js            # Client-side router
├── proxy.js             # Proxy server cho Zalo API
├── start.js             # Development server
├── dev-server.js        # Express development server
├── package.json         # Dependencies và scripts
├── .htaccess            # Apache routing config
├── nginx.conf           # Nginx routing config
├── vercel.json          # Vercel deployment config
├── _redirects           # Netlify deployment config
├── SUPABASE_SETUP.md    # Hướng dẫn cài đặt Supabase
├── ADMIN_GUIDE.md       # Admin guide
└── ROUTING_SETUP.md     # Routing setup guide
```

## 🔧 Cấu hình

### Supabase Configuration
Cập nhật file `config.js` với thông tin Supabase của bạn:

```javascript
const config = {
  supabase: {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};
```

### Webhook URLs  
Mỗi user có thể cấu hình 3 loại webhook:
- **Webhook quét nhóm**: `/api/webhook/zalo-automation`
- **Webhook gửi tin nhắn**: `/api/webhook/zalo-sent-text-image`
- **Webhook mời thành viên**: `/api/webhook/zalo-invite-member`

### Webhook Testing
Sử dụng công cụ test webhook tích hợp:

```javascript
// Test webhooks cho user
const tester = new WebhookTester();
const results = await tester.testUserWebhooks(user);
console.log('Test results:', results);
```

### Database Schema
Database Supabase bao gồm:
- `users` - Thông tin người dùng và cấu hình webhook
- `user_nicks` - Nick Zalo của từng user
- `scheduled_posts` - Lịch đăng bài tự động
- `saved_posts` - Bài viết đã lưu để tái sử dụng
- `activity_logs` - Log hoạt động của user

## 🔐 Bảo mật

### Database Security
- ✅ **Row Level Security (RLS)**: Enabled cho tất cả tables
- ✅ **Password Hashing**: SHA-256 với salt cho demo, bcrypt cho production
- ✅ **API Keys**: Supabase anon key và service role key
- ✅ **Environment Variables**: Sensitive data trong config

### Network Security  
- ✅ **HTTPS**: Bắt buộc trong production
- ✅ **CORS**: Cấu hình đúng domain
- ✅ **Rate Limiting**: Supabase tích hợp sẵn
- ✅ **Input Validation**: Validate webhook URLs và user data

### Recommendations
- 🔄 Đổi mật khẩu admin sau khi cài đặt
- 🔄 Sử dụng JWT authentication cho production
- 🔄 Enable audit logging trong Supabase
- 🔄 Monitor API usage và unusual activities

## 🚧 Development

### Development Server
```bash
# Khuyến nghị: Development server với routing
npm run dev

# Hoặc chỉ static server
npm run server  

# Hoặc Express server với API mock
npm run dev-server
```

### Available Scripts
```bash
npm run dev        # Start development server (start.js)
npm run server     # Live-server với auto-reload
npm run proxy      # Chỉ chạy proxy server
npm run build      # Build cho production
npm run test       # Chạy tests
```

### Testing Webhooks
```bash
# Test webhook trong browser console
const tester = new WebhookTester();
await tester.testUserWebhooks(currentUser);
```

### Build for production
```bash
npm run build
```

Quá trình build sẽ:
1. Minify HTML/CSS/JS
2. Optimize dependencies  
3. Generate production config
4. Create deployment package

## 📝 License

MIT License - see LICENSE file

## 👥 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

- Create an issue on GitHub
- Email: support@example.com

## 🙏 Credits

Developed by Hailinhmacduc"# toolzalo" 
