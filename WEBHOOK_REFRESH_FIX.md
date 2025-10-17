# 🔧 Webhook Refresh & Validation Fix

## Vấn đề đã được giải quyết

### Vấn đề ban đầu:
1. **Webhooks không được cập nhật**: Khi admin thay đổi webhook URLs trong database, user phải đăng xuất và đăng nhập lại
2. **Không có validation**: Tool không kiểm tra xem webhook có tồn tại trước khi gọi
3. **Thiếu logging**: Khó debug khi webhook fail
4. **HTTP 500 errors**: Webhook endpoints trả về lỗi nhưng không có thông tin cụ thể

### Giải pháp đã implement:

## ✅ 1. Dynamic Webhook Loading

### Trước đây:
```javascript
// Webhooks được load 1 lần khi trang load
const scanWebhook = processWebhookUrl(currentUser.scanWebhook);
const sendWebhook = processWebhookUrl(currentUser.sendWebhook);
// ... không bao giờ refresh
```

### Bây giờ:
```javascript
// Function để lấy webhooks mới nhất từ localStorage
function getCurrentWebhooks() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return {
    scanWebhook: processWebhookUrl(currentUser.scanWebhook),
    sendWebhook: processWebhookUrl(currentUser.sendWebhook),
    postWebhook: processWebhookUrl(currentUser.postWebhook),
    inviteWebhook: processWebhookUrl(currentUser.inviteWebhook),
    scanMembersWebhook: processWebhookUrl(currentUser.scanMembersWebhook)
  };
}
```

## ✅ 2. Database Refresh Function

### Function mới:
```javascript
async function refreshUserData() {
  // Lấy user hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Skip nếu là admin
  if (!currentUser.username || currentUser.username === 'admin') {
    return { success: true, webhooks: getCurrentWebhooks() };
  }

  // Lấy dữ liệu mới nhất từ database
  const { data: userData, error } = await window.supabaseService.getUserByUsername(currentUser.username);
  
  if (!error && userData) {
    // Cập nhật localStorage với dữ liệu mới
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }
  
  return { success: true, webhooks: getCurrentWebhooks() };
}
```

### Cách sử dụng:
- Function này được gọi **tự động** trước mỗi action (scan, send, post, invite)
- Refresh webhooks từ database mỗi lần thực hiện action
- Không cần đăng xuất/đăng nhập lại

## ✅ 3. Webhook Validation

### Trước khi gọi webhook, tool sẽ kiểm tra:
```javascript
// Validate webhook URL
if (!currentScanWebhook || currentScanWebhook === '') {
  throw new Error('WEBHOOK_NOT_CONFIGURED: Scan webhook is not configured for this user. Please contact admin.');
}
```

### Lợi ích:
- ✅ Phát hiện webhook không tồn tại trước khi gọi
- ✅ Thông báo lỗi rõ ràng cho user
- ✅ Tránh wasting time chờ request fail

## ✅ 4. Enhanced Logging

### Console logs chi tiết:
```javascript
console.log('🔄 Refreshing user data from database...');
console.log('✅ User data refreshed successfully');
console.log('Starting group scan (feature 2) with webhook:', currentScanWebhook);
console.log('Nick selected:', nick);
```

### Logs hiển thị:
- Webhook URL đang được sử dụng
- Nick được chọn
- Trạng thái refresh data
- Errors chi tiết

## 📋 Các thay đổi trong code

### Feature 1 (Gửi tin nhắn):
- ✅ Scan groups: Refresh webhooks + validation
- ✅ Send message: Dynamic webhook loading + validation

### Feature 2 (Đăng bài):
- ✅ Scan groups: Refresh webhooks + validation  
- ✅ Post to groups: Dynamic webhook loading + validation

### Feature 3 (Mời thành viên):
- ✅ Scan groups: Refresh webhooks + validation
- ✅ Scan members: Dynamic webhook loading + validation
- ✅ Invite members: Dynamic webhook loading + validation

## 🔍 Debugging Workflow

Khi webhook fail, kiểm tra theo thứ tự:

### 1. Kiểm tra Console Log
```javascript
// Tìm các dòng log này:
"🔄 Refreshing user data from database..."
"Current webhook URLs from localStorage:"
"Starting group scan with webhook: /webhook/..."
```

### 2. Verify webhook URL trong database
```sql
SELECT username, scan_webhook, send_webhook, post_webhook 
FROM users 
WHERE username = 'your-username';
```

### 3. Kiểm tra webhook endpoint
- Copy webhook URL từ console log
- Test với Postman hoặc curl:
```bash
curl -X POST https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group \
  -H "Content-Type: application/json" \
  -d '{"nick": "LINH ND"}'
```

### 4. Kiểm tra n8n workflow
- Đảm bảo workflow đang active
- Kiểm tra webhook path đúng
- Test workflow manually trong n8n

## 🚀 Cách sử dụng

### Cho User:
1. Đăng nhập bình thường
2. Sử dụng các feature như trước
3. Webhooks sẽ tự động được refresh từ database mỗi lần thực hiện action
4. Nếu có lỗi, check console log để xem webhook URL

### Cho Admin:
1. Cập nhật webhook URLs trong admin panel
2. User **KHÔNG CẦN** đăng xuất và đăng nhập lại
3. Webhook mới sẽ được sử dụng ngay lần action tiếp theo

## ⚠️ Lưu ý

### HTTP 500 Errors
Nếu webhook vẫn trả về HTTP 500, nguyên nhân có thể là:

1. **n8n workflow error**: Check n8n execution logs
2. **Webhook path sai**: Verify trong n8n settings
3. **Workflow chưa active**: Active workflow trong n8n
4. **Nick chưa login Zalo**: User cần login lại trong Zalo
5. **Network issues**: Check connection tới n8n server

### Empty Response
Nếu webhook trả về empty response:
- Nick có thể hết phiên, cần login lại
- Zalo có thể đang block request
- Check n8n workflow có return data không

## 📊 Kết quả

### Trước khi fix:
- ❌ Webhook không được update sau khi admin thay đổi
- ❌ Tool không kiểm tra webhook tồn tại
- ❌ Khó debug khi có lỗi
- ❌ HTTP 500 không có thông tin cụ thể

### Sau khi fix:
- ✅ Webhooks tự động refresh từ database
- ✅ Validation trước khi gọi webhook
- ✅ Logging chi tiết để debug
- ✅ Error messages rõ ràng
- ✅ Không cần logout/login lại

## 🔄 Testing

### Test Case 1: Admin thay đổi webhook
1. Admin cập nhật webhook trong admin panel
2. User ở trang chính, click "Quét nhóm"
3. ✅ Expected: Tool sử dụng webhook mới từ database

### Test Case 2: Webhook không tồn tại
1. Admin xóa webhook URL (để trống)
2. User click "Quét nhóm"
3. ✅ Expected: Hiển thị lỗi "WEBHOOK_NOT_CONFIGURED"

### Test Case 3: Webhook fail HTTP 500
1. n8n workflow bị lỗi
2. User click "Quét nhóm"
3. ✅ Expected: Console log hiển thị webhook URL và error details

---

**Last Updated:** 2025-10-17  
**Status:** ✅ Implemented and Ready for Testing

