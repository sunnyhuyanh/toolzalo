# 🔧 Hướng dẫn Setup Supabase Storage - Fix Triệt để

## 🔴 Vấn đề hiện tại

```
❌ Images bucket NOT found!
❌ Upload failed: signature verification failed (403 Forbidden)
```

**Nguyên nhân:** Storage API chưa được setup đúng trong Supabase project.

---

## ✅ Giải pháp HOÀN CHỈNH

### Bước 1: Enable Storage trong Supabase ⭐ QUAN TRỌNG

1. **Login vào Supabase Dashboard:**
   - Truy cập: https://supabase.com/dashboard
   - Login với account của bạn

2. **Chọn project:**
   - Project URL: `https://lbnhswcnwckdyrqnoply.supabase.co`
   - Chọn project này trong dashboard

3. **Vào Storage:**
   - Click menu bên trái: **Storage**
   - Nếu chưa enable, click **"Enable Storage"**
   - Đợi vài giây để Storage được khởi tạo

### Bước 2: Tạo Bucket "images"

Trong Supabase Dashboard → Storage:

1. **Click "New Bucket"** (hoặc "Create bucket")

2. **Cấu hình bucket:**
   ```
   Name: images
   Public bucket: ✅ YES (check this box)
   File size limit: 50 MB
   Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
   ```

3. **Click "Create bucket"**

4. **Cấu hình Policies:**
   - Click vào bucket "images" 
   - Tab "Policies"
   - Click "New Policy"
   
   **Policy 1: Allow Public Upload**
   ```
   Policy name: Allow public uploads
   Allowed operation: INSERT
   Policy definition: true
   ```
   
   **Policy 2: Allow Public Read**
   ```
   Policy name: Allow public reads  
   Allowed operation: SELECT
   Policy definition: true
   ```
   
   **Hoặc đơn giản hơn:** Click "Use RLS template" → "Allow public access"

### Bước 3: Verify và Update API Keys

1. **Vào Settings → API:**
   - URL: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/api
   
2. **Copy keys:**
   ```
   Project URL: https://lbnhswcnwckdyrqnoply.supabase.co
   anon/public key: eyJhbGc... (copy toàn bộ)
   service_role key: eyJhbGc... (copy toàn bộ - BẢO MẬT!)
   ```

3. **Update config.js:**
   ```javascript
   const CONFIG = {
     supabase: {
       url: 'https://lbnhswcnwckdyrqnoply.supabase.co',
       anonKey: 'PASTE_ANON_KEY_MỚI',
       serviceRoleKey: 'PASTE_SERVICE_ROLE_KEY_MỚI'
     }
   };
   ```

### Bước 4: Test lại

1. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   npm start
   ```

2. **Run test script:**
   ```bash
   node test-bucket.js
   ```

3. **Expected output:**
   ```
   ✅ ALL TESTS PASSED!
      - Bucket exists and is public
      - Upload works correctly
      - Ready to use in app
   ```

---

## 🎯 Alternative: Tạo Bucket qua SQL (nếu Dashboard không work)

Nếu không thể tạo qua Dashboard, dùng SQL:

```sql
-- 1. Tạo bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- 2. Tạo policies
CREATE POLICY "Allow all operations on images"
ON storage.objects FOR ALL
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');
```

**Chạy SQL này ở đâu?**
- Dashboard → SQL Editor
- Hoặc dùng migration: `node run-migration.js`

---

## 🔍 Debug Checklist

### ❓ Storage có enabled không?
- [ ] Vào Dashboard → Storage
- [ ] Có thấy Storage menu không?
- [ ] Có hiện "Enable Storage" button không?
- [ ] Nếu có → Click để enable

### ❓ Bucket có tồn tại không?
- [ ] Dashboard → Storage → Buckets
- [ ] Có thấy bucket "images" không?
- [ ] Bucket có màu xanh (public) không?

### ❓ Policies có đúng không?
- [ ] Click vào bucket "images"
- [ ] Tab "Policies"
- [ ] Có ít nhất 1 policy cho INSERT và SELECT?
- [ ] Policy có "WITH CHECK (true)" hoặc permissive?

### ❓ Keys có đúng không?
- [ ] Dashboard → Settings → API
- [ ] Copy lại anon key và service_role key
- [ ] Paste vào config.js
- [ ] Restart server

---

## 🚨 Common Errors & Solutions

### Error: "signature verification failed"
**Nguyên nhân:** Service role key không đúng hoặc expired  
**Fix:**
1. Vào Dashboard → Settings → API
2. Copy service_role key MỚI
3. Update config.js
4. Restart server

### Error: "Bucket not found"
**Nguyên nhân:** Bucket chưa được tạo  
**Fix:**
1. Dashboard → Storage → New Bucket
2. Name: "images", Public: YES
3. Create bucket

### Error: "403 Forbidden"
**Nguyên nhân:** Policies chặn upload  
**Fix:**
1. Dashboard → Storage → images bucket → Policies
2. Add policy: "Allow all operations"
3. Definition: true

### Error: "Storage not enabled"
**Nguyên nhân:** Storage API chưa được khởi tạo  
**Fix:**
1. Dashboard → Storage
2. Click "Enable Storage"
3. Đợi khởi tạo xong

---

## 📋 Setup Checklist

Làm theo thứ tự:

1. [ ] Enable Storage trong Supabase Dashboard
2. [ ] Tạo bucket "images" (public = true)
3. [ ] Add policies cho bucket (INSERT + SELECT)
4. [ ] Verify keys trong Settings → API
5. [ ] Update config.js với keys mới
6. [ ] Restart server
7. [ ] Run `node test-bucket.js`
8. [ ] Verify ✅ ALL TESTS PASSED

---

## 🎬 Video Tutorial (Alternative)

Nếu không chắc làm sao, follow video này:
https://supabase.com/docs/guides/storage/quickstart

Hoặc tham khảo docs:
https://supabase.com/docs/guides/storage

---

## 💡 Quick Fix Script

Tôi đã tạo sẵn script để test. Chạy script này sau mỗi bước:

```bash
node test-bucket.js
```

**Kết quả mong đợi:**
```
✅ Found buckets:
  - images (public: true)
✅ Images bucket exists
✅ Upload successful!
✅ ALL TESTS PASSED!
```

---

## 🌟 Summary

**Vấn đề:** Storage chưa setup, bucket không tồn tại  
**Giải pháp:** Enable Storage + Tạo bucket qua Dashboard  
**Action:** Follow Bước 1-4 ở trên  
**Test:** Run `node test-bucket.js`  

**Ưu tiên:** ⭐⭐⭐⭐⭐ CRITICAL - Cần fix trước khi dùng upload

---

**Last Updated:** 2025-10-17  
**Status:** ⏳ Waiting for Storage setup in Dashboard

