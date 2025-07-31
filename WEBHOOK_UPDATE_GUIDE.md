# Hướng dẫn cập nhật webhook cho Zalo Automation Tools

## 📋 Tổng quan

Hệ thống đã được cập nhật để hỗ trợ **5 webhook** thay vì 3 webhook như trước:

### ✅ Webhook đầy đủ:
1. **Webhook quét nhóm**: `/api/webhook/zalo-automation`
2. **Webhook gửi tin nhắn**: `/api/webhook/zalo-sent-text-image` 
3. **Webhook đăng bài**: `/api/webhook/zalo-post-group` ⭐ **MỚI**
4. **Webhook mời thành viên**: `/api/webhook/zalo-invite-member`
5. **Webhook quét thành viên**: `/api/webhook/zalo-scan-members` ⭐ **MỚI**

## 🔄 Cách cập nhật

### Bước 1: Cập nhật Database

Chạy script migration để thêm 2 trường webhook mới:

```sql
-- Chạy file migration-add-webhooks.sql trong Supabase SQL Editor
```

**Hoặc chạy lệnh SQL sau:**

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS post_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-post-group',
ADD COLUMN IF NOT EXISTS scan_members_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-scan-members';

UPDATE users 
SET 
    post_webhook = '/api/webhook/zalo-post-group',
    scan_members_webhook = '/api/webhook/zalo-scan-members'
WHERE 
    post_webhook IS NULL 
    OR scan_members_webhook IS NULL;
```

### Bước 2: Thêm webhook cho người dùng

1. Vào **Admin Panel** (`admin.html`)
2. **Thêm người dùng mới** hoặc **chỉnh sửa** người dùng hiện có
3. Điền đầy đủ **5 webhook** trong form:

![Webhook Form](screenshot-webhook-form.png)

- **Webhook quét nhóm**: Link webhook để quét danh sách nhóm
- **Webhook gửi tin nhắn**: Link webhook để gửi tin nhắn với hình ảnh
- **Webhook đăng bài**: Link webhook để đăng bài vào nhóm ⭐
- **Webhook mời thành viên**: Link webhook để mời thành viên vào nhóm  
- **Webhook quét thành viên**: Link webhook để quét thành viên trong nhóm ⭐

### Bước 3: Kiểm tra hoạt động

Sau khi cập nhật, các tính năng sau sẽ hoạt động đầy đủ:

✅ **Tính năng 1**: Gửi tin nhắn cho thành viên  
✅ **Tính năng 2**: Đăng bài tự động ⭐  
✅ **Tính năng 3**: Mời thành viên ⭐

## 🔧 Lưu ý kỹ thuật

### Admin Panel Updates:
- Form thêm người dùng hiện có **5 trường webhook**
- Bảng hiển thị người dùng cho thấy tất cả webhook
- Tự động sử dụng webhook mặc định nếu không điền

### Database Schema:
- Thêm cột `post_webhook` và `scan_members_webhook` 
- Giá trị mặc định cho các webhook mới
- Backward compatible với dữ liệu cũ

### Frontend Updates:
- Tự động load webhook config từ user hiện tại
- Sử dụng webhook đúng cho từng chức năng
- Fallback về webhook mặc định nếu thiếu

## 🐛 Troubleshooting

### Vấn đề: Tính năng đăng bài không hoạt động
**Giải pháp**: Kiểm tra webhook `/api/webhook/zalo-post-group` đã được cấu hình đúng chưa

### Vấn đề: Không quét được thành viên  
**Giải pháp**: Kiểm tra webhook `/api/webhook/zalo-scan-members` đã được cấu hình đúng chưa

### Vấn đề: Admin panel không hiển thị đủ trường
**Giải pháp**: Clear cache browser và reload trang

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình cập nhật, vui lòng liên hệ để được hỗ trợ.

---
*Cập nhật lần cuối: 2025-01-27* 