# Environment Variables Setup

## Frontend (.env.local)

Tạo file `.env.local` ở root directory với nội dung:

```env
# API Backend URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Supabase (for auth only)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudflare R2 Public URL
NEXT_PUBLIC_R2_PUBLIC_URL=your_r2_public_url
```

## Backend (server/.env)

Tạo file `.env` trong thư mục `server/` với nội dung:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=niemadidaphat
DB_USER=niemadidaphat_user
DB_PASSWORD=your_secure_password_here
DB_SSL=false  # Set to 'true' for remote connections with SSL

# JWT Secret
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# Supabase (optional - if still using for some features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=your_r2_public_url

# Client URL
CLIENT_URL=http://localhost:3000
```

## Quick Start

### 1. Setup Backend

```bash
node scripts/setup-backend.js
```

### 2. Configure Environment Variables

Copy template và điền giá trị:

```bash
# Backend
cp server/env-template.txt server/.env
# Edit server/.env và điền các giá trị

# Frontend - tạo file .env.local với nội dung ở trên
```

### 3. Run Full Stack

```bash
# Option 1: Run cả backend và frontend
node scripts/dev-full.js

# Option 2: Run riêng từng service
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## Production Environment

### Backend
Set các biến môi trường trên hosting platform (Ubuntu Server, Railway, Render, etc):
- PORT
- NODE_ENV=production
- **PostgreSQL**:
  - DB_HOST (localhost hoặc remote IP)
  - DB_PORT (default: 5432)
  - DB_NAME
  - DB_USER
  - DB_PASSWORD
  - DB_SSL (true/false - set `true` nếu remote connection)
- **JWT**:
  - JWT_SECRET
  - JWT_EXPIRES_IN
- **Supabase** (optional):
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- **Cloudflare R2**:
  - R2_ACCOUNT_ID
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET_NAME
  - R2_PUBLIC_URL
- CLIENT_URL (frontend URL)

### Frontend
Set trên Vercel/Netlify:
- NEXT_PUBLIC_API_BASE_URL (backend URL)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_R2_PUBLIC_URL
