# 🔐 Session Expiry Detection & Enhanced Error Handling

## ✅ Đã implement

### 1. **Enhanced Error Handler** (`handleWebhookError`)

Phát hiện tự động các tình huống lỗi và session expiry:

#### Các loại lỗi được phát hiện:

| Loại lỗi | Dấu hiệu | Session Expired? | Hành động |
|-----------|----------|------------------|-----------|
| **Timeout** | `AbortError` sau 2.5 phút | ✅ CÓ | Yêu cầu đăng nhập lại |
| **Network Error** | `Failed to fetch`, `NetworkError` | ❌ Không | Kiểm tra kết nối |
| **Unauthorized** | HTTP 401 | ✅ CÓ | Yêu cầu đăng nhập lại |
| **Server Error** | HTTP 500, 502, 503 | ❌ Không | Thử lại sau |
| **Invalid Response** | JSON parse error | ⚠️ Có thể | Kiểm tra webhook config |

### 2. **Session Expiry Detection Logic**

```javascript
function handleWebhookError(error, context, nick) {
  if (error.name === 'AbortError') {
    // Timeout > 2.5 phút → Rất có thể session hết hạn
    isSessionExpired = true;
  }
  
  if (error.message.includes('status 401')) {
    // Unauthorized → Chắc chắn session hết hạn
    isSessionExpired = true;
  }
  
  // ... more detection logic
}
```

### 3. **Error Logging System**

Tất cả lỗi được log vào `localStorage` để troubleshooting:

```javascript
{
  context: 'scan_groups_feature1',
  nick: 'LINH ND',
  errorType: 'timeout',
  isSessionExpired: true,
  timestamp: '2024-01-17T10:30:00.000Z',
  errorMessage: 'AbortError: ...'
}
```

**Xem logs:**
```javascript
// Trong browser console
JSON.parse(localStorage.getItem('errorLogs'))
```

### 4. **Enhanced UI Error Display**

#### Lỗi thường:
```
❌ Lỗi không xác định
[Chi tiết lỗi]
```

#### Session expiry:
```
⏱️ Hết thời gian chờ phản hồi từ Zalo

Có thể do:
• Phiên đăng nhập của nick "LINH ND" đã hết hạn
• Kết nối mạng chậm hoặc webhook backend bị quá tải
• Zalo đang bảo trì

💡 Hướng dẫn đăng nhập lại:
1. Mở ứng dụng Zalo trên thiết bị
2. Chọn nick cần đăng nhập lại
3. Đăng nhập với tài khoản và mật khẩu
4. Quay lại đây và thử lại
```

### 5. **Timeout Configuration**

| Feature | Timeout | Lý do |
|---------|---------|-------|
| Quét nhóm | 150s (2.5 phút) | Zalo API có thể chậm với nhiều nhóm |
| Gửi tin nhắn | 60s (1 phút) | Thường nhanh hơn |
| Đăng bài | 60s mỗi request | Multiple requests nên timeout ngắn hơn |
| Mời thành viên | 60s mỗi invite | Individual invite nên nhanh |

## 🧪 Testing Scenarios

### Test 1: Session đã hết hạn (Timeout)
```
1. Đăng nhập Zalo
2. Đợi session timeout (hoặc logout)
3. Trong app, click "Quét nhóm"
4. Đợi > 2.5 phút
5. ✅ Kỳ vọng: Hiển thị cảnh báo session expiry với hướng dẫn
```

### Test 2: Webhook offline
```
1. Tắt n8n workflow hoặc webhook endpoint
2. Click "Quét nhóm"
3. ✅ Kỳ vọng: "Lỗi kết nối mạng" - không hiển thị session expiry
```

### Test 3: Session hợp lệ, quét thành công
```
1. Đăng nhập Zalo (session mới)
2. Click "Quét nhóm"
3. ✅ Kỳ vọng: Danh sách nhóm hiển thị bình thường
```

### Test 4: Invalid response từ webhook
```
1. Webhook trả về non-JSON hoặc invalid data
2. ✅ Kỳ vọng: "Dữ liệu phản hồi không hợp lệ"
```

## 📊 Monitoring & Analytics

### View Error Statistics
```javascript
// Browser console
const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');

// Count by error type
const stats = logs.reduce((acc, log) => {
  acc[log.errorType] = (acc[log.errorType] || 0) + 1;
  return acc;
}, {});

console.table(stats);

// Session expiry rate
const total = logs.length;
const expired = logs.filter(l => l.isSessionExpired).length;
console.log(`Session expiry rate: ${(expired/total*100).toFixed(1)}%`);
```

### Clear old logs
```javascript
localStorage.removeItem('errorLogs');
```

## 🔄 Retry Logic (Future Enhancement)

Hiện tại chưa có auto-retry. Khuyến nghị implement:

```javascript
async function retryWithExponentialBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const { isSessionExpired } = handleWebhookError(error, 'retry', 'unknown');
      
      if (isSessionExpired) {
        // Don't retry if session expired
        throw error;
      }
      
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## ⚡ Performance Impact

### Memory Usage
- Error logs: ~50 entries × ~200 bytes = ~10KB
- Cache data: Tùy số nhóm, thường < 100KB
- **Total overhead**: < 150KB (negligible)

### Network
- No additional network calls
- Error logging is local only

## 🔐 Security Considerations

### Data Logged
- ❌ Không log passwords
- ❌ Không log sensitive user data
- ✅ Chỉ log: error types, timestamps, nick names (public info)

### localStorage Security
- Error logs không chứa thông tin nhạy cảm
- Có thể clear bất kỳ lúc nào
- Tự động limit 50 entries

## 📝 Implementation Status

### Feature 1: Gửi tin nhắn
- ✅ Quét nhóm: Enhanced error handling
- ⏳ Gửi tin nhắn: TODO
- ⏳ Upload ảnh: TODO

### Feature 2: Đăng bài
- ⏳ Quét nhóm: TODO
- ⏳ Đăng bài: TODO
- ⏳ Upload ảnh: TODO

### Feature 3: Mời thành viên
- ⏳ Quét nhóm: TODO
- ⏳ Quét members: TODO
- ⏳ Mời members: TODO

## 🚀 Rollout Plan

### Phase 1: Core Features (Current)
- ✅ Enhanced error handler
- ✅ Session expiry detection logic
- ✅ Error logging
- ✅ Enhanced UI overlay
- ✅ Feature 1 integration

### Phase 2: Complete Integration (Next)
- [ ] Feature 2: Đăng bài
- [ ] Feature 3: Mời thành viên
- [ ] All webhook calls updated
- [ ] Test all scenarios

### Phase 3: Advanced (Future)
- [ ] Auto-retry logic
- [ ] Error analytics dashboard
- [ ] Push notifications on critical errors
- [ ] Backend health monitoring

## 💡 User Guidelines

### Khi nào cần đăng nhập lại?

#### Dấu hiệu session hết hạn:
1. ⏱️ **Timeout > 2.5 phút** khi quét nhóm
2. 🔒 **Lỗi "Unauthorized"** từ Zalo API
3. ⚠️ **Nhiều lỗi liên tiếp** với cùng nick
4. 📄 **Invalid response** từ webhook (đôi khi)

#### Cách đăng nhập lại:
1. Mở ứng dụng Zalo
2. Chọn nick bị lỗi
3. Logout và login lại
4. Đảm bảo session mới
5. Quay lại app và thử lại

### Khi nào KHÔNG phải do session expiry?

- 🌐 **Network error**: Kiểm tra internet/VPN/firewall
- 🖥️ **Server error (500/502/503)**: Backend đang bảo trì
- ⚠️ **Webhook configuration error**: Liên hệ admin

---

**Last Updated:** 2024-10-17
**Status:** Phase 1 Complete ✅

