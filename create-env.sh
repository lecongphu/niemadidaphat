#!/bin/bash

# Script tạo file .env cho Spotify Clone

echo "=================================================="
echo "  ⚙️  TẠO FILE CẤU HÌNH .ENV  "
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/niemadidaphat"

# Kiểm tra thư mục dự án
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Không tìm thấy thư mục dự án tại $PROJECT_DIR"
    exit 1
fi

echo -e "${BLUE}Nhập thông tin cấu hình:${NC}"
echo ""

# ============================================
# BACKEND ENV
# ============================================
echo -e "${YELLOW}=== BACKEND CONFIGURATION ===${NC}"
echo ""

read -p "Port cho backend (mặc định: 5000): " PORT
PORT=${PORT:-5000}

read -p "MongoDB URI: " MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo "❌ MongoDB URI không được để trống!"
    exit 1
fi

read -p "Admin Email: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}

read -p "Node Environment (development/production): " NODE_ENV
NODE_ENV=${NODE_ENV:-production}

echo ""
echo -e "${YELLOW}=== CLOUDINARY CREDENTIALS ===${NC}"
echo "Lấy từ: https://cloudinary.com/console"
echo ""

read -p "Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "Cloudinary API Key: " CLOUDINARY_API_KEY
read -p "Cloudinary API Secret: " CLOUDINARY_API_SECRET

echo ""
echo -e "${YELLOW}=== CLERK CREDENTIALS ===${NC}"
echo "Lấy từ: https://dashboard.clerk.com"
echo ""

read -p "Clerk Publishable Key (pk_...): " CLERK_PUBLISHABLE_KEY
read -p "Clerk Secret Key (sk_...): " CLERK_SECRET_KEY

# ============================================
# TẠO BACKEND .ENV
# ============================================
echo ""
echo -e "${YELLOW}Đang tạo backend/.env...${NC}"

cat > $PROJECT_DIR/backend/.env << EOF
PORT=$PORT
MONGODB_URI=$MONGODB_URI
ADMIN_EMAIL=$ADMIN_EMAIL
NODE_ENV=$NODE_ENV

CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME

CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=$CLERK_SECRET_KEY
EOF

# ============================================
# TẠO FRONTEND .ENV
# ============================================
echo -e "${YELLOW}Đang tạo frontend/.env...${NC}"

cat > $PROJECT_DIR/frontend/.env << EOF
VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
EOF

echo ""
echo -e "${GREEN}✅ Tạo file .env thành công!${NC}"
echo ""
echo "📁 File đã tạo:"
echo "  - $PROJECT_DIR/backend/.env"
echo "  - $PROJECT_DIR/frontend/.env"
echo ""
echo "🔐 Bảo mật file .env:"
chmod 600 $PROJECT_DIR/backend/.env
chmod 600 $PROJECT_DIR/frontend/.env
echo "  ✅ Đã set permission 600 cho các file .env"
echo ""
echo "📋 Bước tiếp theo:"
echo "  1. Kiểm tra file: cat $PROJECT_DIR/backend/.env"
echo "  2. Chạy ứng dụng: bash run-production.sh"
echo ""


