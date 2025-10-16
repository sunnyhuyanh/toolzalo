# 🚀 Quick Start Guide

## ✅ Đã hoàn thành migration & fixes

### Tóm tắt những gì đã làm:
1. ✅ Import toàn bộ database vào Supabase (users, user_nicks, activity_logs)
2. ✅ Sửa lỗi admin panel không load được users
3. ✅ Thêm RLS policies để admin panel hoạt động
4. ✅ Verify webhooks hoạt động OK
5. ✅ Cache system đã hoạt động tốt

## 🎯 Test ngay bây giờ

### 1. Start Server
```bash
cd /Users/hailinhmac/Library/CloudStorage/OneDrive-Personal/CODE/zalo-automation-tools
npm start
```

### 2. Test Admin Panel
```
URL: http://localhost:3000/admin
Login: admin / [your_password]
```

**Kiểm tra:**
- ✅ Dashboard hiển thị stats: 5 users, 5 active, 0 blocked
- ✅ Danh sách users load đầy đủ
- ✅ Nicks hiển thị đúng (khanhduy có 4 nicks)

### 3. Test User App
```
URL: http://localhost:3000/
Login: khanhduy / [password]
```

**Kiểm tra:**
- ✅ Dropdown nicks có: test, Khánh Duy, Dương Nguyễn, Đức Phòng
- ✅ Chọn nick "test" → Click "Quét nhóm"
- ✅ Webhook gọi: `https://n8nhosting-60996536.phoai.vn/webhook/khanhduy-tt-nhom`
- ✅ Kết quả hiển thị + lưu cache
- ✅ Chọn nick khác rồi quay lại → Auto-load từ cache
- ✅ Click "Quét lại" → Clear cache và quét mới

## 📊 Database Info

### Users imported:
| Username | Nicks | Webhooks |
|----------|-------|----------|
| khanhduy | 4 nicks | n8n hosting |
| cuongnguyenduc | 1 nick | n8n hosting |
| linhnd | 1 nick | n8n hosting |
| longnguyenduc | 1 nick | local |
| admin | 1 nick | local |

### Webhooks đang hoạt động:
```
Base URL: https://n8nhosting-60996536.phoai.vn

Endpoints:
- /webhook/khanhduy-tt-nhom (scan groups)
- /webhook/khanhduy-sent-mess (send message)
- /webhook/khanhduy-post (post to group)
- /webhook/khanhduy-invite (invite members)
- /webhook/khanhduy-scan (scan members)
```

## 🐛 Known Issues & Solutions

### ❌ Admin panel báo "Failed to fetch"
**Giải pháp:** ✅ ĐÃ FIX
- Added RLS policy: `Allow anonymous read for admin panel`
- Refresh browser (Ctrl+F5)

### ❌ Webhook timeout
**Không phải lỗi app:**
- N8n backend có thể chậm (> 1 phút)
- Timeout set ở 2.5 phút
- Nếu timeout, thử lại sau

### ❌ Cache không hoạt động
**Check:**
1. Mở DevTools → Application → Local Storage
2. Tìm key `groupScanCache`
3. Nếu không có → Quét nhóm lần đầu để tạo cache

## 🔧 Maintenance

### Clear cache toàn bộ users:
```javascript
// Chạy trong Browser Console
localStorage.removeItem('groupScanCache');
```

### Add user mới:
1. Vào Admin Panel
2. Click "Thêm người dùng mới"
3. Điền thông tin + webhooks
4. Thêm nicks (multiple nicks supported)

### Update webhooks:
1. Vào Admin Panel
2. Click "Sửa" user
3. Update webhook URLs
4. Save

## 📝 Important Files

- `FIX_SUMMARY.md` - Chi tiết những gì đã fix
- `TEST_GUIDE.md` - Hướng dẫn test đầy đủ
- `supabase-service.js` - Service layer cho Supabase
- `admin.html` - Admin panel UI
- `index.html` - Main app với cache system

## 🔐 Security Notes

⚠️ **Temporary setup:**
- RLS policy hiện cho phép anonymous read
- Cần implement Supabase Auth sau này

🔒 **Password:**
- Đã hash bằng SHA-256 với salt
- Không lưu plain text

## 📞 Cần hỗ trợ?

1. Check console errors (F12)
2. Check network tab
3. Verify Supabase config trong `config.js`
4. Test webhook với curl:
```bash
curl -X POST https://n8nhosting-60996536.phoai.vn/webhook/khanhduy-tt-nhom \
  -H "Content-Type: application/json" \
  -d '{"nick":"test"}'
```

---

## ✨ New Features Enabled

### 1. Cache System
- ⏱️ Cache duration: 1 hour
- 🔄 Auto-load on nick select
- 🔁 Force refresh with "Quét lại" button
- 💾 Stored in browser localStorage

### 2. Multi-Nick Support
- Each user can have multiple Zalo nicks
- Separate cache per nick
- Easy switch between nicks

### 3. Admin Dashboard
- User management (CRUD)
- Stats overview
- Activity logs tracking
- Webhook configuration

---

**Status:** ✅ **READY FOR USE**

**Last tested:** 2024
**All features:** Working ✓
**Database:** Migrated ✓
**Webhooks:** Verified ✓

