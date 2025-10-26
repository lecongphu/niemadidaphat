# Hướng Dẫn Terms of Service và Privacy Policy

## 📋 Tổng Quan

Tài liệu này hướng dẫn cách sử dụng các trang Terms of Service (Điều Khoản Dịch Vụ) và Privacy Policy (Chính Sách Bảo Mật) đã được tích hợp vào ứng dụng.

## 🔗 URL Các Trang

### Development (Local)
- **Terms of Service URL**: `http://localhost:5173/terms-of-service`
- **Privacy Policy URL**: `http://localhost:5173/privacy-policy`

### Production
Thay thế `your-domain.com` bằng domain thực tế của bạn:
- **Terms of Service URL**: `https://your-domain.com/terms-of-service`
- **Privacy Policy URL**: `https://your-domain.com/privacy-policy`

## 🔧 Cấu Hình Clerk OAuth

Khi thiết lập OAuth với Clerk, bạn cần cung cấp các URL này:

### 1. Truy cập Clerk Dashboard
- Đăng nhập vào [Clerk Dashboard](https://dashboard.clerk.com)
- Chọn ứng dụng của bạn

### 2. Cấu hình OAuth Settings
Đi tới **Settings** → **Authentication** → **Social Connections**

Đối với mỗi nhà cung cấp OAuth (Google, GitHub, v.v.):
1. Nhấn vào nhà cung cấp để mở cài đặt
2. Trong phần **OAuth Settings** hoặc **Application Settings**:
   - **Terms of Service URL**: Nhập URL terms of service của bạn
   - **Privacy Policy URL**: Nhập URL privacy policy của bạn

### 3. Cấu hình Google OAuth
Nếu sử dụng Google OAuth, bạn cũng cần cấu hình trong Google Cloud Console:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Chọn dự án của bạn
3. Đi tới **APIs & Services** → **OAuth consent screen**
4. Trong phần **App information**:
   - **Application privacy policy link**: Nhập URL privacy policy
   - **Application terms of service link**: Nhập URL terms of service
5. Lưu thay đổi

### 4. Cấu hình GitHub OAuth
Nếu sử dụng GitHub OAuth:

1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers)
2. Chọn OAuth App của bạn
3. Cập nhật:
   - **Privacy Policy URL**: Nhập URL privacy policy
   - **Terms of Service URL**: Nhập URL terms of service (nếu có)
4. Lưu thay đổi

## 📁 Cấu Trúc Files

```
frontend/src/
├── pages/
│   └── legal/
│       ├── TermsOfServicePage.tsx    # Trang Điều Khoản Dịch Vụ
│       └── PrivacyPolicyPage.tsx     # Trang Chính Sách Bảo Mật
├── components/
│   └── Footer.tsx                     # Footer component (tùy chọn)
└── App.tsx                            # Routes đã được cập nhật
```

## 🎨 Tính Năng

### Trang Terms of Service
- Giao diện responsive, tối ưu cho mọi thiết bị
- Nội dung đầy đủ bằng tiếng Việt
- Các mục rõ ràng:
  - Chấp nhận điều khoản
  - Mô tả dịch vụ
  - Tài khoản người dùng
  - Quyền và nghĩa vụ
  - Nội dung và bản quyền
  - Chấm dứt dịch vụ
  - Từ chối bảo đảm
  - Giới hạn trách nhiệm
  - Thay đổi điều khoản
  - Luật điều chỉnh

### Trang Privacy Policy
- Giao diện responsive, nhất quán với Terms of Service
- Nội dung chi tiết bằng tiếng Việt
- Các mục bao gồm:
  - Thông tin thu thập
  - Cách sử dụng thông tin
  - Chia sẻ thông tin
  - Bảo mật dữ liệu
  - Quyền của người dùng
  - Lưu trữ dữ liệu
  - Cookies và công nghệ theo dõi
  - Quyền riêng tư của trẻ em
  - Chuyển dữ liệu quốc tế

## 🚀 Triển Khai

### Development
```bash
cd frontend
npm run dev
```

Truy cập:
- http://localhost:5173/terms-of-service
- http://localhost:5173/privacy-policy

### Production
Sau khi deploy, các URL sẽ tự động hoạt động trên domain của bạn:
- https://your-domain.com/terms-of-service
- https://your-domain.com/privacy-policy

## ✏️ Tùy Chỉnh Nội Dung

### Cập nhật thông tin liên hệ
Trong cả hai file, tìm và thay đổi:
- Email: `support@musicapp.com` → email thực tế của bạn
- Email privacy: `privacy@musicapp.com` → email privacy thực tế

### Cập nhật tên ứng dụng
Tìm và thay đổi "Music App" thành tên ứng dụng của bạn.

### Thêm/Sửa nội dung
Mở file tương ứng và chỉnh sửa nội dung trong các `<section>`:
- `frontend/src/pages/legal/TermsOfServicePage.tsx`
- `frontend/src/pages/legal/PrivacyPolicyPage.tsx`

## 🔍 SEO và Accessibility

### Meta Tags (Tùy chọn)
Bạn có thể thêm meta tags vào head của mỗi trang:

```tsx
import { Helmet } from "react-helmet-async";

// Trong component
<Helmet>
  <title>Điều Khoản Dịch Vụ - Music App</title>
  <meta name="description" content="Điều khoản và điều kiện sử dụng dịch vụ Music App" />
</Helmet>
```

### Accessibility
- Cả hai trang đều sử dụng semantic HTML
- Heading hierarchy đúng chuẩn (h1, h2, h3)
- Color contrast đảm bảo accessibility
- Responsive trên mọi thiết bị

## 📝 Lưu Ý Quan Trọng

1. **Tùy chỉnh nội dung**: Nội dung hiện tại là mẫu chung. Bạn nên xem xét và điều chỉnh cho phù hợp với dịch vụ thực tế của mình.

2. **Tư vấn pháp lý**: Nên tham khảo ý kiến chuyên gia pháp lý để đảm bảo nội dung tuân thủ các quy định pháp luật hiện hành.

3. **Cập nhật định kỳ**: Khi có thay đổi về dịch vụ hoặc pháp luật, cần cập nhật các trang này.

4. **Ngày cập nhật**: Các trang tự động hiển thị ngày hiện tại. Bạn có thể hard-code ngày cụ thể nếu cần.

## 🆘 Hỗ Trợ

Nếu cần hỗ trợ:
1. Kiểm tra Routes trong `frontend/src/App.tsx`
2. Kiểm tra import statements
3. Đảm bảo React Router được cài đặt đúng
4. Xem console browser để biết lỗi

## ✅ Checklist Hoàn Thành

- [x] Tạo TermsOfServicePage component
- [x] Tạo PrivacyPolicyPage component
- [x] Thêm routes vào App.tsx
- [x] Tạo Footer component (tùy chọn)
- [x] Nội dung đầy đủ bằng tiếng Việt
- [ ] Cập nhật thông tin liên hệ thực tế
- [ ] Tùy chỉnh nội dung cho dịch vụ cụ thể
- [ ] Cấu hình URL trong Clerk Dashboard
- [ ] Cấu hình URL trong Google/GitHub OAuth
- [ ] Tham khảo ý kiến pháp lý (nếu cần)

---

**Chúc bạn thành công!** 🎉

