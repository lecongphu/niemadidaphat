# 🚀 Hướng dẫn khởi động dự án

## Kiến trúc mới

Dự án đã được tách thành 2 phần:
- **Frontend**: Next.js (port 3000)
- **Backend**: Node.js/Express (port 5000)

## Bước 1: Setup Backend

```bash
node scripts/setup-backend.js
```

## Bước 2: Cấu hình Environment Variables

### Backend (.env)
```bash
cd server
cp env-template.txt .env
# Chỉnh sửa file .env và điền các giá trị cần thiết
```

### Frontend (.env.local)
Tạo file `.env.local` ở root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BUNNY_CDN_URL=your_bunny_cdn_url
```

## Bước 3: Chạy ứng dụng

### Option 1: Chạy cả Backend và Frontend (Khuyến nghị)
```bash
node scripts/dev-full.js
```

### Option 2: Chạy riêng từng service

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Kiểm tra

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Backend Health Check: http://localhost:5000/health

## API Endpoints

Xem file `MIGRATION_GUIDE.md` để biết chi tiết về các API endpoints.

## Troubleshooting

### Backend không khởi động được
1. Kiểm tra file `server/.env` đã được tạo và điền đầy đủ
2. Kiểm tra dependencies: `cd server && npm install`
3. Kiểm tra port 5000 có bị chiếm không

### Frontend không kết nối được Backend
1. Kiểm tra Backend đang chạy tại http://localhost:5000
2. Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`
3. Kiểm tra CORS settings trong backend

### Lỗi Authentication
1. Kiểm tra Supabase credentials trong cả frontend và backend
2. Kiểm tra token được lưu trong localStorage

## Tài liệu tham khảo

### Development
- `MIGRATION_GUIDE.md` - Chi tiết về migration từ Next.js API Routes
- `ENV_SETUP.md` - Hướng dẫn setup environment variables
- `server/README.md` - Tài liệu Backend API

### Production Deployment
- `DEPLOY_QUICK_START.md` - ⚡ Deploy nhanh lên Ubuntu (5 bước)
- `DEPLOYMENT_UBUNTU.md` - 📖 Hướng dẫn deploy đầy đủ chi tiết
- `DEPLOYMENT_CHECKLIST.md` - ✅ Checklist từng bước
- `DEPLOYMENT_SUMMARY.md` - 📊 Tổng quan deployment
