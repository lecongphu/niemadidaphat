# 🎯 Tích hợp JWT Template "HoPhap" vào Clerk

## ✅ Đã cập nhật code

Project của bạn đã được cập nhật để sử dụng JWT template tên **"HoPhap"**:

### 📁 Files đã sửa:

1. **`frontend/src/providers/AuthProvider.tsx`**
   - Đổi từ `getToken()` → `getToken({ template: 'HoPhap' })`

2. **`frontend/src/lib/axiosInterceptor.ts`**
   - Đổi từ `getToken()` → `getToken({ template: 'HoPhap' })`

---

## 🔧 Cách setup JWT Template "HoPhap" trong Clerk Dashboard

### Bước 1: Tạo JWT Template mới

1. **Vào Clerk Dashboard:**
   - Truy cập: https://dashboard.clerk.com
   - Đăng nhập vào account của bạn

2. **Chọn Application:**
   - Chọn application **"Spotify Clone"** (hoặc app của bạn)

3. **Vào mục JWT Templates:**
   - Sidebar trái → Click vào **"JWT Templates"**
   - Nếu chưa có mục này, vào **"Developers"** → **"JWT Templates"**

4. **Tạo Template mới:**
   - Click nút **"+ New template"** hoặc **"Create template"**
   - Nhập tên template: **`HoPhap`** (quan trọng: viết đúng tên này!)
   - Template type: Chọn **"Blank"**

### Bước 2: Cấu hình Template "HoPhap"

1. **Cấu hình Claims (Thông tin JWT sẽ chứa):**

   Scroll xuống phần **"Claims"**, click **"+ Add claim"** và thêm các claims sau:

   ```json
   {
     "userId": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "firstName": "{{user.first_name}}",
     "lastName": "{{user.last_name}}",
     "imageUrl": "{{user.image_url}}",
     "username": "{{user.username}}",
     "metadata": {
       "role": "{{user.public_metadata.role}}"
     }
   }
   ```

   Hoặc import claims từ JSON:

   ```
   Click "Import from JSON" và paste:
   ```

   ```json
   {
     "userId": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "firstName": "{{user.first_name}}",
     "lastName": "{{user.last_name}}",
     "imageUrl": "{{user.image_url}}",
     "username": "{{user.username}}"
   }
   ```

2. **⚠️ Cấu hình Token Lifetime (QUAN TRỌNG!):**

   - Tìm section **"Token lifetime"** hoặc **"Expiration"**
   - Set **"Session token lifetime"** thành:
     ```
     3600 seconds (1 giờ) - Khuyến nghị cho production
     ```
     HOẶC
     ```
     86400 seconds (24 giờ) - Cho development
     ```

   📝 **Lưu ý:**
   - Không để mặc định 60 giây!
   - Đây là thời gian token có hiệu lực

3. **Cấu hình Issuer & Audience (Tùy chọn):**

   ```
   Issuer: https://[YOUR-CLERK-INSTANCE].clerk.accounts.dev
   Audience: Spotify Clone API
   ```

4. **Save template:**
   - Click **"Save"** hoặc **"Create template"**

### Bước 3: Apply Template "HoPhap" vào API Keys

1. **Vào API Keys:**
   - Sidebar → **"API Keys"**

2. **Chọn API Key để apply:**
   - Bạn sẽ thấy **Production Keys** và **Test Keys**
   - Click vào **"..."** (3 dots) hoặc **"Advanced settings"**

3. **Chọn JWT Template:**
   - Trong section **"JWT Template"** hoặc **"Token settings"**
   - Dropdown template → Chọn **"HoPhap"**
   - Save changes

4. **Repeat cho cả Test và Production:**
   - Nếu bạn có cả test và production keys
   - Áp dụng template cho cả 2

---

## 🧪 Test Template "HoPhap"

### Test 1: Kiểm tra token có dùng template không

1. **Mở ứng dụng:**
   - Login vào app
   - Mở DevTools (F12) → Console

2. **Chạy code sau trong Console:**
   ```javascript
   // Lấy token
   const token = localStorage.getItem('__clerk_db_jwt_HoPhap');
   
   if (token) {
     // Decode JWT
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Token payload:', payload);
     console.log('Template:', payload.iss);
     console.log('Expires in:', new Date(payload.exp * 1000));
   } else {
     console.log('Token not found, chưa login hoặc template chưa apply');
   }
   ```

### Test 2: Kiểm tra API request có token không

1. **Mở DevTools → Network tab**
2. **Thực hiện action gọi API** (ví dụ: load danh sách bài hát)
3. **Click vào request** → Tab "Headers"
4. **Tìm dòng `Authorization: Bearer ...`**
5. **Decode JWT** (copy token vào https://jwt.io)
6. **Kiểm tra:**
   - Claims có đầy đủ thông tin không?
   - Expiry time có đúng không?

### Test 3: Kiểm tra token expiry

1. **Chạy trong Console:**
   ```javascript
   // Function để check token expiry
   async function checkTokenExpiry() {
     // Sử dụng Clerk SDK
     const { getToken } = await import('@clerk/clerk-react');
     const token = await getToken({ template: 'HoPhap' });
     
     if (!token) {
       console.log('❌ No token found');
       return;
     }
     
     const payload = JSON.parse(atob(token.split('.')[1]));
     const now = Math.floor(Date.now() / 1000);
     const expiresIn = payload.exp - now;
     
     console.log('✅ Token is valid');
     console.log('Expires in seconds:', expiresIn);
     console.log('Expires in minutes:', Math.floor(expiresIn / 60));
     console.log('Expires in hours:', Math.floor(expiresIn / 3600));
     console.log('Expires at:', new Date(payload.exp * 1000));
   }
   
   checkTokenExpiry();
   ```

**Kết quả mong muốn:**
```
✅ Token is valid
Expires in seconds: 3600
Expires in minutes: 60
Expires in hours: 1
Expires at: [sau 1 giờ nữa]
```

---

## 🚨 Troubleshooting

### Lỗi 1: Token vẫn expire sau 60s

**Nguyên nhân:** Template "HoPhap" chưa được apply vào API Keys

**Giải pháp:**
1. Vào Clerk Dashboard → API Keys
2. Click vào API Key bạn đang dùng
3. Tìm section "JWT Template" → Chọn "HoPhap"
4. Save
5. Test lại

### Lỗi 2: "Invalid JWT template name"

**Nguyên nhân:** Tên template sai hoặc chưa tồn tại

**Giải pháp:**
1. Vào JWT Templates trong Clerk Dashboard
2. Kiểm tra template tên chính xác là **"HoPhap"** (case-sensitive!)
3. Nếu tên khác, đổi code từ `'HoPhap'` → tên template thực tế của bạn

### Lỗi 3: Claims không đầy đủ

**Nguyên nhân:** Claims trong template chưa config đúng

**Giải pháp:**
1. Vào JWT Templates → "HoPhap"
2. Kiểm tra claims có đầy đủ không
3. Thêm các claims cần thiết:
   ```json
   {
     "userId": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "firstName": "{{user.first_name}}",
     "lastName": "{{user.last_name}}",
     "imageUrl": "{{user.image_url}}"
   }
   ```

### Lỗi 4: 401 Unauthorized liên tục

**Nguyên nhân:** Backend không nhận diện được template

**Giải pháp:**
1. Kiểm tra backend có dùng `clerkMiddleware()` không
2. Đảm bảo backend có `.env` với Clerk keys đúng

---

## 📊 So sánh Template

| Template | Lifetime | Use Case |
|----------|----------|----------|
| **default** | 60s (mặc định) | ❌ Không khuyến nghị |
| **HoPhap** | 3600s (1h) | ✅ Production |
| **HoPhap** | 86400s (24h) | ✅ Development |

---

## ✅ Checklist Setup Hoàn Thành

- [ ] Tạo JWT Template tên "HoPhap" trong Clerk Dashboard
- [ ] Thêm claims đầy đủ vào template
- [ ] Set Token Lifetime >= 3600s
- [ ] Apply template "HoPhap" vào API Keys
- [ ] Test token không expire sau 60s
- [ ] Test API requests có Authorization header đúng
- [ ] Commit & push code lên GitHub
- [ ] Deploy và test trên production

---

## 📝 Ghi chú

1. **Tên template** phải khớp chính xác: **"HoPhap"** (case-sensitive)
2. **Token lifetime** 3600s (1h) là mặc định khuyến nghị cho production
3. **Không cần** thay đổi backend code (đã tự động accept mọi template)
4. Nếu muốn đổi tên template, đổi cả 2 chỗ trong code:
   - `frontend/src/providers/AuthProvider.tsx`
   - `frontend/src/lib/axiosInterceptor.ts`

---

## 🎯 Tóm tắt

Sau khi hoàn thành:

✅ **Frontend code đã được update** để dùng template "HoPhap"
✅ **Backend sẽ tự động accept** template này
✅ **Token sẽ có lifetime >= 1 giờ** (không còn 60 giây)
✅ **Claims đầy đủ** user information
✅ **Auto refresh** khi token hết hạn

**Bây giờ bạn chỉ cần:**
1. Tạo template "HoPhap" trong Clerk Dashboard
2. Set lifetime >= 3600s
3. Apply template vào API Keys
4. Commit & push code lên GitHub
5. Test xem có hoạt động không!

Chúc bạn setup thành công! 🚀

