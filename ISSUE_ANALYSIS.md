# 🔍 Phân tích Vấn đề HTTP 500 - Webhook Scan Group

## 📋 Tóm tắt vấn đề

**User:** linhnd  
**Chức năng:** Quét nhóm (Feature 2 - Đăng bài)  
**Lỗi:** HTTP 500: Internal Server Error  
**Webhook:** https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group

---

## 🔎 Nguyên nhân đã xác định

### 1. **Webhook Configuration** ✅ CHÍNH XÁC
```
Database: https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group
Status: Đã cấu hình đúng
```

### 2. **Frontend Code** ❌ VẤN ĐỀ ĐÃ FIX
**Vấn đề:**
- Webhooks chỉ được load 1 lần khi page load
- Không refresh từ database khi admin thay đổi
- Không có validation trước khi gọi webhook

**Đã sửa:**
- ✅ Thêm function `refreshUserData()` để sync với database
- ✅ Thêm function `getCurrentWebhooks()` để load webhooks động
- ✅ Thêm validation trước mỗi webhook call
- ✅ Thêm logging chi tiết

### 3. **HTTP 500 Error** ⚠️ CẦN KIỂM TRA
HTTP 500 = Internal Server Error từ n8n webhook endpoint

**Có thể nguyên nhân:**

#### A. n8n Workflow Error
- Workflow có logic error
- Missing dependencies hoặc credentials
- Timeout trong workflow execution
- Node configuration sai

#### B. Nick Authentication
- Nick "LINH ND" chưa login Zalo
- Session expired
- Zalo account bị lock

#### C. n8n Server Issues
- Server overload
- Memory/CPU issues
- Database connection error trong workflow

---

## ✅ Giải pháp đã implement

### 1. Dynamic Webhook Refresh
```javascript
// Trước mỗi action, refresh webhooks từ database
const refreshResult = await refreshUserData();

// Lấy webhook mới nhất
webhooks = getCurrentWebhooks();
const currentScanWebhook = webhooks.scanWebhook;
```

### 2. Webhook Validation
```javascript
// Kiểm tra webhook tồn tại
if (!currentScanWebhook || currentScanWebhook === '') {
  throw new Error('WEBHOOK_NOT_CONFIGURED: Scan webhook is not configured');
}
```

### 3. Enhanced Logging
```javascript
console.log('🔄 Refreshing user data from database...');
console.log('Starting group scan with webhook:', currentScanWebhook);
console.log('Nick selected:', nick);
```

### 4. Applied to All Features
- ✅ Feature 1: Scan groups + Send messages
- ✅ Feature 2: Scan groups + Post to groups
- ✅ Feature 3: Scan groups + Scan members + Invite members

---

## 🧪 Testing Steps

### Bước 1: Verify Database Config ✅ DONE
```sql
SELECT scan_webhook FROM users WHERE username = 'linhnd';
-- Result: https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group
```

### Bước 2: Test Webhook Endpoint ⏳ CẦN TEST
```bash
curl -X POST https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group \
  -H "Content-Type: application/json" \
  -d '{"nick": "LINH ND"}'
```

**Expected responses:**
- ✅ HTTP 200: Webhook hoạt động bình thường
- ❌ HTTP 500: n8n workflow có lỗi
- ❌ HTTP 404: Webhook không tồn tại
- ❌ Timeout: n8n server không phản hồi

### Bước 3: Check n8n Workflow ⏳ CẦN KIỂM TRA
1. Login vào n8n: https://n8nhosting-60996536.phoai.vn
2. Tìm workflow cho webhook: `/webhook/linh-nd-scan-group`
3. Kiểm tra:
   - Workflow có đang active không?
   - Webhook path có đúng không?
   - Có error trong execution history không?
   - Credentials (Zalo API) có còn valid không?

### Bước 4: Test Frontend ⏳ CẦN TEST
1. Đăng nhập với user "linhnd"
2. Chọn nick "LINH ND"
3. Click "Quét nhóm"
4. Kiểm tra Console log:
   ```
   🔄 Refreshing user data from database...
   Current webhook URLs from localStorage:
   - scanWebhook: /webhook/linh-nd-scan-group
   Starting group scan (feature 2) with webhook: /webhook/linh-nd-scan-group
   Nick selected: LINH ND
   ```

---

## 🎯 Các bước tiếp theo

### Immediate Actions (Cần làm ngay)

1. **Test webhook endpoint trực tiếp:**
   ```bash
   curl -v -X POST https://n8nhosting-60996536.phoai.vn/webhook/linh-nd-scan-group \
     -H "Content-Type: application/json" \
     -d '{"nick": "LINH ND"}'
   ```

2. **Kiểm tra n8n workflow:**
   - Login vào n8n admin panel
   - Check execution history
   - Xem có errors không
   - Verify webhook path

3. **Kiểm tra Nick "LINH ND":**
   - Có login vào Zalo không?
   - Session có còn active không?
   - Có bị rate limit không?

### After Testing

#### Nếu webhook trả về HTTP 200:
✅ Frontend fix đã hoạt động  
✅ Có thể sử dụng được

#### Nếu webhook trả về HTTP 500:
❌ Vấn đề ở n8n workflow  
➡️ Cần fix workflow code  
➡️ Check credentials và dependencies

#### Nếu webhook timeout:
❌ n8n server có vấn đề  
➡️ Check server resources  
➡️ Check network connectivity

---

## 📊 So sánh Trước/Sau

### Trước khi fix:
```javascript
// Load webhooks 1 lần
const scanWebhook = processWebhookUrl(currentUser.scanWebhook);

// Gọi trực tiếp
const res = await fetchWithTimeout(scanWebhook, { ... });
```

**Vấn đề:**
- ❌ Webhook cũ, không sync với database
- ❌ Không kiểm tra webhook có tồn tại
- ❌ Khó debug

### Sau khi fix:
```javascript
// Refresh từ database
const refreshResult = await refreshUserData();

// Lấy webhook mới nhất
webhooks = getCurrentWebhooks();
const currentScanWebhook = webhooks.scanWebhook;

// Validate
if (!currentScanWebhook || currentScanWebhook === '') {
  throw new Error('WEBHOOK_NOT_CONFIGURED');
}

// Gọi với webhook mới nhất
const res = await fetchWithTimeout(currentScanWebhook, { ... });
```

**Cải thiện:**
- ✅ Luôn sử dụng webhook mới nhất từ database
- ✅ Validate trước khi gọi
- ✅ Logging chi tiết để debug
- ✅ Error messages rõ ràng

---

## 🔐 Security & Performance

### Security:
- ✅ Webhooks được lưu trong database, không hardcode
- ✅ Chỉ admin có thể thay đổi webhooks
- ✅ User không thấy full webhook URL (proxied qua server)

### Performance:
- ✅ Refresh webhooks nhanh (query đơn giản)
- ✅ Cache trong localStorage giữa các actions
- ✅ Không impact user experience

---

## 📞 Next Steps for User

1. **Logout và Login lại** để đảm bảo localStorage có data mới
2. **Chọn nick "LINH ND"**
3. **Click "Quét nhóm"**
4. **Kiểm tra Console log** (F12 → Console tab)
5. **Nếu vẫn lỗi HTTP 500:**
   - Screenshot console log
   - Check n8n workflow
   - Verify nick đã login Zalo

---

**Status:** ✅ Frontend đã fix, cần test webhook endpoint  
**Priority:** HIGH - ảnh hưởng tất cả chức năng quét nhóm  
**Updated:** 2025-10-17

