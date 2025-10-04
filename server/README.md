# NiemADiDaPhat Backend Server

Backend Node.js/Express server cho ứng dụng NiemADiDaPhat.

## Cài đặt

```bash
cd server
npm install
```

## Cấu hình

### 1. Cài đặt PostgreSQL
```bash
# Xem hướng dẫn chi tiết trong POSTGRESQL_SETUP.md
sudo apt install postgresql postgresql-contrib -y
```

### 2. Tạo database và user
```bash
sudo -u postgres psql
CREATE DATABASE niemadidaphat;
CREATE USER niemadidaphat_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE niemadidaphat TO niemadidaphat_user;
```

### 3. Setup environment variables
Copy file `.env.example` thành `.env` và điền các giá trị:
```bash
cp .env.example .env
nano .env
```

Các biến cần thiết:
- **PostgreSQL**: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL
- **JWT**: JWT_SECRET, JWT_EXPIRES_IN
- **Cloudflare R2**: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, etc.
- **Client URL**: CLIENT_URL

### 4. Test database connection
```bash
node test-db-connection.js
```

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

## Troubleshooting

### ❌ Lỗi: "no pg_hba.conf entry for host"

**Giải pháp:**
1. Đảm bảo `DB_HOST=localhost` trong `.env` nếu backend và PostgreSQL cùng server
2. Cấu hình `pg_hba.conf`:
   ```bash
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   # Thêm: host niemadidaphat niemadidaphat_user 127.0.0.1/32 md5
   sudo systemctl restart postgresql
   ```
3. Xem chi tiết: `../FIX_POSTGRESQL_CONNECTION.md`

### ❌ Lỗi: "password authentication failed"

Reset password:
```bash
sudo -u postgres psql
ALTER USER niemadidaphat_user WITH ENCRYPTED PASSWORD 'new_password';
```

### ❌ Lỗi: "ECONNREFUSED"

PostgreSQL chưa chạy:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### 🔍 Debug

Chạy test script để kiểm tra connection:
```bash
node test-db-connection.js
```

## Tài liệu liên quan

- `../FIX_POSTGRESQL_CONNECTION.md` - Khắc phục lỗi kết nối PostgreSQL
- `../POSTGRESQL_SETUP.md` - Hướng dẫn cài đặt PostgreSQL
- `../DEPLOYMENT_UBUNTU.md` - Hướng dẫn deploy lên Ubuntu
- `../ENV_SETUP.md` - Hướng dẫn setup environment variables
