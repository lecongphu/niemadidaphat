# ✅ PostgreSQL Migration - Summary

## 📊 Tổng quan Migration

**Đã hoàn thành:** Chuyển đổi từ Supabase sang PostgreSQL self-hosted

### Thay đổi chính:
1. ✅ Backend sử dụng PostgreSQL thay vì Supabase
2. ✅ JWT Authentication thay vì Supabase Auth  
3. ✅ Cookie-based sessions
4. ⏳ Frontend cần update để sử dụng JWT

---

## 📁 Files Đã Tạo/Cập Nhật

### Backend Files (Mới)
```
server/
├── src/
│   ├── config/
│   │   └── database.js               ✅ PostgreSQL connection pool
│   ├── middleware/
│   │   └── jwtAuth.js                ✅ JWT authentication middleware
│   └── routes/
│       ├── authNew.js                ✅ JWT auth routes (login, register, etc.)
│       ├── chaptersNew.js            ✅ Chapters routes với PostgreSQL
│       └── products.js               ✅ Updated để dùng PostgreSQL
└── package.json                      ✅ Updated dependencies
```

### Backend Files (Updated)
```
server/src/index.js                   ✅ Sử dụng PostgreSQL và JWT auth
```

### Documentation
```
POSTGRESQL_SETUP.md                   ✅ Hướng dẫn cài PostgreSQL
MIGRATION_SUPABASE_TO_POSTGRESQL.md   ✅ Hướng dẫn migration chi tiết
POSTGRESQL_MIGRATION_COMPLETE.md      ✅ File này
```

---

## 🔧 Backend Dependencies

### Đã thêm:
```json
{
  "pg": "^8.11.3",              // PostgreSQL client
  "bcrypt": "^5.1.1",           // Password hashing
  "jsonwebtoken": "^9.0.2",     // JWT tokens
  "cookie-parser": "^1.4.6"     // Cookie middleware
}
```

### Đã xóa:
```json
{
  "@supabase/supabase-js": "^2.57.4"  // ❌ Không còn cần
}
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_32_chars_minimum
JWT_EXPIRES_IN=7d

# R2 (không đổi)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://cdn.niemadidaphat.com
```

### Frontend (.env.local) - CẦN CẬP NHẬT
```env
# ❌ XÓA hoặc comment out Supabase vars
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# ✅ GIỮ NGUYÊN
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.niemadidaphat.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 🗃️ Database Schema Changes

### ✅ Cần thêm column:
```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON user_profiles(email);
```

### ✅ Tất cả tables khác GIỮ NGUYÊN:
- products
- chapters
- feedback
- followers
- product_views
- user_sessions
- user_roles

---

## 🔐 Authentication Flow

### ❌ CŨ (Supabase Auth):
```typescript
import { supabase } from '@/lib/supabase';

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});

// Get user
const { data: { user } } = await supabase.auth.getUser();
```

### ✅ MỚI (JWT):
```typescript
import { apiClient } from '@/lib/apiConfig';

// Login
const response = await apiClient.post('/auth/login', { email, password });
const { user, token } = response.data;
localStorage.setItem('auth_token', token);

// Get user
const response = await apiClient.get('/auth/me');
const user = response.data;
```

---

## 📡 API Endpoints

### Auth Endpoints (NEW)
```
POST   /api/auth/register      - Đăng ký tài khoản mới
POST   /api/auth/login         - Đăng nhập
POST   /api/auth/logout        - Đăng xuất
GET    /api/auth/me            - Lấy thông tin user hiện tại
PUT    /api/auth/profile       - Cập nhật profile
PUT    /api/auth/password      - Đổi mật khẩu
```

### Products & Chapters (UPDATED - PostgreSQL)
```
GET    /api/products           - Lấy danh sách products
POST   /api/products           - Tạo product mới
GET    /api/products/:slug     - Lấy product theo slug
PUT    /api/products/:id       - Cập nhật product
DELETE /api/products/:id       - Xóa product

GET    /api/chapters           - Lấy danh sách chapters
POST   /api/chapters           - Tạo chapter mới
GET    /api/chapters/product/:productId
PUT    /api/chapters/:id       - Cập nhật chapter
DELETE /api/chapters/:id       - Xóa chapter
```

---

## 🚀 Deployment Steps

### 1. Setup PostgreSQL trên Ubuntu
```bash
# Xem POSTGRESQL_SETUP.md
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql
```

### 2. Tạo Database & User
```sql
CREATE DATABASE niemadidaphat;
CREATE USER niemadidaphat_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE niemadidaphat TO niemadidaphat_user;
```

### 3. Import Schema
```bash
psql -h localhost -U niemadidaphat_user -d niemadidaphat \
  -f complete_database_schema.sql
```

### 4. Add password_hash column
```sql
ALTER TABLE user_profiles ADD COLUMN password_hash VARCHAR(255);
```

### 5. Migrate Data từ Supabase
```bash
# Option 1: pg_dump từ Supabase
pg_dump "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" \
  --schema=public --data-only > supabase_data.sql

psql -h localhost -U niemadidaphat_user -d niemadidaphat < supabase_data.sql

# Option 2: Export CSV và COPY
# Xem MIGRATION_SUPABASE_TO_POSTGRESQL.md
```

### 6. Install Dependencies & Start Backend
```bash
cd /var/www/niemadidaphat/server
npm install
npm start
```

### 7. Update Frontend (⏳ PENDING)
```bash
cd /var/www/niemadidaphat
# Update auth code (xem section Frontend Update below)
npm run build
pm2 restart frontend
```

---

## 🎨 Frontend Update Required

### Files cần update:

#### 1. `src/lib/auth.ts` (TẠO MỚI)
```typescript
import { apiClient } from './apiConfig';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    this.token = token;
    localStorage.setItem('auth_token', token);
    
    return { user, token };
  }

  async register(email: string, password: string, full_name?: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', { 
      email, password, full_name 
    });
    const { user, token } = response.data;
    
    this.token = token;
    localStorage.setItem('auth_token', token);
    
    return { user, token };
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;
    
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      this.token = null;
      localStorage.removeItem('auth_token');
      return null;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
```

#### 2. `src/lib/apiConfig.ts` (UPDATE)
```typescript
// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 3. Remove Supabase References
```bash
# Search và remove:
- import { supabase } from '@/lib/supabase'
- supabase.auth.*
- src/lib/supabaseAuth.ts (optional: xóa hoặc deprecate)
```

---

## ⚠️ Breaking Changes

### Users phải đăng nhập lại
- Tất cả Supabase sessions sẽ invalid
- Users cần tạo password mới hoặc admin reset

### Password Reset Flow
```sql
-- Temporary password cho tất cả users: "Welcome@123"
UPDATE user_profiles 
SET password_hash = '$2b$10$XGmJ9zHrOzXyJYLx2Pvm/uKY.J8vK2pqZ0fQZ3aNLZ8KxE8jZ8xJy';

-- Hoặc send email reset (cần implement)
```

---

## ✅ Testing Checklist

### Backend
```bash
# 1. Test database connection
npm run dev
# Expect: "✅ Database connected"

# 2. Test auth endpoints
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","full_name":"Test User"}'

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# 3. Test protected endpoints
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Test products
curl http://localhost:5000/api/products
```

### Frontend (after update)
- [ ] Login form works
- [ ] Register form works
- [ ] Token stored in localStorage
- [ ] Protected pages redirect to login
- [ ] Logout clears token
- [ ] API calls include Authorization header

---

## 🔄 Rollback Plan

Nếu có vấn đề:

```bash
# 1. Revert to old code
git revert HEAD
cd server && npm install

# 2. Switch back to authRouter old version
# In server/src/index.js:
# import authRouter from './routes/auth.js';  // old Supabase version

# 3. Restart
pm2 restart all
```

---

## 📚 Related Documentation

- `POSTGRESQL_SETUP.md` - Cài đặt PostgreSQL
- `MIGRATION_SUPABASE_TO_POSTGRESQL.md` - Chi tiết migration
- `server/README.md` - Backend API docs
- `START_HERE.md` - Project overview

---

## 🎯 Next Steps

1. ✅ Backend đã sẵn sàng với PostgreSQL + JWT
2. ⏳ Cài PostgreSQL trên Ubuntu server
3. ⏳ Migrate data từ Supabase
4. ⏳ Update frontend authentication
5. ⏳ Test đầy đủ
6. ⏳ Deploy production

---

## 💡 Tips

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Backup PostgreSQL
```bash
# Daily backup cron
0 2 * * * pg_dump -U niemadidaphat_user niemadidaphat > /backup/db_$(date +\%Y\%m\%d).sql
```

### Monitor PostgreSQL
```bash
# Check connections
SELECT count(*) FROM pg_stat_activity;

# Check size
SELECT pg_size_pretty(pg_database_size('niemadidaphat'));
```

