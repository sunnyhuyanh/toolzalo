# Hướng dẫn cài đặt Supabase

## 1. Tạo project Supabase

### Bước 1: Đăng ký/Đăng nhập Supabase
1. Truy cập [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Đăng nhập bằng GitHub hoặc email

### Bước 2: Tạo project mới
1. Click "New Project"
2. Chọn Organization (hoặc tạo mới)
3. Điền thông tin:
   - **Name**: `zalo-group-automation`
   - **Database Password**: Tạo mật khẩu mạnh
   - **Region**: Chọn gần nhất (Singapore cho VN)
4. Click "Create new project"
5. Đợi 2-3 phút để project được tạo

## 2. Thiết lập Database

### Bước 1: Chạy SQL Schema
1. Vào project dashboard
2. Click "SQL Editor" ở sidebar
3. Copy nội dung file `supabase-schema.sql`
4. Paste vào SQL Editor
5. Click "Run" để tạo tables

### Bước 2: Kiểm tra Tables
1. Click "Table Editor" ở sidebar
2. Kiểm tra các bảng đã được tạo:
   - `users`
   - `user_nicks`
   - `scheduled_posts`
   - `saved_posts`
   - `activity_logs`

## 3. Lấy API Keys

### Bước 1: Vào Settings
1. Click "Settings" ở sidebar
2. Click "API"

### Bước 2: Copy các keys
1. **Project URL**: Copy URL dạng `https://xxxxx.supabase.co`
2. **anon public key**: Copy key dài bắt đầu bằng `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **service_role key**: Copy key bắt đầu bằng `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **Lưu ý**: Service role key có quyền admin, không được public!

## 4. Cấu hình Project

### Bước 1: Cập nhật config.js
1. Mở file `config.js`
2. Thay thế:

```javascript
const config = {
  supabase: {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your_anon_key_here',
    serviceRoleKey: 'your_service_role_key_here'
  },
  // ... rest of config
};
```

### Bước 2: Test kết nối
1. Chạy `npm run dev`
2. Truy cập `http://localhost:3000/admin`
3. Nếu thấy lỗi "Supabase not initialized", check lại config

## 5. Tạo User Demo

### Cách 1: Qua Admin Panel
1. Đăng nhập admin: `admin` / `admin@123`
2. Vào Admin Panel
3. Click "Thêm người dùng mới"
4. Điền thông tin và click "Lưu"

### Cách 2: Qua SQL
```sql
-- Insert demo user
INSERT INTO users (username, password, full_name, status) 
VALUES ('testuser', 'hashed_password_here', 'Test User', 'active');

-- Get user ID và add nicks
INSERT INTO user_nicks (user_id, nick_name) 
VALUES ('user_id_here', 'Nick Zalo Test');
```

## 6. Security Setup (Production)

### Bước 1: Row Level Security (RLS)
```sql
-- Enable RLS (đã có trong schema)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create custom policies
CREATE POLICY "Users can only see active users" 
ON users FOR SELECT 
USING (status = 'active');
```

### Bước 2: Environment Variables
1. Tạo file `.env` (production):
```env
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
```

2. Update config để đọc từ env:
```javascript
const config = {
  supabase: {
    url: process.env.SUPABASE_URL || 'fallback_url',
    anonKey: process.env.SUPABASE_ANON_KEY || 'fallback_key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_key'
  }
};
```

## 7. Monitoring & Logs

### Database Logs
1. Vào Supabase Dashboard
2. Click "Logs" → "Database"
3. Monitor queries và errors

### API Logs  
1. Click "Logs" → "API"
2. Check authentication attempts
3. Monitor usage

## 8. Backup

### Automated Backup
1. Vào "Settings" → "Database"
2. Enable "Point-in-time Recovery"
3. Supabase tự động backup hàng ngày

### Manual Backup
```bash
# Export data using Supabase CLI
npx supabase db dump --local > backup.sql
```

## 9. Troubleshooting

### Lỗi thường gặp:

#### "Supabase not initialized"
- Check file `config.js` có tồn tại không
- Check URL và keys có đúng format không
- Check network connection

#### "Invalid API key"
- Check anon key vs service role key
- Regenerate keys nếu cần

#### "Row Level Security policy violation"
- Check RLS policies
- Tạm thời disable RLS for development:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

#### "Connection timeout"
- Check region của Supabase project
- Check firewall/proxy settings

### Debug Mode
Thêm vào `config.js`:
```javascript
const config = {
  debug: true,  // Enable debug logs
  supabase: {
    // ... your config
  }
};
```

## 10. Migration từ localStorage

Nếu bạn đã có data trong localStorage:

```javascript
// Export data từ localStorage
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('Backup data:', JSON.stringify(users, null, 2));

// Import vào Supabase qua Admin Panel hoặc SQL
```

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: [repo]/issues 