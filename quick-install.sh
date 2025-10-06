#!/bin/bash

# Quick Install Script - Cài đặt nhanh Spotify Clone trên Ubuntu
# Chạy: curl -sSL https://raw.githubusercontent.com/... | sudo bash

set -e

echo "=================================================="
echo "  🎵 SPOTIFY CLONE - QUICK INSTALL  "
echo "=================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kiểm tra Ubuntu version
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        echo -e "${RED}❌ Script này chỉ hỗ trợ Ubuntu${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Không thể xác định hệ điều hành${NC}"
    exit 1
fi

# Kiểm tra quyền root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Vui lòng chạy script với quyền sudo${NC}"
    exit 1
fi

echo -e "${GREEN}Bắt đầu cài đặt tự động...${NC}"
echo ""

# ============================================
# 1. UPDATE & UPGRADE
# ============================================
echo -e "${YELLOW}[1/9] Cập nhật hệ thống...${NC}"
apt update -qq && apt upgrade -y -qq

# ============================================
# 2. INSTALL NODE.JS
# ============================================
echo -e "${YELLOW}[2/9] Cài đặt Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs -qq
fi
echo "✓ Node: $(node --version)"

# ============================================
# 3. INSTALL GIT
# ============================================
echo -e "${YELLOW}[3/9] Cài đặt Git...${NC}"
apt install -y git -qq
echo "✓ Git: $(git --version)"

# ============================================
# 4. INSTALL MONGODB
# ============================================
echo -e "${YELLOW}[4/9] Cài đặt MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor > /dev/null 2>&1
    
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list > /dev/null
    
    apt update -qq
    apt install -y mongodb-org -qq
    systemctl start mongod
    systemctl enable mongod > /dev/null 2>&1
fi
echo "✓ MongoDB installed"

# ============================================
# 5. INSTALL PM2
# ============================================
echo -e "${YELLOW}[5/9] Cài đặt PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
fi
echo "✓ PM2: $(pm2 --version)"

# ============================================
# 6. INSTALL NGINX
# ============================================
echo -e "${YELLOW}[6/9] Cài đặt Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx -qq
    systemctl start nginx
    systemctl enable nginx > /dev/null 2>&1
fi
echo "✓ Nginx: $(nginx -v 2>&1)"

# ============================================
# 7. INSTALL CERTBOT (SSL)
# ============================================
echo -e "${YELLOW}[7/9] Cài đặt Certbot...${NC}"
apt install -y certbot python3-certbot-nginx -qq
echo "✓ Certbot installed"

# ============================================
# 8. CLONE PROJECT
# ============================================
echo -e "${YELLOW}[8/9] Clone project...${NC}"
mkdir -p /var/www/niemadidaphat
cd /var/www/niemadidaphat

if [ -d ".git" ]; then
    echo "✓ Project đã tồn tại, pulling updates..."
    git pull > /dev/null 2>&1
else
    git clone https://github.com/burakorkmez/realtime-spotify-clone.git . > /dev/null 2>&1
fi

chown -R $SUDO_USER:$SUDO_USER /var/www/niemadidaphat
echo "✓ Project cloned"

# ============================================
# 9. INSTALL DEPENDENCIES
# ============================================
echo -e "${YELLOW}[9/9] Cài đặt dependencies...${NC}"
cd /var/www/niemadidaphat/backend
sudo -u $SUDO_USER npm install > /dev/null 2>&1
echo "✓ Backend dependencies installed"

cd /var/www/niemadidaphat/frontend
sudo -u $SUDO_USER npm install > /dev/null 2>&1
echo "✓ Frontend dependencies installed"

# ============================================
# FIREWALL
# ============================================
echo -e "${YELLOW}Cấu hình Firewall...${NC}"
ufw --force enable > /dev/null 2>&1
ufw allow 'Nginx Full' > /dev/null 2>&1
ufw allow OpenSSH > /dev/null 2>&1
ufw allow 5000/tcp > /dev/null 2>&1
echo "✓ Firewall configured"

# ============================================
# DOWNLOAD HELPER SCRIPTS
# ============================================
echo ""
echo -e "${YELLOW}Tạo helper scripts...${NC}"

cd /var/www/niemadidaphat

# Tạo các script helper (nội dung đã có ở các file trước)
cat > setup-mongodb.sh << 'EOFMONGO'
#!/bin/bash
echo "🗄️  THIẾT LẬP MONGODB"
read -p "Database name (spotify-clone): " DB_NAME
DB_NAME=${DB_NAME:-spotify-clone}
read -p "Username (spotify_admin): " DB_USER
DB_USER=${DB_USER:-spotify_admin}
read -sp "Password: " DB_PASS
echo ""
mongosh <<EOF
use $DB_NAME
db.createUser({
  user: "$DB_USER",
  pwd: "$DB_PASS",
  roles: [{ role: "readWrite", db: "$DB_NAME" }]
})
EOF
echo "✅ MongoDB URI: mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME"
EOFMONGO

chmod +x setup-mongodb.sh
echo "✓ setup-mongodb.sh created"

echo ""
echo -e "${GREEN}=================================================="
echo "  ✅ CÀI ĐẶT CƠ BẢN HOÀN TẤT!"
echo "==================================================${NC}"
echo ""
echo "📋 CÁC BƯỚC TIẾP THEO:"
echo ""
echo "1️⃣  Thiết lập MongoDB:"
echo "   cd /var/www/niemadidaphat"
echo "   bash setup-mongodb.sh"
echo ""
echo "2️⃣  Đăng ký dịch vụ (MIỄN PHÍ):"
echo ""
echo "   📧 Clerk (Authentication):"
echo "      https://clerk.com"
echo "      → Tạo app → Lấy API keys"
echo ""
echo "   ☁️  Cloudinary (Media Storage):"
echo "      https://cloudinary.com"
echo "      → Dashboard → Copy credentials"
echo ""
echo "3️⃣  Tạo file .env với thông tin từ bước 1 và 2:"
echo ""
echo "   Backend (.env):"
echo "   ==============="
echo "   PORT=5000"
echo "   MONGODB_URI=mongodb://user:pass@localhost:27017/spotify-clone"
echo "   ADMIN_EMAIL=your@email.com"
echo "   NODE_ENV=production"
echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
echo "   CLOUDINARY_API_KEY=your_api_key"
echo "   CLOUDINARY_API_SECRET=your_api_secret"
echo "   CLERK_PUBLISHABLE_KEY=pk_test_..."
echo "   CLERK_SECRET_KEY=sk_test_..."
echo ""
echo "   Frontend (.env):"
echo "   ================"
echo "   VITE_CLERK_PUBLISHABLE_KEY=pk_test_..."
echo ""
echo "4️⃣  Build và chạy:"
echo "   cd /var/www/niemadidaphat/frontend"
echo "   npm run build"
echo "   cp -r dist /var/www/niemadidaphat/backend/"
echo "   cd /var/www/niemadidaphat/backend"
echo "   pm2 start src/index.js --name spotify"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5️⃣  Cấu hình Nginx và SSL:"
echo "   - Trỏ domain về IP server"
echo "   - sudo certbot --nginx -d your-domain.com"
echo ""
echo "📖 Chi tiết: https://github.com/burakorkmez/realtime-spotify-clone"
echo ""
echo "💡 TIP: Xem toàn bộ hướng dẫn chi tiết trong file SETUP_UBUNTU.md"
echo ""


