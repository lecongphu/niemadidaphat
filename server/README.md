# NiemADiDaPhat Backend Server

Backend Node.js/Express server cho ứng dụng NiemADiDaPhat.

## Cài đặt

```bash
cd server
npm install
```

## Cấu hình

1. Copy file `.env.example` thành `.env`
2. Điền các giá trị environment variables:
   - Supabase credentials
   - Cloudflare R2 credentials
   - Client URL

## Chạy server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Chapters
- `GET /api/chapters` - Lấy danh sách chapters
- `POST /api/chapters` - Tạo chapter mới

### Products
- `GET /api/products` - Lấy danh sách products
- `POST /api/products` - Tạo product mới

### Feedback
- `GET /api/feedback` - Lấy danh sách feedback
- `POST /api/feedback` - Gửi feedback
- `PUT /api/feedback` - Cập nhật feedback
- `DELETE /api/feedback` - Xóa feedback

### Follow
- `GET /api/follow` - Kiểm tra follow status
- `POST /api/follow` - Follow product
- `DELETE /api/follow` - Unfollow product

### Users
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới

### Roles
- `GET /api/roles` - Lấy danh sách roles

### Upload
- `POST /api/upload/r2` - Upload file lên R2

### Auth
- `GET /api/auth/callback` - OAuth callback

## Environment Variables

Xem file `.env.example` để biết danh sách đầy đủ các biến môi trường cần thiết.

## Port

Server mặc định chạy tại port `5000`. Có thể thay đổi bằng cách set biến `PORT` trong file `.env`.
