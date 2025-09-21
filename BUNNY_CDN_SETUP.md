# Bunny CDN Setup Guide

## 🚀 **Tại sao chọn Bunny CDN?**

- ✅ **Giá rẻ**: 100GB storage + 1TB bandwidth chỉ ~$2/tháng
- ✅ **Permanent URLs**: Không expire như Google Drive
- ✅ **Global CDN**: Tốc độ cao toàn cầu
- ✅ **CORS enabled**: Hoạt động tốt với web apps
- ✅ **Unlimited bandwidth**: Không giới hạn download

## 🔧 **Setup Steps**

### **1. Tạo tài khoản Bunny CDN**
1. Truy cập [bunny.net](https://bunny.net)
2. Đăng ký tài khoản miễn phí
3. Xác thực email

### **2. Tạo Storage Zone**
1. Vào **Storage** → **Add Storage Zone**
2. Đặt tên: `niemadidaphat-storage`
3. Chọn region: **New York** (gần Việt Nam nhất)
4. Lưu lại **Storage Zone Name** và **Password**

### **3. Tạo Pull Zone (CDN)**
1. Vào **Pull Zones** → **Add Pull Zone**
2. Đặt tên: `niemadidaphat-cdn`
3. Origin URL: `https://ny.storage.bunnycdn.com/niemadidaphat-storage`
4. Lưu lại **CDN URL** (dạng: `https://niemadidaphat-cdn.b-cdn.net`)

### **4. Cấu hình Environment Variables**

Thêm vào `.env.local`:

```bash
# Bunny CDN Configuration
BUNNY_STORAGE_ZONE_NAME=niemadidaphat-storage
BUNNY_ACCESS_KEY=your-storage-password-here
BUNNY_REGION=ny
NEXT_PUBLIC_BUNNY_CDN_URL=https://niemadidaphat-cdn.b-cdn.net
```

### **5. Test Upload**

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/upload/bunny \
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

- **Audio**: `https://niemadidaphat-cdn.b-cdn.net/audio/1234567890-chapter-1.mp3`
- **PDF**: `https://niemadidaphat-cdn.b-cdn.net/pdfs/1234567890-product.pdf`
- **Image**: `https://niemadidaphat-cdn.b-cdn.net/images/1234567890-cover.jpg`

## 💰 **Pricing**

| Plan | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Free | 1GB | 1GB | $0 |
| Starter | 10GB | 1TB | $1 |
| **Pro** | **100GB** | **1TB** | **$2** |
| Business | 1TB | 10TB | $10 |

## 🛠️ **API Usage**

### **Upload File**
```typescript
import { bunnyStorage } from '@/lib/bunnyStorage';

const result = await bunnyStorage.uploadFile(
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
const deleteResult = await bunnyStorage.deleteFile('audio/chapter-1.mp3');
if (deleteResult.success) {
  console.log('File deleted successfully');
}
```

### **Get Public URL**
```typescript
const publicUrl = bunnyStorage.getPublicUrl('audio/chapter-1.mp3');
// Returns: https://niemadidaphat-cdn.b-cdn.net/audio/chapter-1.mp3
```

## 🚨 **Important Notes**

1. **File Names**: Sử dụng timestamp để tránh conflict
2. **MIME Types**: Đặt đúng MIME type cho optimization
3. **Caching**: Bunny CDN tự động cache, không cần config
4. **HTTPS**: Tất cả URLs đều HTTPS
5. **CORS**: Đã enable cho web apps

## 🔍 **Troubleshooting**

### **Upload Failed**
- Kiểm tra `BUNNY_ACCESS_KEY` có đúng không
- Kiểm tra `BUNNY_STORAGE_ZONE_NAME` có đúng không
- Kiểm tra file size (max 100MB per request)

### **File Not Found**
- Kiểm tra file path có đúng không
- Kiểm tra CDN URL có đúng không
- Kiểm tra file đã upload thành công chưa

### **CORS Error**
- Kiểm tra domain có được add vào CORS settings không
- Kiểm tra `NEXT_PUBLIC_BUNNY_CDN_URL` có đúng không

## 📞 **Support**

- **Documentation**: [bunny.net/docs](https://bunny.net/docs)
- **Support**: [support@bunny.net](mailto:support@bunny.net)
- **Discord**: [bunny.net/discord](https://bunny.net/discord)
