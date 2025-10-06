#!/bin/bash

# Script tự động setup Spotify Clone trên Ubuntu Server
# Chạy với quyền sudo: sudo bash setup-ubuntu.sh

set -e  # Dừng nếu có lỗi

echo "=================================================="
echo "  🎵 SPOTIFY CLONE - AUTO SETUP FOR UBUNTU  "
echo "=================================================="
echo ""

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Vui lòng chạy script với quyền sudo: sudo bash setup-ubuntu.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bắt đầu cài đặt...${NC}"
echo ""

# ============================================
# 1. CẬP NHẬT HỆ THỐNG
# ============================================
echo -e "${YELLOW}[1/8] Cập nhật hệ thống...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. CÀI ĐẶT NODE.JS
# ============================================
echo -e "${YELLOW}[2/8] Cài đặt Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# ============================================
# 3. CÀI ĐẶT GIT
# ============================================
echo -e "${YELLOW}[3/8] Cài đặt Git...${NC}"
apt install -y git

# ============================================
# 4. CÀI ĐẶT MONGODB
# ============================================
echo -e "${YELLOW}[4/8] Cài đặt MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    # Import MongoDB public GPG key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

    # Thêm MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    # Cập nhật và cài đặt
    apt update
    apt install -y mongodb-org

    # Khởi động MongoDB
    systemctl start mongod
    systemctl enable mongod
fi
echo "MongoDB installed: $(mongod --version | head -n 1)"

# ============================================
# 5. CÀI ĐẶT PM2
# ============================================
echo -e "${YELLOW}[5/8] Cài đặt PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo "PM2 version: $(pm2 --version)"

# ============================================
# 6. CÀI ĐẶT NGINX
# ============================================
echo -e "${YELLOW}[6/8] Cài đặt Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi
echo "Nginx version: $(nginx -v 2>&1)"

# ============================================
# 7. CẤU HÌNH FIREWALL
# ============================================
echo -e "${YELLOW}[7/8] Cấu hình Firewall...${NC}"
ufw --force enable
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw allow 5000/tcp
echo "Firewall status:"
ufw status

# ============================================
# 8. TẠO THƯ MỤC DỰ ÁN
# ============================================
echo -e "${YELLOW}[8/8] Tạo thư mục dự án...${NC}"
mkdir -p /var/www/spotify
chown -R $SUDO_USER:$SUDO_USER /var/www/spotify

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ CÀI ĐẶT HOÀN TẤT!"
echo "==================================================${NC}"
echo ""
echo "📋 CÁC BƯỚC TIẾP THEO:"
echo ""
echo "1️⃣  Clone repository:"
echo "   cd /var/www/spotify"
echo "   git clone https://github.com/burakorkmez/realtime-spotify-clone ."
echo ""
echo "2️⃣  Cài đặt dependencies:"
echo "   cd /var/www/spotify/backend && npm install"
echo "   cd /var/www/spotify/frontend && npm install"
echo ""
echo "3️⃣  Tạo MongoDB user - Chạy script setup-mongodb.sh"
echo ""
echo "4️⃣  Đăng ký dịch vụ:"
echo "   - Clerk: https://clerk.com (để xác thực)"
echo "   - Cloudinary: https://cloudinary.com (để lưu media)"
echo ""
echo "5️⃣  Tạo file .env - Chạy script create-env.sh"
echo ""
echo "6️⃣  Chạy ứng dụng:"
echo "   bash run-production.sh"
echo ""
echo "📖 Xem chi tiết: cat SETUP_UBUNTU.md"
echo ""


