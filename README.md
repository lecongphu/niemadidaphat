# 🙏 NiemADiDaPhat - Nền tảng Audio Phật pháp

Platform để chia sẻ và nghe các bài giảng Phật pháp, kinh sách audio.

## 🏗️ Kiến trúc

Dự án sử dụng kiến trúc **Full Stack** tách biệt:

- **Frontend**: Next.js 15 (React 19)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (self-hosted)
- **Authentication**: JWT + bcrypt
- **Storage & CDN**: Cloudflare R2

## ⚡ Quick Start

**Xem file [`QUICKSTART.md`](QUICKSTART.md) để bắt đầu nhanh!**

### TL;DR

```bash
# 1. Setup backend
node scripts/setup-backend.js

# 2. Cấu hình env (xem QUICKSTART.md)
cd server && cp env-template.txt .env
# Chỉnh sửa server/.env

# 3. Tạo .env.local cho frontend
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# 4. Chạy full stack
node scripts/dev-full.js
```

## 📚 Tài liệu

### Bắt đầu
- 📖 **[QUICKSTART.md](QUICKSTART.md)** - Hướng dẫn nhanh nhất để chạy project
- 🚀 **[START_HERE.md](START_HERE.md)** - Hướng dẫn chi tiết từng bước
- ⚙️ **[ENV_SETUP.md](ENV_SETUP.md)** - Cấu hình environment variables

### Migration & Technical
- 🔄 **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Chi tiết về migration từ Next.js API Routes sang Node.js
- 📋 **[BACKEND_MIGRATION_SUMMARY.md](BACKEND_MIGRATION_SUMMARY.md)** - Tóm tắt migration
- 💾 **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)** - Setup PostgreSQL trên Ubuntu
- 🔄 **[MIGRATION_SUPABASE_TO_POSTGRESQL.md](MIGRATION_SUPABASE_TO_POSTGRESQL.md)** - Migration từ Supabase sang PostgreSQL
- ✅ **[POSTGRESQL_MIGRATION_COMPLETE.md](POSTGRESQL_MIGRATION_COMPLETE.md)** - Tổng quan migration PostgreSQL
- 📡 **[server/README.md](server/README.md)** - Backend API documentation

### Khác
- 🗂️ **[STORAGE_FOLDER_STRUCTURE.md](STORAGE_FOLDER_STRUCTURE.md)** - Cấu trúc lưu trữ
- 🔐 **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Cấu hình Google OAuth
- 🔐 **[GOOGLE_ONE_TAP_AUTH.md](GOOGLE_ONE_TAP_AUTH.md)** - Google One-Tap Authentication
- ☁️ **[R2_SETUP_GUIDE.md](R2_SETUP_GUIDE.md)** - Cấu hình Cloudflare R2

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4
- **Audio Player**: react-h5-audio-player
- **PDF Viewer**: react-pdf
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PostgreSQL (pg driver)
- **Storage**: AWS SDK (for R2)
- **Security**: Helmet, CORS
- **Rate Limiting**: express-rate-limit
- **Authentication**: JWT + Google One-Tap
- **Session Management**: cookie-parser

### Database & Storage
- **Database**: PostgreSQL (self-hosted)
- **File Storage & CDN**: Cloudflare R2
- **Authentication**: Google One-Tap only

## 📁 Cấu trúc Project

```
niemadidaphat/
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/        # Cấu hình (Supabase, R2)
│   │   ├── middleware/    # Middlewares (auth)
│   │   ├── routes/        # API Routes
│   │   └── index.js       # Server entry point
│   └── package.json
│
├── src/                   # Next.js Frontend
│   ├── app/              # Next.js App Router
│   │   ├── admin/        # Admin pages
│   │   ├── an-pham/      # Ấn phẩm pages
│   │   ├── blog/         # Blog pages
│   │   └── ...
│   ├── components/       # React Components
│   ├── lib/              # Utilities & helpers
│   │   ├── apiConfig.ts  # API client
│   │   └── ...
│   └── hooks/            # Custom React hooks
│
├── scripts/              # Build & dev scripts
│   ├── dev-full.js      # Chạy full stack
│   └── setup-backend.js # Setup backend
│
└── public/              # Static assets
```

## 🌟 Features

- ✅ Audio player với playlist
- ✅ Quản lý chapters/episodes
- ✅ Upload audio/images lên R2
- ✅ Google One-Tap Login
- ✅ Follow/Unfollow products
- ✅ Feedback system
- ✅ User roles & permissions
- ✅ Admin dashboard
- ✅ PDF viewer
- ✅ RSS feed
- ✅ SEO optimized

## 🔐 Database Schema

Xem file [`complete_database_schema.sql`](complete_database_schema.sql)

**Main Tables:**
- `products` - Sản phẩm audio
- `chapters` - Các tập/chapter của sản phẩm
- `user_profiles` - Thông tin user
- `user_roles` - Phân quyền
- `followers` - Follow products
- `feedback` - Góp ý
- `product_views` - Tracking views

## 🚀 Deployment

### 🐧 Ubuntu Server (Recommended)
**Xem hướng dẫn chi tiết**: [`DEPLOYMENT_UBUNTU.md`](DEPLOYMENT_UBUNTU.md)

Deploy full stack lên Ubuntu 18.04+ server với Nginx + PM2 + Let's Encrypt SSL.

**Quick links:**
- 📋 [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step by step checklist
- 📊 [Deployment Summary](DEPLOYMENT_SUMMARY.md) - Overview & quick commands

**Architecture:**
```
Cloudflare CDN → Nginx → PM2 → [Backend (5000) + Frontend (3000)]
```

**Estimated time:** 2-2.5 hours (first deployment)

### ☁️ Alternative Platforms

#### Backend (Railway/Render/VPS)
```bash
cd server
npm install --production
npm start
```

#### Frontend (Vercel/Netlify)
```bash
npm run build
```

Set `NEXT_PUBLIC_API_BASE_URL` pointing to backend URL.

## 🔒 Environment Variables

Xem [`ENV_SETUP.md`](ENV_SETUP.md) để biết chi tiết.

### Cần thiết cho Backend
- Supabase credentials
- R2 credentials
- Client URL

### Cần thiết cho Frontend
- API Base URL
- Supabase credentials (for auth)
- R2 Public URL

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

Private project - All rights reserved

## 🆘 Support

Gặp vấn đề? Xem:
1. [QUICKSTART.md](QUICKSTART.md) - Troubleshooting section
2. [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Technical details
3. GitHub Issues

---

Made with ❤️ for the Buddhist community