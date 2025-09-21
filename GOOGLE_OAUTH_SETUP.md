# Hướng dẫn cấu hình Google OAuth cho Supabase

## 📋 Yêu cầu
Để sử dụng Google OAuth authentication, bạn cần cấu hình:
1. Google Cloud Console (Google Developer Console)
2. Supabase Dashboard

## 🚀 Bước 1: Cấu hình Google Cloud Console

### 1.1. Tạo project trên Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Google+ API cho project

### 1.2. Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: Web application
4. Điền thông tin:
   - **Name**: `Niemadidaphat OAuth Client`
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:3001
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://kftqkbrtnigqbabaasrw.supabase.co/auth/v1/callback
     http://localhost:3001/auth/callback
     https://yourdomain.com/auth/callback
     ```

### 1.3. Lấy Client ID và Client Secret
Sau khi tạo, bạn sẽ nhận được:
- **Client ID**: `xxxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxxxxxx`

## 🔧 Bước 2: Cấu hình Supabase

### 2.1. Truy cập Supabase Dashboard
1. Vào [Supabase Dashboard](https://app.supabase.com/)
2. Chọn project `kftqkbrtnigqbabaasrw`
3. Vào **Authentication** > **Providers**

### 2.2. Cấu hình Google Provider
1. Tìm **Google** trong danh sách providers
2. Bật toggle **Enable sign in with Google**
3. Điền thông tin:
   - **Client ID (for OAuth)**: Paste Client ID từ Google Cloud Console
   - **Client Secret (for OAuth)**: Paste Client Secret từ Google Cloud Console
4. Click **Save**

### 2.3. Callback URL
Supabase sẽ tự động tạo callback URL:
```
https://kftqkbrtnigqbabaasrw.supabase.co/auth/v1/callback
```

## 🗄️ Bước 3: Cập nhật Database Schema

### 3.1. Thêm columns cho OAuth
```sql
-- Thêm columns để lưu thông tin OAuth
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- Tạo index cho provider
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider ON user_profiles(provider);
```

### 3.2. Cập nhật RLS Policies (nếu cần)
```sql
-- Cập nhật policies để handle OAuth users
-- (Policies hiện tại đã hỗ trợ OAuth users)
```

## ⚙️ Bước 4: Environment Variables

Đảm bảo file `.env.local` có các biến sau:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kftqkbrtnigqbabaasrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Bước 5: Test Authentication

### 5.1. Local Testing
1. Chạy development server: `npm run dev`
2. Truy cập: `http://localhost:3001/tai-khoan/dang-ky`
3. Click **"Tiếp tục với Google"**
4. Đăng nhập với Google account
5. Kiểm tra redirect về trang chủ

### 5.2. Production Testing
1. Deploy lên production
2. Cập nhật Authorized origins và redirect URIs trong Google Cloud Console
3. Test tương tự như local

## 🔍 Troubleshooting

### Lỗi thường gặp:

#### 1. "redirect_uri_mismatch"
- **Nguyên nhân**: Redirect URI không khớp
- **Giải pháp**: Kiểm tra lại Authorized redirect URIs trong Google Cloud Console

#### 2. "invalid_client"
- **Nguyên nhân**: Client ID hoặc Client Secret sai
- **Giải pháp**: Kiểm tra lại credentials trong Supabase Dashboard

#### 3. "oauth_error" 
- **Nguyên nhân**: Lỗi trong quá trình OAuth flow
- **Giải pháp**: Kiểm tra logs trong Supabase Dashboard > Logs

#### 4. "session_error"
- **Nguyên nhân**: Không thể tạo session sau OAuth
- **Giải pháp**: Kiểm tra callback handler và database permissions

## 📚 Tài liệu tham khảo

- [Supabase Google OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Best Practices](https://nextjs.org/docs/authentication)

## 🔒 Bảo mật

### Khuyến nghị:
1. **Không commit credentials**: Đảm bảo `.env.local` trong `.gitignore`
2. **Rotate keys định kỳ**: Thay đổi Client Secret mỗi 6 tháng
3. **Giới hạn domains**: Chỉ thêm domains thực sự cần thiết
4. **Monitor usage**: Theo dõi OAuth usage trong Google Cloud Console

### Production checklist:
- [ ] Cập nhật Authorized origins với production domain
- [ ] Cập nhật Redirect URIs với production callback URL
- [ ] Test OAuth flow trên production
- [ ] Verify user data được lưu đúng trong database
- [ ] Test logout functionality

## ✅ Kết quả

Sau khi hoàn thành setup:
- ✅ Users có thể đăng nhập bằng Google account
- ✅ Thông tin user được sync từ Google (tên, email, avatar)
- ✅ User profiles được tự động tạo trong database
- ✅ Session management hoạt động đúng
- ✅ OAuth flow redirect về trang chủ sau khi đăng nhập thành công
