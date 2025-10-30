#!/bin/bash

# Script setup permissions cho upload trên Ubuntu
# Chạy script này sau khi deploy backend lên Ubuntu

echo "=================================================="
echo "  🔧 SETUP UPLOAD PERMISSIONS"
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Lấy backend path (có thể customize)
BACKEND_PATH="${1:-/var/www/niemadidaphat/backend}"

echo -e "${BLUE}Backend path: ${BACKEND_PATH}${NC}"
echo ""

# Kiểm tra backend path có tồn tại không
if [ ! -d "$BACKEND_PATH" ]; then
    echo -e "${RED}❌ Backend path không tồn tại: $BACKEND_PATH${NC}"
    echo "Sử dụng: sudo bash setup-upload-permissions.sh [backend-path]"
    echo "Ví dụ: sudo bash setup-upload-permissions.sh /var/www/niemadidaphat/backend"
    exit 1
fi

# Tìm user đang chạy backend (PM2, node process, etc.)
BACKEND_USER=$(whoami)
if [ "$EUID" -eq 0 ]; then
    # Nếu chạy với sudo, hỏi user nào sẽ chạy backend
    read -p "Nhập user sẽ chạy backend (mặc định: $SUDO_USER): " INPUT_USER
    BACKEND_USER="${INPUT_USER:-$SUDO_USER}"
fi

echo -e "${YELLOW}User chạy backend: ${BACKEND_USER}${NC}"
echo ""

# ============================================
# TẠO TMP FOLDER
# ============================================
TMP_DIR="$BACKEND_PATH/src/tmp"

echo -e "${YELLOW}Tạo tmp folder: ${TMP_DIR}${NC}"

if [ -d "$TMP_DIR" ]; then
    echo -e "${BLUE}→ Tmp folder đã tồn tại${NC}"
else
    mkdir -p "$TMP_DIR"
    echo -e "${GREEN}✅ Đã tạo tmp folder${NC}"
fi

# ============================================
# SET PERMISSIONS
# ============================================
echo ""
echo -e "${YELLOW}Đang set permissions...${NC}"

# Chown cho backend user
chown -R "${BACKEND_USER}:${BACKEND_USER}" "$TMP_DIR"
echo -e "${GREEN}✅ Chown: ${BACKEND_USER}:${BACKEND_USER}${NC}"

# Chmod 775 (owner: rwx, group: rwx, others: rx)
chmod 775 "$TMP_DIR"
echo -e "${GREEN}✅ Chmod: 775${NC}"

# ============================================
# VERIFY PERMISSIONS
# ============================================
echo ""
echo -e "${YELLOW}Kiểm tra permissions...${NC}"
ls -la "$BACKEND_PATH/src/" | grep tmp

# ============================================
# CHECK DISK SPACE
# ============================================
echo ""
echo -e "${YELLOW}Kiểm tra disk space...${NC}"
df -h "$BACKEND_PATH" | tail -1

AVAILABLE_SPACE=$(df -BG "$BACKEND_PATH" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 10 ]; then
    echo -e "${RED}⚠️ WARNING: Disk space còn lại < 10GB. Có thể không đủ cho upload files lớn!${NC}"
else
    echo -e "${GREEN}✅ Disk space đủ cho upload${NC}"
fi

# ============================================
# DONE
# ============================================
echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ SETUP PERMISSIONS HOÀN TẤT!"
echo "==================================================${NC}"
echo ""
echo "📁 Tmp folder: $TMP_DIR"
echo "👤 Owner: $BACKEND_USER"
echo "🔐 Permissions: 775"
echo ""
echo "📋 Bước tiếp theo:"
echo ""
echo "1️⃣  Test upload nhỏ (1-10MB):"
echo "   curl -X POST http://localhost:5000/api/admin/songs \\"
echo "     -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "     -F \"audioFile=@test.mp3\" \\"
echo "     -F \"imageFile=@test.jpg\" \\"
echo "     -F \"title=Test Song\" \\"
echo "     -F \"artist=Test Artist\" \\"
echo "     -F \"duration=180\""
echo ""
echo "2️⃣  Kiểm tra logs:"
echo "   pm2 logs backend"
echo "   # hoặc"
echo "   tail -f $BACKEND_PATH/logs/backend.log"
echo ""
echo "3️⃣  Nếu gặp lỗi permissions, chạy lại script này:"
echo "   sudo bash setup-upload-permissions.sh $BACKEND_PATH"
echo ""
