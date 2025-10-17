# 🔴 CRITICAL: Server Đang Dùng Config Cũ!

## 🎯 Vấn đề Đã Tìm Ra

**Server hiện tại ĐANG CHẠY và dùng service_role key CŨ!**

```bash
# Check process
lsof -ti:3000
→ 15284 (server đang chạy)
```

**Đây là nguyên nhân gây lỗi "signature verification failed":**
- ✅ Config.js đã update với key mới
- ❌ Server chưa restart → vẫn dùng key cũ trong memory
- ❌ Upload fail vì key không match

---

## ✅ GIẢI PHÁP TRIỆT ĐỂ

### Bước 1: Stop Server Hiện Tại ⭐ QUAN TRỌNG

**Option A: Nếu server chạy trong terminal:**
```bash
# Tìm terminal đang chạy server
# Nhấn Ctrl+C để stop
```

**Option B: Force kill:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Option C: Dùng script tự động:**
```bash
./restart-server.sh
```

### Bước 2: Start Server Mới

```bash
npm start
```

### Bước 3: Verify Config Trong Logs ⭐

Khi server start, PHẢI thấy các logs này:

```
🔧 [CONFIG] Supabase URL: https://lbnhswcnwckdyrqnoply.supabase.co
🔧 [CONFIG] Service key ends with: nuQRrQTiqxSSnQamVr7A  ← PHẢI ĐÚNG CÁI NÀY
✅ Supabase service initialized with updated config
Supabase admin client initialized successfully
```

**Nếu thấy `nuQRrQTiqxSSnQamVr7A` → Config mới đã được load! ✅**

### Bước 4: Test Upload

1. Refresh browser (F5)
2. Login lại nếu cần
3. Thử đăng bài với ảnh
4. Check console logs server để xem chi tiết

**Expected logs khi upload:**
```
✅ [SERVER] Received a request to /api/upload
📁 [SERVER] File info: { originalname: 'test.jpg', ... }
🔍 [SUPABASE] uploadFile called
🔍 [SUPABASE] Initialized: true
🔍 [SUPABASE] Admin client exists: true
📝 [SUPABASE] Uploading file: 1760719538275_test.jpg
✅ [SUPABASE] Upload successful!
✅ [SERVER] Upload successful! URL: https://...
```

---

## 🔍 Debug Nếu Vẫn Lỗi

### Check 1: Verify Config Loaded
```bash
# Stop server
# Start lại và check log đầu tiên
npm start

# Phải thấy:
# 🔧 [CONFIG] Service key ends with: nuQRrQTiqxSSnQamVr7A
```

### Check 2: Test Upload Direct
```bash
# Với server đang chạy
node test-image-upload.js
```
Nếu pass → server OK  
Nếu fail → server config vẫn sai

### Check 3: Check Server Logs Chi Tiết
```
Khi upload từ app:
1. Browser console: POST /api/upload
2. Server terminal: phải thấy đầy đủ logs từ [SERVER] và [SUPABASE]
3. Nếu không thấy logs → server không chạy hoặc wrong port
```

---

## 📋 Checklist Trước Khi Test

- [ ] ✅ Config.js có service key mới (ends with `nuQRrQTiqxSSnQamVr7A`)
- [ ] ✅ Old server đã stopped (kill process 15284)
- [ ] ✅ Start server mới với `npm start`
- [ ] ✅ Verify logs show config mới
- [ ] ✅ Verify logs show "Supabase admin client initialized"
- [ ] ✅ Browser đã refresh (F5)
- [ ] ✅ Test upload

---

## 🎯 Root Cause

```
Old Server (PID 15284)
  ↓
Running with OLD config in memory
  ↓
serviceRoleKey: ...Q-N8Y_L7... (wrong key)
  ↓
Upload to Supabase: signature verification failed ❌
```

```
New Server (after restart)
  ↓
Load NEW config from config.js
  ↓
serviceRoleKey: ...nuQRrQTiqxSSnQamVr7A (correct key)
  ↓
Upload to Supabase: SUCCESS ✅
```

---

## 🚀 Quick Fix Commands

```bash
# 1. Kill old server
lsof -ti:3000 | xargs kill -9

# 2. Start new server
npm start

# 3. In browser
# Press F5 to refresh
# Try upload again

# 4. Verify (optional)
node test-image-upload.js
```

---

## ⚡ Super Quick Fix

```bash
# One command to do everything
./restart-server.sh
```

Sau đó:
1. Check logs có `nuQRrQTiqxSSnQamVr7A` không
2. Refresh browser
3. Test upload

---

## 💡 Tại Sao Phải Restart?

**Node.js cache modules trong memory:**
- `require('./config')` chỉ chạy 1 lần khi server start
- Config được load vào memory
- Thay đổi file → memory vẫn giữ giá trị cũ
- **Phải restart để reload config mới!**

---

## 🎉 Sau Khi Fix

**Upload sẽ work với logs như này:**

```
✅ [SERVER] Received a request to /api/upload
📁 [SERVER] File info: {
  originalname: '513952579_780036567679860_7357169338382751111_n.jpg',
  mimetype: 'image/jpeg',
  size: 245678,
  bufferLength: 245678
}
🔄 [SERVER] Calling supabaseService.uploadFile...
🔍 [SUPABASE] uploadFile called
🔍 [SUPABASE] Initialized: true
🔍 [SUPABASE] Admin client exists: true
📝 [SUPABASE] Uploading file: 1760719600000_513952579_780036567679860_7357169338382751111_n.jpg
📝 [SUPABASE] Buffer size: 245678 bytes
📝 [SUPABASE] Content type: image/jpeg
✅ [SUPABASE] Upload successful! Path: 1760719600000_513952579_780036567679860_7357169338382751111_n.jpg
✅ [SUPABASE] Public URL generated: https://lbnhswcnwckdyrqnoply.supabase.co/storage/v1/object/public/images/...
✅ [SERVER] Upload successful! URL: https://...
```

---

**Status:** 🔴 CRITICAL - Server chưa restart  
**Action:** ⭐ RESTART SERVER NGAY  
**Priority:** 🚨 HIGHEST

**TL;DR:**
1. Kill server: `lsof -ti:3000 | xargs kill -9`
2. Start mới: `npm start`
3. Check log có `nuQRrQTiqxSSnQamVr7A`
4. Test upload → DONE! ✅

