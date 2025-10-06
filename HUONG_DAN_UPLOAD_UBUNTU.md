# 📤 Hướng Dẫn Upload Scripts Lên Ubuntu Server

Hướng dẫn này giúp bạn upload các scripts từ Windows lên Ubuntu server của bạn.

---

## 🎯 PHƯƠNG ÁN 1: SCP (Khuyến nghị)

### Bước 1: Chuẩn bị trên Windows
```powershell
# Tại thư mục E:\spotify
# Các file .sh và .md đã có sẵn
```

### Bước 2: Upload lên Ubuntu bằng SCP
```powershell
# Thay your_user và your_server_ip
scp -r E:\spotify\*.sh your_user@your_server_ip:/tmp/
scp -r E:\spotify\*.md your_user@your_server_ip:/tmp/
```

### Bước 3: SSH vào Ubuntu và setup
```bash
ssh your_user@your_server_ip

# Di chuyển scripts vào thư mục dự án
sudo mkdir -p /var/www/spotify
sudo chown $USER:$USER /var/www/spotify
cd /var/www/spotify
mv /tmp/*.sh .
mv /tmp/*.md .

# Cấp quyền thực thi
chmod +x *.sh

# Chạy cài đặt
sudo bash quick-install.sh
```

---

## 🎯 PHƯƠNG ÁN 2: Git (Dễ nhất)

### Bước 1: Push scripts lên GitHub của bạn
```powershell
cd E:\spotify
git add *.sh *.md
git commit -m "Add Ubuntu setup scripts"
git push
```

### Bước 2: Clone trên Ubuntu
```bash
ssh your_user@your_server_ip

# Clone repo của bạn
cd /var/www/spotify
git clone https://github.com/your-username/your-repo.git .

# Cấp quyền thực thi
chmod +x *.sh

# Chạy cài đặt
sudo bash quick-install.sh
```

---

## 🎯 PHƯƠNG ÁN 3: WinSCP (GUI)

### Bước 1: Download WinSCP
- Tải từ: https://winscp.net/eng/download.php

### Bước 2: Kết nối Ubuntu server
1. Mở WinSCP
2. Nhập thông tin:
   - Host: IP server Ubuntu
   - Username: user của bạn
   - Password: mật khẩu

### Bước 3: Upload files
1. Bên trái: Browse tới `E:\spotify`
2. Bên phải: Browse tới `/var/www/spotify`
3. Kéo thả các file `.sh` và `.md` từ trái sang phải
4. Click **Upload**

### Bước 4: SSH vào Ubuntu và chạy
```bash
ssh your_user@your_server_ip
cd /var/www/spotify
chmod +x *.sh
sudo bash quick-install.sh
```

---

## 🎯 PHƯƠNG ÁN 4: Copy-Paste Trực Tiếp

Nếu bạn không có SCP/Git, có thể copy-paste từng file:

### Trên Ubuntu:
```bash
cd /var/www/spotify

# Tạo file quick-install.sh
nano quick-install.sh
# Paste nội dung từ Windows, Ctrl+X, Y, Enter

# Tạo các file khác tương tự
nano setup-ubuntu.sh
nano setup-mongodb.sh
nano create-env.sh
nano run-production.sh
nano setup-nginx.sh
nano SETUP_UBUNTU.md
nano README_SCRIPTS.md

# Cấp quyền
chmod +x *.sh

# Chạy
sudo bash quick-install.sh
```

---

## 🚀 SAU KHI UPLOAD XONG

### 1. Kiểm tra files
```bash
cd /var/www/spotify
ls -lh *.sh *.md
```

### 2. Chạy Quick Install (TẤT CẢ TRONG MỘT)
```bash
sudo bash quick-install.sh
```

Script này sẽ tự động:
- ✅ Cài đặt Node.js, MongoDB, PM2, Nginx
- ✅ Clone repository Spotify
- ✅ Cài đặt dependencies
- ✅ Cấu hình firewall

### 3. Hoặc chạy từng bước
```bash
# Bước 1: Cài đặt công cụ
sudo bash setup-ubuntu.sh

# Bước 2: Setup MongoDB
bash setup-mongodb.sh

# Bước 3: Tạo .env
bash create-env.sh

# Bước 4: Chạy production
bash run-production.sh

# Bước 5: Setup Nginx
sudo bash setup-nginx.sh
```

---

## 📋 CHECKLIST

- [ ] Upload tất cả file `.sh` lên Ubuntu
- [ ] Upload tất cả file `.md` lên Ubuntu
- [ ] Chạy `chmod +x *.sh` để cấp quyền thực thi
- [ ] Chạy `sudo bash quick-install.sh`
- [ ] Làm theo hướng dẫn trên màn hình
- [ ] Đăng ký Clerk: https://clerk.com
- [ ] Đăng ký Cloudinary: https://cloudinary.com
- [ ] Chạy `bash create-env.sh` và nhập credentials
- [ ] Chạy `bash run-production.sh`
- [ ] (Optional) Setup domain và SSL

---

## 🔑 THÔNG TIN CẦN CHUẨN BỊ

Trước khi chạy scripts, chuẩn bị:

### 1. Thông tin Ubuntu Server
- ✅ IP address
- ✅ SSH username
- ✅ SSH password hoặc private key

### 2. Clerk Account (Miễn phí)
- 📧 Đăng ký: https://clerk.com
- ✅ Tạo application
- ✅ Copy `CLERK_PUBLISHABLE_KEY` (pk_test_...)
- ✅ Copy `CLERK_SECRET_KEY` (sk_test_...)

### 3. Cloudinary Account (Miễn phí - 25GB)
- ☁️ Đăng ký: https://cloudinary.com
- ✅ Copy `Cloud Name`
- ✅ Copy `API Key`
- ✅ Copy `API Secret`

### 4. Domain (Optional)
- 🌐 Nếu có domain, trỏ A record về IP Ubuntu server

---

## ⏱️ THỜI GIAN THỰC HIỆN

- Upload files: **1-2 phút**
- Quick Install: **5-10 phút**
- Đăng ký Clerk + Cloudinary: **5 phút**
- Cấu hình .env: **2 phút**
- Build và deploy: **3-5 phút**
- **Tổng: ~20-25 phút** ⏰

---

## 🆘 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: Permission denied
```bash
chmod +x *.sh
```

### Lỗi: /bin/bash^M: bad interpreter
```bash
# Cài đặt dos2unix
sudo apt install dos2unix

# Chuyển đổi line endings
dos2unix *.sh

# Hoặc dùng sed
sed -i 's/\r$//' *.sh
```

### Lỗi: Script not found
```bash
# Kiểm tra đường dẫn
pwd
ls -la *.sh

# Di chuyển đúng thư mục
cd /var/www/spotify
```

---

## 📞 HỖ TRỢ

- 📖 Hướng dẫn chi tiết: Xem `SETUP_UBUNTU.md`
- 📜 Hướng dẫn scripts: Xem `README_SCRIPTS.md`
- 🎥 Video tutorial: https://youtu.be/4sbklcQ0EXc
- 💬 GitHub Issues: https://github.com/burakorkmez/realtime-spotify-clone/issues

---

## 🎉 HOÀN TẤT

Sau khi hoàn tất, bạn sẽ có:
- ✅ Ứng dụng Spotify clone chạy trên Ubuntu
- ✅ Quản lý bằng PM2 (tự động restart)
- ✅ Serve qua Nginx (có thể thêm SSL)
- ✅ MongoDB local hoặc cloud
- ✅ Authentication với Clerk
- ✅ Media storage với Cloudinary

**Chúc bạn thành công! 🚀**

---

Made with ❤️ for Vietnamese developers


