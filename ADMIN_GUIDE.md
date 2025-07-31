# Hướng dẫn sử dụng Admin Panel - Zalo Group Automation

## Giới thiệu
Hệ thống đã được nâng cấp để hỗ trợ quản lý nhiều người dùng, mỗi người dùng có thể có cấu hình webhook và danh sách nick Zalo riêng.

## Tài khoản mặc định

### Admin
- **Username**: admin
- **Password**: admin@123
- **Quyền**: Quản lý toàn bộ người dùng

### Demo User
- **Username**: demo  
- **Password**: demo123
- **Nick Zalo**: test, Dương Nguyễn, Đức Phòng, Khánh Duy

## Hướng dẫn sử dụng

### 1. Đăng nhập Admin Panel

1. Truy cập `index.html`
2. Đăng nhập với tài khoản admin
3. Click nút "Admin Panel" ở góc trên bên phải
4. Hoặc truy cập trực tiếp `admin.html`

### 2. Quản lý người dùng

#### Thêm người dùng mới
1. Click nút "Thêm người dùng mới"
2. Điền thông tin:
   - **Tên đăng nhập**: Bắt buộc, không trùng
   - **Mật khẩu**: Bắt buộc
   - **Họ tên**: Tùy chọn
   - **Webhook**: Cấu hình riêng cho từng user
   - **Nick Zalo**: Danh sách nick user được sử dụng
   - **Trạng thái**: Active/Blocked

#### Chỉnh sửa người dùng
1. Click nút "Sửa" trong danh sách
2. Cập nhật thông tin cần thiết
3. Bỏ trống mật khẩu nếu không muốn thay đổi

#### Xóa người dùng
1. Click nút "Xóa" trong danh sách
2. Xác nhận xóa

### 3. Cấu hình Webhook

Mỗi người dùng có thể có 3 loại webhook riêng:

1. **Webhook quét nhóm**: Dùng để quét danh sách nhóm
2. **Webhook gửi tin nhắn**: Dùng để gửi tin nhắn cho thành viên
3. **Webhook mời thành viên**: Dùng để mời thành viên vào nhóm

Nếu không điền, hệ thống sẽ dùng webhook mặc định:
- `/api/webhook/zalo-automation`
- `/api/webhook/zalo-sent-text-image`
- `/api/webhook/zalo-invite-member`

### 4. Quản lý Nick Zalo

- Mỗi user có thể có nhiều nick Zalo
- Click "Thêm nick" để thêm nick mới
- Click icon X để xóa nick
- Các nick này sẽ hiển thị trong dropdown khi user đăng nhập

## Cấu trúc dữ liệu

### User Object
```javascript
{
  id: "unique_id",
  username: "demo",
  password: "hashed_password", 
  fullName: "Demo User",
  scanWebhook: "/api/webhook/...",
  sendWebhook: "/api/webhook/...", 
  inviteWebhook: "/api/webhook/...",
  nicks: ["test", "Nick 1", "Nick 2"],
  status: "active", // or "blocked"
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

## Lưu ý quan trọng

1. **Bảo mật**: Trong production, cần:
   - Hash mật khẩu bằng bcrypt
   - Sử dụng HTTPS
   - Implement JWT token
   - Rate limiting cho API

2. **Database**: Hiện tại dùng localStorage để demo. Trong production cần:
   - Sử dụng database thực (MySQL, PostgreSQL, MongoDB)
   - Backup định kỳ
   - Implement caching

3. **Webhook**: 
   - Đảm bảo webhook URL hợp lệ
   - Test webhook trước khi sử dụng
   - Monitor webhook errors

4. **Performance**:
   - Limit số lượng nick cho mỗi user
   - Pagination cho danh sách user
   - Lazy loading cho dữ liệu lớn

## API Reference (cho developer)

### AuthAPI Methods

```javascript
// Initialize
const authAPI = new AuthAPI();

// Authenticate user
authAPI.authenticate(username, password);
// Returns: { success: boolean, user?: UserObject }

// Get all users
authAPI.getAllUsers();
// Returns: UserObject[]

// Create user
authAPI.createUser(userData);
// Returns: { success: boolean, user?: UserObject }

// Update user
authAPI.updateUser(userId, userData);
// Returns: { success: boolean, user?: UserObject }

// Delete user
authAPI.deleteUser(userId);
// Returns: { success: boolean }

// Get statistics
authAPI.getUserStats();
// Returns: { total: number, active: number, blocked: number }
```

## Troubleshooting

### Không thể đăng nhập
- Kiểm tra username/password
- Kiểm tra status tài khoản (active/blocked)
- Clear cache/localStorage nếu cần

### Webhook không hoạt động
- Kiểm tra URL webhook
- Kiểm tra network/firewall
- Xem console log để debug

### Mất dữ liệu
- Dữ liệu lưu trong localStorage
- Export/Import định kỳ
- Không clear browser data

## Support

Liên hệ developer nếu cần hỗ trợ thêm. 