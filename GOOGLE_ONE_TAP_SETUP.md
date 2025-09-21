# Google One-Tap Setup Guide

## Cấu hình Google One-Tap cho dự án

### 1. Cấu hình Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo hoặc chọn project của bạn
3. Bật Google+ API hoặc Google Sign-In API
4. Tạo OAuth 2.0 Client ID:
   - Loại ứng dụng: Web application
   - Authorized JavaScript origins: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`

### 2. Environment Variables

Thêm vào file `.env.local`:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Supabase Authentication Setup

1. Trong Supabase Dashboard, vào **Authentication > Providers**
2. Bật **Google** provider
3. Nhập:
   - **Client ID**: Từ Google Cloud Console
   - **Client Secret**: Từ Google Cloud Console
4. Đảm bảo **Redirect URL** là: `https://your-project.supabase.co/auth/v1/callback`

### 4. Cách hoạt động

#### Google One-Tap Flow:
1. **Tự động hiển thị**: One-Tap UI tự động xuất hiện khi user chưa đăng nhập
2. **ID Token**: Google trả về ID token thay vì authorization code
3. **Supabase Integration**: Sử dụng `signInWithIdToken()` thay vì `signInWithOAuth()`
4. **Session Management**: Session được tự động lưu trong localStorage

#### Ưu điểm so với OAuth flow:
- ✅ Không cần redirect callback route phức tạp
- ✅ Trải nghiệm người dùng mượt mà hơn
- ✅ Ít lỗi session hơn
- ✅ Tự động detect existing Google sessions
- ✅ Hỗ trợ FedCM (Chrome's new standard)

### 5. Components đã được cập nhật

#### `GoogleOneTap.tsx`
- Tự động khởi tạo Google One-Tap UI
- Xử lý ID token và gửi đến Supabase
- Error handling và success callbacks

#### `AuthStatus.tsx`
- Sử dụng GoogleOneTap component
- Fallback đến đăng nhập thủ công
- Tự động refresh auth state sau khi đăng nhập

### 6. Debugging

Kiểm tra console logs để debug:
- "Khởi tạo Google One Tap"
- "Nonce được tạo"
- "Nhận được response từ Google One Tap"
- "Đăng nhập thành công với Google One Tap"

### 7. Fallback Options

Nếu Google One-Tap không hoạt động:
- User có thể click "Đăng nhập thủ công"
- Chuyển đến trang `/tai-khoan/dang-nhap`
- Có thể implement các provider khác (Facebook, GitHub, etc.)

### 8. Security Features

- **Nonce validation**: Mỗi request có nonce unique
- **FedCM support**: Chrome's new privacy-focused authentication
- **HTTPS required**: One-Tap chỉ hoạt động trên HTTPS (production)
- **Domain validation**: Google kiểm tra authorized domains

### 9. Testing

#### Development:
```bash
npm run dev
# Truy cập http://localhost:3000
# One-Tap sẽ xuất hiện tự động
```

#### Production:
- Đảm bảo domain được thêm vào Google Cloud Console
- HTTPS là bắt buộc
- Test trên nhiều browsers khác nhau
