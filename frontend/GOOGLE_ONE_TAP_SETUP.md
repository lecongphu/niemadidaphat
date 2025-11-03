# Hướng dẫn cấu hình Google One-Tap

## Tổng quan
Google One-Tap cho phép người dùng đăng nhập nhanh chóng với tài khoản Google của họ mà không cần nhấp vào nút đăng nhập.

## Các bước cấu hình

### 1. Tạo Google OAuth Client ID

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn hoặc tạo một project mới
3. Vào **APIs & Services** > **Credentials**
4. Nhấp **Create Credentials** > **OAuth 2.0 Client ID**
5. Chọn **Application type**: **Web application**
6. Thêm **Authorized JavaScript origins**:
   - Cho development: `http://localhost:5173`
   - Cho production: `https://yourdomain.com`
7. Thêm **Authorized redirect URIs** (nếu cần):
   - `http://localhost:5173/auth-callback`
   - `https://yourdomain.com/auth-callback`
8. Nhấp **Create** và sao chép **Client ID**

### 2. Cấu hình Clerk

1. Truy cập [Clerk Dashboard](https://dashboard.clerk.com/)
2. Chọn application của bạn
3. Vào **User & Authentication** > **Social Connections**
4. Bật **Google** và nhập:
   - Client ID (từ Google Cloud Console)
   - Client Secret (từ Google Cloud Console)
5. Đảm bảo redirect URL trong Clerk khớp với Google OAuth settings

### 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `frontend/` với nội dung:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
```

### 4. Cách hoạt động

- Component `GoogleOneTap` sẽ tự động hiển thị One-Tap prompt khi:
  - Người dùng chưa đăng nhập
  - Người dùng đã từng đăng nhập bằng Google trước đó
  - Trình duyệt hỗ trợ Google One-Tap

- Nếu One-Tap không hiển thị hoặc bị hủy, người dùng vẫn có thể sử dụng nút "Đăng nhập với Google" thông thường

### 5. Kiểm tra

1. Chạy ứng dụng: `npm run dev`
2. Mở trình duyệt ở chế độ ẩn danh
3. Truy cập trang chủ
4. One-Tap prompt sẽ xuất hiện ở góc trên bên phải (nếu đã cấu hình đúng)

## Lưu ý

- Google One-Tap chỉ hoạt động trên HTTPS hoặc localhost
- One-Tap có thể không hiển thị nếu người dùng đã từ chối nhiều lần
- Đảm bảo domain của bạn được thêm vào Authorized JavaScript origins trong Google Cloud Console

## Khắc phục sự cố

### One-Tap không hiển thị

1. Kiểm tra Console log để xem thông báo lỗi
2. Đảm bảo `VITE_GOOGLE_CLIENT_ID` đã được cấu hình đúng
3. Kiểm tra domain có trong danh sách Authorized JavaScript origins
4. Thử xóa cookies và cache của trình duyệt

### Lỗi "Invalid Client ID"

- Kiểm tra lại Client ID trong `.env.local`
- Đảm bảo Client ID từ Google Cloud Console chính xác

### Lỗi redirect

- Kiểm tra Clerk OAuth settings
- Đảm bảo redirect URLs khớp giữa Google Cloud Console và Clerk Dashboard

## Tài liệu tham khảo

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/oauth)
