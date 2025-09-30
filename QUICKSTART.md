# ⚡ Quick Start - NiemADiDaPhat Full Stack

## 🎯 Kiến trúc mới
- **Frontend**: Next.js → `http://localhost:3000`
- **Backend**: Node.js/Express → `http://localhost:5000`

## 📦 Bước 1: Cài đặt Dependencies

```bash
# Frontend dependencies (đã có)
npm install

# Backend dependencies
node scripts/setup-backend.js
```

## ⚙️ Bước 2: Cấu hình Environment Variables

### Backend
```bash
cd server
cp env-template.txt .env
```

Chỉnh sửa `server/.env`:
```env
PORT=5000
NODE_ENV=development

# Copy từ .env.local hiện tại
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# R2 credentials
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

CLIENT_URL=http://localhost:3000
```

### Frontend
Tạo/Cập nhật `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_R2_PUBLIC_URL=...
```

## 🚀 Bước 3: Chạy ứng dụng

### Cách 1: Chạy cả 2 service cùng lúc (Khuyến nghị)
```bash
node scripts/dev-full.js
```

### Cách 2: Chạy riêng từng service

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✅ Kiểm tra

1. **Backend Health Check**: http://localhost:5000/health
2. **Frontend**: http://localhost:3000

Nếu thấy:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...
}
```
→ Backend đang hoạt động! ✨

## 📝 Ghi chú quan trọng

- ⚠️ **Backend PHẢI chạy trước** thì frontend mới gọi được API
- 🔒 Authentication tự động thông qua `apiClient`
- 📤 Upload file qua `apiClient.upload()`
- 🚦 Rate limit: 100 requests/15 phút

## 📚 Tài liệu chi tiết

- `START_HERE.md` - Hướng dẫn đầy đủ
- `MIGRATION_GUIDE.md` - Chi tiết migration
- `ENV_SETUP.md` - Setup môi trường
- `BACKEND_MIGRATION_SUMMARY.md` - Tóm tắt migration

## 🆘 Troubleshooting

### Backend không chạy
```bash
cd server
npm install
# Kiểm tra .env đã điền đầy đủ chưa
```

### Frontend không kết nối Backend
- Kiểm tra Backend đang chạy tại port 5000
- Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`

### Lỗi CORS
- Backend đã config CORS cho `http://localhost:3000`
- Nếu dùng port khác, update `CLIENT_URL` trong `server/.env`

---

**Happy Coding! 🎉**
