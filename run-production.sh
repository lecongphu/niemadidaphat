#!/bin/bash

# Script chạy Spotify Clone ở chế độ production với PM2

set -e

echo "=================================================="
echo "  🚀 CHẠY SPOTIFY CLONE - PRODUCTION MODE  "
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/var/www/spotify"

# Kiểm tra thư mục dự án
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Không tìm thấy thư mục dự án tại $PROJECT_DIR"
    exit 1
fi

# Kiểm tra file .env
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo "❌ Không tìm thấy file backend/.env"
    echo "Vui lòng chạy: bash create-env.sh"
    exit 1
fi

# ============================================
# 1. BUILD FRONTEND
# ============================================
echo -e "${YELLOW}[1/4] Building frontend...${NC}"
cd $PROJECT_DIR/frontend
npm run build

# ============================================
# 2. COPY BUILD FILES
# ============================================
echo -e "${YELLOW}[2/4] Copying build files...${NC}"
rm -rf $PROJECT_DIR/backend/dist
cp -r $PROJECT_DIR/frontend/dist $PROJECT_DIR/backend/

# ============================================
# 3. TẠO PM2 ECOSYSTEM FILE
# ============================================
echo -e "${YELLOW}[3/4] Creating PM2 ecosystem file...${NC}"

cat > $PROJECT_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'spotify-backend',
      cwd: '/var/www/spotify/backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/spotify-error.log',
      out_file: '/var/log/pm2/spotify-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
EOF

# Tạo thư mục log
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# ============================================
# 4. KHỞI ĐỘNG VỚI PM2
# ============================================
echo -e "${YELLOW}[4/4] Starting application with PM2...${NC}"

cd $PROJECT_DIR

# Stop nếu đang chạy
pm2 stop spotify-backend 2>/dev/null || true
pm2 delete spotify-backend 2>/dev/null || true

# Start app
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u $USER --hp $HOME

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ ỨNG DỤNG ĐÃ CHẠY THÀNH CÔNG!"
echo "==================================================${NC}"
echo ""
echo "📊 Thông tin:"
pm2 status
echo ""
echo "🌐 URL:"
echo "  - Backend API: http://localhost:5000"
echo "  - Frontend: http://your-server-ip"
echo ""
echo "📋 Các lệnh hữu ích:"
echo "  - Xem logs: pm2 logs spotify-backend"
echo "  - Restart: pm2 restart spotify-backend"
echo "  - Stop: pm2 stop spotify-backend"
echo "  - Monitor: pm2 monit"
echo ""
echo "🔧 Cấu hình Nginx:"
echo "  Chạy: bash setup-nginx.sh"
echo ""


