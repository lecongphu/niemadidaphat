# Cloudflare R2 Setup Guide

## 🚀 **Tại sao chọn Cloudflare R2?**

- ✅ **Giá rẻ**: 10GB storage miễn phí, không giới hạn bandwidth
- ✅ **Zero egress fees**: Không tính phí bandwidth ra ngoài
- ✅ **S3-compatible**: Dễ dàng migrate từ các service khác
- ✅ **Global CDN**: Tốc độ cao toàn cầu với Cloudflare network
- ✅ **CORS enabled**: Hoạt động tốt với web apps
- ✅ **Custom domains**: Hỗ trợ domain riêng

## 🔧 **Setup Steps**

### **1. Tạo tài khoản Cloudflare**
1. Truy cập [cloudflare.com](https://cloudflare.com)
2. Đăng ký tài khoản miễn phí
3. Xác thực email

### **2. Tạo R2 Bucket**
1. Vào **R2 Object Storage** trong Cloudflare Dashboard
2. Click **Create bucket**
3. Đặt tên bucket: `niemadidaphat-storage`
4. Chọn location: **Automatic** (Cloudflare sẽ tự chọn location tối ưu)

### **3. Cấu hình Public Access (Tùy chọn)**
1. Trong bucket settings, vào **Settings**
2. Enable **Public URL access** nếu muốn file có thể truy cập trực tiếp
3. Hoặc setup **Custom Domain** cho URL đẹp hơn

### **4. Tạo API Token**
1. Vào **My Profile** → **API Tokens**
2. Click **Create Token**
3. Chọn **Custom token**:
   - **Token name**: `niemadidaphat-r2-token`
   - **Permissions**: 
     - `Cloudflare R2:Edit` cho account của bạn
   - **Account resources**: Include All accounts
   - **Zone resources**: Include All zones (nếu dùng custom domain)
4. Lưu lại **Account ID**, **Access Key ID**, và **Secret Access Key**

### **5. Setup Custom Domain (Tùy chọn)**
1. Trong R2 bucket, vào **Settings** → **Custom Domains**
2. Click **Connect Domain**
3. Nhập domain: `cdn.niemadidaphat.com` (hoặc subdomain khác)
4. Cloudflare sẽ tự động setup DNS records

### **6. Cấu hình Environment Variables**

Thêm vào `.env.local`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=429b7256d5dbe1f4f82c6d8d35346025
R2_ACCESS_KEY_ID=b0469f2ad238be86c10b2964f132a583
R2_SECRET_ACCESS_KEY=a547eb186133225e2f27524e2c103316dfc3f3798112434636f9df3564f8b5bb
R2_BUCKET_NAME=niemadidaphat-storage

# Public domain (nếu sử dụng custom domain)
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://cdn.niemadidaphat.com
# Hoặc sử dụng R2.dev domain mặc định (không cần set biến này)
```

### **7. Test Upload**

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/upload/r2 \
  -F "file=@test.mp3" \
  -F "folder=audio"
```

## 📁 **Folder Structure**

```
niemadidaphat-storage/
├── audio/           # Audio files (MP3, WAV, etc.)
├── pdfs/            # PDF files
├── images/          # Cover images, thumbnails
└── temp/            # Temporary files
```

## 🔗 **URL Examples**

### **Với Custom Domain:**
- **Audio**: `https://cdn.niemadidaphat.com/audio/1234567890-chapter-1.mp3`
- **PDF**: `https://cdn.niemadidaphat.com/pdfs/1234567890-product.pdf`
- **Image**: `https://cdn.niemadidaphat.com/images/1234567890-cover.jpg`

### **Với R2.dev Domain:**
- **Audio**: `https://niemadidaphat-storage.account-id.r2.cloudflarestorage.com/audio/1234567890-chapter-1.mp3`

## 💰 **Pricing**

| Plan | Storage | Operations | Egress | Price |
|------|---------|------------|--------|-------|
| **Free** | **10GB** | **1M requests/month** | **FREE** | **$0** |
| Paid | $0.015/GB/month | $0.36/million | **FREE** | Pay as you use |

**Lưu ý**: R2 không tính phí bandwidth ra ngoài (egress), điều này tiết kiệm rất nhiều chi phí so với AWS S3.

## 🛠️ **API Usage**

### **Upload File**
```typescript
import { r2Storage } from '@/lib/r2Storage';

const result = await r2Storage.uploadFile(
  'audio/chapter-1.mp3',
  fileBuffer,
  'audio/mpeg'
);

if (result.success) {
  console.log('File URL:', result.url);
}
```

### **Delete File**
```typescript
const deleteResult = await r2Storage.deleteFile('audio/chapter-1.mp3');
if (deleteResult.success) {
  console.log('File deleted successfully');
}
```

### **Get Public URL**
```typescript
const publicUrl = r2Storage.getPublicUrl('audio/chapter-1.mp3');
// Returns: https://cdn.niemadidaphat.com/audio/chapter-1.mp3
```

## 🚨 **Important Notes**

1. **File Names**: Sử dụng timestamp để tránh conflict
2. **MIME Types**: Đặt đúng MIME type cho optimization
3. **Caching**: R2 tự động cache với Cloudflare CDN
4. **HTTPS**: Tất cả URLs đều HTTPS
5. **CORS**: Cần cấu hình CORS trong bucket settings nếu cần thiết

## 🔄 **Migration từ Bunny CDN**

### **1. Backup dữ liệu hiện tại**
```bash
# Download tất cả files từ Bunny CDN (nếu cần)
```

### **2. Update Environment Variables**
- Sử dụng các biến `R2_*` thay vì `BUNNY_*`
- Sử dụng `NEXT_PUBLIC_R2_PUBLIC_URL` thay vì `NEXT_PUBLIC_BUNNY_CDN_URL`

### **3. Update Code**
- Thay `import { bunnyStorage }` thành `import { r2Storage as bunnyStorage }`
- Hoặc sử dụng backward compatibility trong `r2Storage.ts`

### **4. Test Migration**
- Test upload/download/delete operations
- Verify public URLs work correctly
- Check CORS settings

## 🔍 **Troubleshooting**

### **Upload Failed**
- Kiểm tra `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` có đúng không
- Kiểm tra `R2_BUCKET_NAME` có đúng không
- Kiểm tra API token có đủ quyền không

### **File Not Found**
- Kiểm tra file path có đúng không
- Kiểm tra public access settings
- Kiểm tra custom domain configuration

### **CORS Error**
- Vào R2 bucket settings → CORS
- Thêm allowed origins, methods, headers
- Example CORS config:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

### **Performance Issues**
- Sử dụng custom domain để tận dụng Cloudflare CDN
- Enable Cloudflare caching rules
- Optimize file sizes trước khi upload

## 📞 **Support**

- **Documentation**: [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2/)
- **Community**: [community.cloudflare.com](https://community.cloudflare.com)
- **Support**: Cloudflare Dashboard → Support

## 🌟 **Advanced Features**

### **1. Lifecycle Rules**
- Tự động xóa hoặc archive files sau một thời gian
- Tiết kiệm storage costs

### **2. Event Notifications**
- Trigger functions khi có file upload/delete
- Integration với Cloudflare Workers

### **3. Analytics**
- Monitor usage, requests, bandwidth
- Available trong Cloudflare Dashboard

### **4. Security**
- Presigned URLs cho private files
- IP restrictions
- Token-based access control
