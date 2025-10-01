# Migration từ Supabase sang PostgreSQL

## ⚠️ Lưu ý quan trọng

**Migration này thay thế hoàn toàn Supabase bằng PostgreSQL self-hosted.**

## 📋 Checklist Migration

### 1. Backup Data từ Supabase
```bash
# Tạo thư mục backup
mkdir -p backup

# Export data từ Supabase
# Có thể dùng Supabase Dashboard > SQL Editor hoặc pg_dump
```

### 2. Setup PostgreSQL trên Ubuntu
Xem chi tiết tại `POSTGRESQL_SETUP.md`

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Thêm password_hash column cho user_profiles

**⚠️ Supabase Auth lưu password trong bảng `auth.users` (không truy cập được), nên cần:**

```sql
-- Connect to database
psql -h localhost -U niemadidaphat_user -d niemadidaphat

-- Thêm password_hash column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_password ON user_profiles(password_hash);
```

### 4. Migrate Data

#### Option 1: Export từ Supabase Dashboard

1. Vào Supabase Dashboard
2. SQL Editor > New Query
3. Export từng table:

```sql
-- Export products
SELECT * FROM products ORDER BY created_at;

-- Export chapters
SELECT * FROM chapters ORDER BY product_id, sort_order;

-- Export user_profiles (không có password)
SELECT id, email, full_name, avatar_url, role, created_at, updated_at 
FROM user_profiles;

-- Export followers
SELECT * FROM followers;

-- Export feedback
SELECT * FROM feedback;

-- Export product_views
SELECT * FROM product_views;

-- Export user_sessions
SELECT * FROM user_sessions;

-- Export user_roles
SELECT * FROM user_roles;
```

4. Copy CSV results
5. Import vào PostgreSQL:

```bash
# Import products
psql -h localhost -U niemadidaphat_user -d niemadidaphat \
  -c "\COPY products FROM 'products.csv' DELIMITER ',' CSV HEADER"

# Import chapters
psql -h localhost -U niemadidaphat_user -d niemadidaphat \
  -c "\COPY chapters FROM 'chapters.csv' DELIMITER ',' CSV HEADER"

# Tương tự cho các table khác...
```

#### Option 2: Dùng pg_dump (recommended)

**Từ Supabase:**
```bash
# Get connection string từ Supabase Dashboard > Settings > Database
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --schema=public \
  --data-only \
  --table=products \
  --table=chapters \
  --table=user_profiles \
  --table=followers \
  --table=feedback \
  --table=product_views \
  --table=user_sessions \
  --table=user_roles \
  > supabase_data_backup.sql
```

**Import vào PostgreSQL:**
```bash
psql -h localhost -U niemadidaphat_user -d niemadidaphat < supabase_data_backup.sql
```

### 5. Reset User Passwords

⚠️ **Users cần reset password vì Supabase Auth không export password hashes:**

**Option A: Admin reset tất cả users:**
```sql
-- Set temporary password cho tất cả users
-- Password: "Welcome@123"
UPDATE user_profiles 
SET password_hash = '$2b$10$XGmJ9zHrOzXyJYLx2Pvm/uKY.J8vK2pqZ0fQZ3aNLZ8KxE8jZ8xJy';
```

**Option B: Send email reset (cần implement):**
- Tạo reset token
- Gửi email cho users
- Users reset password qua link

### 6. Update Backend Server

```bash
cd /var/www/niemadidaphat/server

# Install new dependencies
npm install pg bcrypt jsonwebtoken cookie-parser

# Remove Supabase
npm uninstall @supabase/supabase-js

# Update .env
nano .env
```

Add to `.env`:
```env
# PostgreSQL Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_secure_password_here

# JWT Secret
JWT_SECRET=your_random_secret_key_minimum_32_characters_here
JWT_EXPIRES_IN=7d

# Remove Supabase env vars (hoặc comment out)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

### 7. Test Backend

```bash
# Start backend
cd /var/www/niemadidaphat/server
npm run dev

# Test endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/chapters/product/[PRODUCT_ID]

# Test auth
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Welcome@123"}'
```

### 8. Update Frontend

Frontend vẫn gọi backend API như cũ, nhưng cần update auth:

```typescript
// src/lib/auth.ts
// Remove Supabase auth
// Add JWT token auth

// Save token to localStorage
localStorage.setItem('auth_token', token);

// Add to API calls
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 9. Deploy to Production

```bash
# Pull latest code
cd /var/www/niemadidaphat
git pull origin main

# Install dependencies
cd server
npm install

# Restart PM2
pm2 restart ecosystem.config.cjs

# Restart frontend
cd ..
npm install
npm run build
pm2 restart ecosystem.frontend.config.js
```

---

## 📊 Schema Differences

### user_profiles - NEW COLUMN
```sql
ALTER TABLE user_profiles 
ADD COLUMN password_hash VARCHAR(255);
```

### Các tables khác - KHÔNG THAY ĐỔI SCHEMA
- products
- chapters
- feedback
- followers
- product_views
- user_sessions
- user_roles

---

## 🔐 Authentication Flow

### Before (Supabase):
1. Frontend → Supabase Auth → Returns JWT
2. Backend validates JWT with Supabase

### After (PostgreSQL + JWT):
1. Frontend → Backend `/api/auth/login` → Returns JWT
2. Backend validates JWT with `JWT_SECRET`
3. JWT payload: `{ id, email, role }`

---

## 🚨 Breaking Changes

### Users phải đăng nhập lại
- Supabase sessions không còn valid
- Users cần reset password hoặc dùng temp password

### Frontend Auth Changes
```typescript
// OLD
import { supabase } from '@/lib/supabase';
await supabase.auth.signInWithPassword({ email, password });

// NEW
import { apiClient } from '@/lib/apiConfig';
await apiClient.post('/auth/login', { email, password });
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed và running
- [ ] Database created với correct permissions
- [ ] All tables migrated với data
- [ ] password_hash column added
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Backend running và test pass
- [ ] Frontend updated cho JWT auth
- [ ] Frontend deployed
- [ ] Users notified về password reset
- [ ] Backup Supabase data lưu an toàn

---

## 🔄 Rollback Plan

Nếu có vấn đề:

1. **Revert backend code:**
```bash
git revert HEAD
npm install
pm2 restart all
```

2. **Re-enable Supabase:**
- Uncomment Supabase env vars
- Restart services

3. **Keep PostgreSQL data** để retry later

---

## 📞 Support

Nếu có vấn đề:
1. Check logs: `pm2 logs`
2. Check PostgreSQL: `sudo systemctl status postgresql`
3. Check database connection: `psql -h localhost -U niemadidaphat_user -d niemadidaphat`

