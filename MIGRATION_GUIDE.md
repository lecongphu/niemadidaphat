# Migration Guide: Next.js API Routes to Node.js Backend

## Tổng quan

Backend của ứng dụng đã được chuyển từ Next.js API Routes sang Node.js/Express server độc lập.

## Cấu trúc mới

### Backend Server (Node.js)
```
server/
├── src/
│   ├── config/
│   │   ├── supabase.js        # Supabase client config
│   │   └── r2Storage.js       # Cloudflare R2 storage config
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── routes/
│   │   ├── chapters.js        # Chapters API
│   │   ├── products.js        # Products API
│   │   ├── feedback.js        # Feedback API
│   │   ├── follow.js          # Follow API
│   │   ├── users.js           # Users API
│   │   ├── roles.js           # Roles API
│   │   ├── upload.js          # Upload API
│   │   └── auth.js            # Auth API
│   └── index.js               # Server entry point
├── package.json
├── env-template.txt           # Environment variables template
└── README.md
```

### Frontend (Next.js)
- Xóa: `src/app/api/` - Tất cả API routes đã được di chuyển
- Xóa: `src/app/auth/` - Auth callback đã được di chuyển
- Xóa: `src/app/rss/` - RSS route đã được di chuyển
- Thêm: `src/lib/apiConfig.ts` - API client configuration

## Hướng dẫn Setup

### 1. Setup Backend Server

```bash
cd server
npm install
```

### 2. Cấu hình Environment Variables

Copy `server/env-template.txt` thành `server/.env` và điền các giá trị:

```env
PORT=5000
NODE_ENV=development

# Supabase
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

### 3. Chạy Backend Server

Development:
```bash
cd server
npm run dev
```

Production:
```bash
cd server
npm start
```

### 4. Cấu hình Frontend

Thêm vào `.env.local` của Next.js:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Production:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
```

## API Endpoints

Tất cả endpoints giữ nguyên, chỉ thay đổi base URL:

### Trước (Next.js)
```
/api/products
/api/chapters
/api/feedback
...
```

### Sau (Node.js)
```
http://localhost:5000/api/products
http://localhost:5000/api/chapters
http://localhost:5000/api/feedback
...
```

## Sử dụng API trong Frontend

### Cách cũ (fetch trực tiếp)
```typescript
const response = await fetch('/api/products');
const data = await response.json();
```

### Cách mới (sử dụng apiClient)
```typescript
import { apiClient } from '@/lib/apiConfig';

const data = await apiClient.get('/products');
```

## API Client Helper

File `src/lib/apiConfig.ts` cung cấp:

- `API_BASE_URL`: Base URL của backend
- `getAuthHeaders()`: Lấy auth headers
- `apiClient.get()`: GET request
- `apiClient.post()`: POST request
- `apiClient.put()`: PUT request
- `apiClient.delete()`: DELETE request
- `apiClient.upload()`: File upload

## Migration Checklist

- [x] Tạo Node.js/Express server
- [x] Di chuyển tất cả API routes
- [x] Cấu hình Supabase trong server
- [x] Cấu hình R2 storage trong server
- [x] Xóa API routes cũ trong Next.js
- [ ] Cập nhật frontend components để sử dụng apiClient
- [ ] Test tất cả API endpoints
- [ ] Deploy backend server
- [ ] Cập nhật CORS settings nếu cần
- [ ] Cập nhật environment variables trong production

## Lưu ý

1. **CORS**: Backend đã cấu hình CORS cho phép requests từ frontend
2. **Authentication**: Auth headers được tự động thêm vào mọi request
3. **Error Handling**: API client tự động handle errors
4. **File Upload**: Sử dụng `apiClient.upload()` cho file uploads
5. **Rate Limiting**: Backend có rate limiting (100 requests/15 phút)

## Deployment

### Backend
- Deploy backend server lên platform như Railway, Render, hoặc VPS
- Cập nhật environment variables
- Ensure port 5000 (hoặc port bạn chọn) accessible

### Frontend
- Cập nhật `NEXT_PUBLIC_API_BASE_URL` trong production environment
- Deploy frontend như bình thường

## Rollback

Nếu cần rollback:
1. Restore thư mục `src/app/api/` từ git
2. Remove `server/` directory
3. Remove `src/lib/apiConfig.ts`
4. Restore environment variables

## Support

Nếu gặp vấn đề, kiểm tra:
1. Backend server có đang chạy không
2. Environment variables có đúng không
3. CORS settings có đúng không
4. Network connectivity giữa frontend và backend
