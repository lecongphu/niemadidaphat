# Migration từ Bunny CDN sang Cloudflare R2 - Tóm tắt

## ✅ **Đã hoàn thành:**

### **1. Dependencies**
- ✅ Cài đặt `@aws-sdk/client-s3` và `@aws-sdk/s3-request-presigner`

### **2. Core Library**
- ✅ Tạo `src/lib/r2Storage.ts` với đầy đủ tính năng
- ✅ Backward compatibility với bunnyStorage API
- ✅ Support custom domain và R2.dev URLs

### **3. API Endpoints**
- ✅ Cập nhật `src/app/api/upload/bunny/route.ts` để sử dụng R2
- ✅ Tạo `src/app/api/upload/r2/route.ts` (endpoint mới)
- ✅ Cập nhật `src/app/api/chapters/delete/route.ts`
- ✅ Cập nhật `src/app/api/products/delete/route.ts`

### **4. Components**
- ✅ Cập nhật `src/components/BunnyUploader.tsx` 
- ✅ Tạo `src/components/R2Uploader.tsx` (component mới)
- ✅ Tạo `src/components/AudioUploaderR2.tsx`
- ✅ Tạo `src/components/ImageUploaderR2.tsx`
- ✅ Tạo `src/components/PDFUploaderR2.tsx`

### **5. Documentation**
- ✅ Tạo `R2_SETUP_GUIDE.md` với hướng dẫn chi tiết
- ✅ Tạo `R2_MIGRATION_SUMMARY.md` này

## 🔧 **Cần thực hiện để hoàn tất migration:**

### **1. Setup Cloudflare R2**
```bash
# Tạo R2 bucket trong Cloudflare Dashboard
# Tạo API tokens với quyền R2:Edit
# Lấy Account ID, Access Key ID, Secret Access Key
```

### **2. Cập nhật Environment Variables**
Thêm vào `.env.local`:
```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=niemadidaphat-storage

# Public domain (tùy chọn)
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://cdn.niemadidaphat.com
```

### **3. Update Components Usage**
Tìm và thay thế các component cũ:
```typescript
// Thay thế:
import BunnyUploader from '@/components/BunnyUploader';
import AudioUploaderBunny from '@/components/AudioUploaderBunny';
import ImageUploaderBunny from '@/components/ImageUploaderBunny';
import PDFUploaderBunny from '@/components/PDFUploaderBunny';

// Bằng:
import R2Uploader from '@/components/R2Uploader';
import AudioUploaderR2 from '@/components/AudioUploaderR2';
import ImageUploaderR2 from '@/components/ImageUploaderR2';
import PDFUploaderR2 from '@/components/PDFUploaderR2';
```

### **4. Test Migration**
```bash
# 1. Test upload
curl -X POST http://localhost:3000/api/upload/r2 \
  -F "file=@test.mp3" \
  -F "folder=audio"

# 2. Test delete (thông qua admin interface)
# 3. Verify public URLs work
# 4. Check CORS settings
```

### **5. Data Migration (Nếu cần)**
```typescript
// Script để migrate existing files từ Bunny sang R2
// Tải files từ Bunny URLs và upload lại lên R2
// Cập nhật database với URLs mới
```

## 📋 **API Changes Summary**

### **Endpoints còn hoạt động:**
- ✅ `POST /api/upload/bunny` - Vẫn hoạt động, nhưng dùng R2 backend
- ✅ `POST /api/upload/r2` - Endpoint mới, recommended

### **Backward Compatibility:**
- ✅ `bunnyStorage` import vẫn hoạt động (alias cho r2Storage)
- ✅ Tất cả helper functions vẫn hoạt động
- ✅ Không cần thay đổi code hiện tại

## 🔍 **Files đã thay đổi:**

### **New Files:**
- `src/lib/r2Storage.ts`
- `src/app/api/upload/r2/route.ts`
- `src/components/R2Uploader.tsx`
- `src/components/AudioUploaderR2.tsx`
- `src/components/ImageUploaderR2.tsx`
- `src/components/PDFUploaderR2.tsx`
- `R2_SETUP_GUIDE.md`
- `R2_MIGRATION_SUMMARY.md`

### **Modified Files:**
- `package.json` (added AWS SDK dependencies)
- `src/app/api/upload/bunny/route.ts`
- `src/app/api/chapters/delete/route.ts`
- `src/app/api/products/delete/route.ts`
- `src/components/BunnyUploader.tsx`

## 🚀 **Next Steps:**

1. **Setup R2 theo hướng dẫn trong `R2_SETUP_GUIDE.md`**
2. **Cập nhật environment variables**
3. **Test upload/delete operations**
4. **Deploy và monitor**
5. **Migrate existing data nếu cần**
6. **Remove Bunny CDN credentials sau khi confirm R2 hoạt động ổn định**

## 💡 **Benefits của R2:**

- 🆓 **10GB storage miễn phí**
- 🆓 **Zero egress fees** (không tính phí bandwidth)
- ⚡ **Cloudflare CDN** tích hợp sẵn
- 🔧 **S3-compatible** API dễ sử dụng
- 🌍 **Global performance** với Cloudflare network
- 💰 **Cost-effective** cho long-term storage

## ⚠️ **Important Notes:**

1. **Environment Variables**: Đảm bảo set đúng tất cả R2 credentials
2. **CORS**: Có thể cần cấu hình CORS trong R2 bucket settings
3. **Public Access**: Enable public access hoặc setup custom domain
4. **Testing**: Test kỹ trước khi switch production
5. **Backup**: Backup data trước khi migrate
