# 🧪 Hướng dẫn Test đầy đủ

## 1. Test Admin Panel

### Bước 1: Start Server
```bash
cd /Users/hailinhmac/Library/CloudStorage/OneDrive-Personal/CODE/zalo-automation-tools
npm start
# Hoặc
node index.js
```

### Bước 2: Truy cập Admin Panel
```
URL: http://localhost:3000/admin
```

### Bước 3: Login
- **Username:** `admin`
- **Password:** Dùng password admin đã setup

### Bước 4: Kiểm tra Dashboard
- [ ] Stats cards hiển thị:
  - Tổng người dùng: 5
  - Đang hoạt động: 5  
  - Tạm khóa: 0

- [ ] Bảng danh sách users hiển thị 5 users
- [ ] Mỗi user có đầy đủ thông tin:
  - Tên đăng nhập
  - Họ tên
  - Webhook URLs (hiển thị rút gọn)
  - Nick Zalo
  - Trạng thái
  - Ngày tạo

### Bước 5: Test CRUD Operations
- [ ] Click "Thêm người dùng mới" → Form hiển thị
- [ ] Click "Sửa" một user → Form pre-fill dữ liệu
- [ ] Click "Xóa" → Confirm dialog hiển thị

## 2. Test User Login & Features

### Bước 1: Logout Admin
Click nút "Đăng xuất" ở admin panel

### Bước 2: Truy cập App chính
```
URL: http://localhost:3000/
```

### Bước 3: Login với User thường
- **Username:** `khanhduy`
- **Password:** Password của user khanhduy

### Bước 4: Kiểm tra Nick Dropdown
- [ ] Feature 1 (Gửi tin nhắn): Dropdown có 4 nicks
  - test
  - Khánh Duy
  - Dương Nguyễn
  - Đức Phòng

- [ ] Feature 2 (Đăng bài): Dropdown có 4 nicks (giống trên)
- [ ] Feature 3 (Mời thành viên): Dropdown có 4 nicks (giống trên)

## 3. Test Quét Nhóm với Cache

### Feature 1: Gửi tin nhắn

#### Test 1: Quét nhóm lần đầu
1. [ ] Chọn nick: `test`
2. [ ] Không có thông báo cache (vì chưa có cache)
3. [ ] Click "Quét nhóm"
4. [ ] Overlay hiển thị: "Việc quét nhóm có thể lâu hơn 1 phút..."
5. [ ] Webhook được gọi: `https://n8nhosting-60996536.phoai.vn/webhook/khanhduy-tt-nhom`
6. [ ] Kết quả hiển thị danh sách nhóm
7. [ ] Cache info hiển thị: "Có X nhóm đã lưu (vừa xong) - Tự động hiển thị"

#### Test 2: Chuyển nick và quay lại
1. [ ] Chọn nick khác: `Dương Nguyễn`
2. [ ] Cache info ẩn (vì nick này chưa có cache)
3. [ ] Chọn lại nick: `test`
4. [ ] **Danh sách nhóm tự động hiển thị** (load từ cache)
5. [ ] Cache info hiển thị: "Có X nhóm đã lưu (0 phút trước)..."

#### Test 3: Quét lại (Force Refresh)
1. [ ] Với nick `test` đã có cache
2. [ ] Click "Quét lại" trong cache info
3. [ ] Xác nhận dialog
4. [ ] Cache bị xóa và quét lại từ webhook

#### Test 4: Cache Expiry
1. [ ] Đợi > 1 giờ hoặc thay đổi `CACHE_EXPIRY_HOURS = 0.01` (trong code)
2. [ ] Chọn nick đã có cache cũ
3. [ ] Cache tự động expire
4. [ ] Không tự động load, cần quét lại

### Feature 2: Đăng bài tự động

Repeat các test tương tự Feature 1:
- [ ] Quét nhóm lần đầu
- [ ] Auto-load cache khi chọn lại nick
- [ ] Force refresh với nút "Quét lại"
- [ ] Checkbox chọn nhiều nhóm hoạt động

### Feature 3: Mời thành viên vào nhóm

Repeat các test tương tự:
- [ ] Quét nhóm lần đầu
- [ ] Auto-load vào cả 2 lists (Source & Target)
- [ ] Force refresh hoạt động

## 4. Test Webhook Integration

### Test Manual với curl

```bash
# Test webhook quét nhóm
curl -X POST https://n8nhosting-60996536.phoai.vn/webhook/khanhduy-tt-nhom \
  -H "Content-Type: application/json" \
  -d '{"nick":"test"}' \
  -w "\nStatus: %{http_code}\n"

# Kỳ vọng:
# - Status: 200
# - Response: JSON array of groups hoặc nested object
```

### Test trong Browser
1. [ ] Mở DevTools (F12)
2. [ ] Tab Network
3. [ ] Click "Quét nhóm"
4. [ ] Tìm request đến webhook
5. [ ] Check:
   - Request payload: `{"nick": "test"}`
   - Response status: 200
   - Response body: Valid JSON
   - Response time: < 2.5 phút

## 5. Test Error Handling

### Test 1: Webhook Timeout
1. [ ] Set timeout ngắn (hoặc webhook chậm)
2. [ ] Quét nhóm
3. [ ] Sau 2.5 phút → Error message hiển thị
4. [ ] UI không bị crash

### Test 2: Invalid Response
1. [ ] Webhook trả về invalid JSON
2. [ ] Error handling: "Dữ liệu response không hợp lệ..."
3. [ ] UI vẫn hoạt động

### Test 3: Network Error
1. [ ] Tắt internet hoặc webhook offline
2. [ ] Click quét nhóm
3. [ ] Error message: "Failed to fetch" hoặc "Network error"
4. [ ] Không crash app

## 6. Test Cache Persistence

### Test 1: Refresh Page
1. [ ] Quét nhóm với nick `test`
2. [ ] Refresh page (F5)
3. [ ] Login lại
4. [ ] Chọn nick `test`
5. [ ] **Cache vẫn còn**, auto-load ngay

### Test 2: Clear Cache
1. [ ] Mở DevTools → Application → Local Storage
2. [ ] Xóa key `groupScanCache`
3. [ ] Chọn nick bất kỳ
4. [ ] Không có cache, cần quét lại

### Test 3: Multiple Users
1. [ ] Login user `khanhduy`, quét với nick `test`
2. [ ] Logout, login user `linhnd`, quét với nick `LINH ND`
3. [ ] Mỗi user có cache riêng trong localStorage

## 7. Test UI/UX

### Desktop
- [ ] Layout responsive, không bị lỗi
- [ ] Buttons có hover effects
- [ ] Transitions mượt mà
- [ ] Loading spinners hiển thị đúng
- [ ] Overlay backdrop hoạt động

### Mobile (Responsive)
- [ ] Mở Chrome DevTools → Toggle device toolbar
- [ ] Test với iPhone SE, iPad, Desktop
- [ ] Touch-friendly buttons
- [ ] Không zoom khi double tap
- [ ] Scroll mượt

## 8. Test Performance

### Check 1: Initial Load
- [ ] Page load < 2 giây
- [ ] No console errors
- [ ] Supabase init thành công

### Check 2: Cache Performance
- [ ] Load từ cache: < 100ms
- [ ] Load từ webhook: 10s - 2.5 phút (tùy n8n)
- [ ] UI không bị freeze

### Check 3: Memory
- [ ] Mở Performance monitor
- [ ] Quét nhóm nhiều lần
- [ ] Không memory leak
- [ ] Cache size hợp lý

## ✅ Checklist Tổng hợp

### Critical Features
- [ ] Admin panel load users thành công
- [ ] User login và xem nicks đúng
- [ ] Quét nhóm gọi webhook thành công
- [ ] Cache save và load đúng
- [ ] Auto-load cache khi chọn nick
- [ ] Force refresh hoạt động

### Nice to Have
- [ ] UI đẹp, smooth animations
- [ ] Error messages rõ ràng
- [ ] Performance tốt
- [ ] Mobile responsive

### Security
- [ ] Password được hash
- [ ] RLS policies hoạt động
- [ ] No sensitive data in console
- [ ] HTTPS cho webhooks

## 🐛 Bug Report Template

Nếu gặp lỗi, báo cáo theo format:

```
**Lỗi:** [Mô tả ngắn gọn]

**Bước tái hiện:**
1. 
2. 
3. 

**Kỳ vọng:**
- 

**Thực tế:**
- 

**Console errors:**
```
[Paste errors here]
```

**Network log:**
[Screenshot Network tab]

**Environment:**
- Browser: 
- OS:
- Server: localhost/production
```

---
**Happy Testing! 🚀**

