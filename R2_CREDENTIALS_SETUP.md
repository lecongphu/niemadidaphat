# Hướng dẫn Setup R2 Credentials

## 🚨 **Lỗi hiện tại:**
```
Failed to upload file to R2 storage
write EPROTO F42B0000:error:0A000410:SSL routines:ssl3_read_bytes:sslv3 alert handshake failure
```

## 🔍 **Nguyên nhân:**
Environment variables trong `.env.local` vẫn đang sử dụng placeholder values:
```bash
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here  
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
```

## ✅ **Giải pháp:**
Cần setup R2 credentials để upload file hoạt động.

## 🔧 **Để setup R2 hoàn chỉnh:**

### **1. Tạo Cloudflare Account**
1. Truy cập [cloudflare.com](https://cloudflare.com)
2. Đăng ký tài khoản miễn phí
3. Xác thực email

### **2. Tạo R2 Bucket**
1. Vào **R2 Object Storage** trong Cloudflare Dashboard
2. Click **Create bucket**
3. Đặt tên: `niemadidaphat-storage`
4. Chọn location: **Automatic**

### **3. Tạo API Token**
1. Vào **My Profile** → **API Tokens**
2. Click **Create Token**
3. Chọn **Custom token**:
   - **Token name**: `niemadidaphat-r2-token`
   - **Permissions**: `Cloudflare R2:Edit`
   - **Account resources**: Include All accounts
4. Lưu lại **Account ID**, **Access Key ID**, **Secret Access Key**

### **4. Cập nhật .env.local**
Thay thế các placeholder values:
```bash
# Thay thế các dòng này:
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here

# Bằng values thật:
R2_ACCOUNT_ID=429b7256d5dbe1f4f82c6d8d35346025
R2_ACCESS_KEY_ID=b0469f2ad238be86c10b2964f132a583
R2_SECRET_ACCESS_KEY=a547eb186133225e2f27524e2c103316dfc3f3798112434636f9df3564f8b5bb
```

### **5. Test Connection**
```bash
npm run test-r2
```

## 📊 **Lợi ích của R2:**

| Feature | R2 |
|---------|----| 
| **Free Storage** | 10GB |
| **Egress Fees** | FREE |
| **CDN** | Cloudflare Global Network |
| **Performance** | Low latency worldwide |

## 🎯 **Khuyến nghị:**
Setup R2 để có:
- Chi phí thấp (free egress)
- Performance tốt với Cloudflare CDN
- Storage dung lượng lớn (10GB free tier)

## 🆘 **Nếu vẫn gặp lỗi:**
1. Kiểm tra credentials có đúng không
2. Kiểm tra bucket có tồn tại không
3. Kiểm tra API token có đủ quyền không
