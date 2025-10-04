# 🔐 Google One-Tap Authentication với JWT (Ubuntu)

## 🎯 Mục tiêu

Chuyển từ **Google One-Tap + Supabase Auth** sang **Google One-Tap + JWT tự quản lý** trên Ubuntu.

---

## ✅ Đã hoàn thành

### 1. Frontend Components
- ✅ `src/lib/jwtAuth.ts` - JWT Authentication library
- ✅ `src/components/GoogleOneTapJWT.tsx` - Google One-Tap với JWT
- ✅ `src/components/AuthStatusJWT.tsx` - Auth status component

### 2. Backend API
- ✅ `server/src/routes/authGoogleJWT.js` - Google OAuth API endpoints
- ✅ `server/src/index.js` - Đã thêm JWT auth routes

### 3. Database Schema
- ✅ `complete_database_schema_postgresql.sql` - Schema không phụ thuộc Supabase

---

## 🚀 Cách sử dụng

### 1. Environment Variables

#### Frontend (.env.local)
```env
# ✅ GIỮ NGUYÊN
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# ❌ XÓA (không cần nữa)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

#### Backend (.env)
```env
# ✅ GIỮ NGUYÊN
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# ✅ THÊM MỚI
JWT_SECRET=your_random_32_character_secret_key_here
JWT_EXPIRES_IN=7d

# Database (không đổi)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_password
```

### 2. Cập nhật Components

#### Thay thế GoogleOneTap
```tsx
// ❌ CŨ
import GoogleOneTap from '@/components/GoogleOneTap'

// ✅ MỚI
import GoogleOneTapJWT from '@/components/GoogleOneTapJWT'

// Sử dụng
<GoogleOneTapJWT 
  onSuccess={() => console.log('Đăng nhập thành công!')}
  onError={(error) => console.error('Lỗi đăng nhập:', error)}
/>
```

#### Thay thế AuthStatus
```tsx
// ❌ CŨ
import AuthStatus from '@/components/AuthStatus'

// ✅ MỚI
import AuthStatusJWT from '@/components/AuthStatusJWT'

// Sử dụng
<AuthStatusJWT />
```

#### Thay thế Authentication Library
```tsx
// ❌ CŨ
import { SupabaseAuth } from '@/lib/supabaseAuth'

// ✅ MỚI
import JwtAuth from '@/lib/jwtAuth'

// Sử dụng
const user = await JwtAuth.getCurrentUser()
const isAuth = JwtAuth.isAuthenticated()
await JwtAuth.signOut()
```

---

## 🔄 Migration Steps

### 1. Backup hiện tại
```bash
# Backup database
pg_dump -h localhost -U niemadidaphat_user -d niemadidaphat > backup_before_jwt.sql

# Backup code
git add . && git commit -m "Backup before JWT migration"
```

### 2. Chạy Database Schema mới
```bash
# Chạy schema PostgreSQL thuần
psql -h localhost -U niemadidaphat_user -d niemadidaphat -f complete_database_schema_postgresql.sql
```

### 3. Cập nhật Environment Variables
```bash
# Backend
echo "JWT_SECRET=$(openssl rand -base64 32)" >> server/.env
echo "JWT_EXPIRES_IN=7d" >> server/.env

# Frontend - XÓA Supabase vars
sed -i '/NEXT_PUBLIC_SUPABASE/d' .env.local
```

### 4. Cập nhật Code
```bash
# Thay thế components trong các file
find src -name "*.tsx" -exec sed -i 's/GoogleOneTap/GoogleOneTapJWT/g' {} \;
find src -name "*.tsx" -exec sed -i 's/AuthStatus/AuthStatusJWT/g' {} \;
find src -name "*.ts" -exec sed -i 's/SupabaseAuth/JwtAuth/g' {} \;
```

### 5. Restart Services
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd ..
npm run dev
```

---

## 🔧 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/google     - Đăng nhập với Google One-Tap
GET    /api/auth/me         - Lấy thông tin user hiện tại
POST   /api/auth/logout     - Đăng xuất
POST   /api/auth/refresh    - Refresh JWT token
```

### Request/Response Examples

#### POST /api/auth/google
```json
// Request
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "full_name": "User Name",
      "avatar_url": "https://...",
      "provider": "google",
      "google_id": "123456789",
      "created_at": "2024-01-01T00:00:00Z",
      "last_active": "2024-01-01T00:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-08T00:00:00Z"
  }
}
```

#### GET /api/auth/me
```json
// Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "full_name": "User Name",
    "avatar_url": "https://...",
    "provider": "google",
    "google_id": "123456789",
    "created_at": "2024-01-01T00:00:00Z",
    "last_active": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🔐 JWT Token Structure

```json
{
  "user_id": "uuid",
  "email": "user@gmail.com", 
  "provider": "google",
  "google_id": "123456789",
  "iat": 1704067200,
  "exp": 1704672000,
  "iss": "niemadidaphat",
  "aud": "niemadidaphat-users"
}
```

---

## ⚠️ Lưu ý quan trọng

### 1. Security
- ✅ JWT_SECRET phải đủ mạnh (32+ ký tự)
- ✅ Token có thời gian hết hạn hợp lý (7 ngày)
- ✅ Verify Google token trên server
- ✅ HTTPS trong production

### 2. Database
- ✅ Không cần schema "auth" của Supabase
- ✅ user_profiles table độc lập
- ✅ Lưu google_id để liên kết

### 3. Frontend
- ✅ Token lưu trong localStorage
- ✅ Auto refresh token khi cần
- ✅ Clear auth khi token invalid

### 4. Backward Compatibility
- ✅ Có thể chạy song song với Supabase Auth
- ✅ Migration từng bước
- ✅ Rollback dễ dàng

---

## 🧪 Testing

### 1. Test Authentication Flow
```bash
# 1. Start services
npm run dev  # Frontend
cd server && npm run dev  # Backend

# 2. Open browser
open http://localhost:3000

# 3. Test Google One-Tap login
# 4. Check JWT token in localStorage
# 5. Verify API calls work
```

### 2. Test API Endpoints
```bash
# Test Google auth
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"test_credential"}'

# Test user info (với token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎉 Kết quả

Sau khi migration thành công:

- ✅ **Hoàn toàn độc lập** với Supabase
- ✅ **Google One-Tap** vẫn hoạt động bình thường  
- ✅ **JWT authentication** tự quản lý
- ✅ **Database PostgreSQL** thuần trên Ubuntu
- ✅ **Performance tốt hơn** (không phụ thuộc external service)
- ✅ **Cost thấp hơn** (không cần Supabase subscription)

---

**🚀 Bây giờ bạn có thể sử dụng Google One-Tap authentication hoàn toàn độc lập trên Ubuntu!**
