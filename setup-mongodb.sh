#!/bin/bash

# Script tạo MongoDB database và user cho Spotify Clone

echo "=================================================="
echo "  🗄️  THIẾT LẬP MONGODB  "
echo "=================================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Nhập thông tin
read -p "Nhập tên database (mặc định: spotify-clone): " DB_NAME
DB_NAME=${DB_NAME:-spotify-clone}

read -p "Nhập username (mặc định: spotify_admin): " DB_USER
DB_USER=${DB_USER:-spotify_admin}

read -sp "Nhập password: " DB_PASS
echo ""

if [ -z "$DB_PASS" ]; then
    echo "❌ Password không được để trống!"
    exit 1
fi

echo ""
echo -e "${YELLOW}Đang tạo database và user...${NC}"

# Tạo MongoDB user
mongosh <<EOF
use $DB_NAME
db.createUser({
  user: "$DB_USER",
  pwd: "$DB_PASS",
  roles: [{ role: "readWrite", db: "$DB_NAME" }]
})
EOF

echo ""
echo -e "${GREEN}✅ Tạo MongoDB user thành công!${NC}"
echo ""
echo "📋 Thông tin kết nối:"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASS"
echo ""
echo "🔗 MongoDB URI:"
echo "mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME"
echo ""
echo "⚠️  LƯU Ý: Lưu thông tin này để cấu hình file .env"


