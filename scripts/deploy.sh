#!/bin/bash

echo "🚀 Starting deployment for NiemADiDaPhat..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from project root${NC}"
    exit 1
fi

# Pull latest code
echo -e "${BLUE}📥 Pulling latest code...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to pull code${NC}"
    exit 1
fi

# Update backend
echo -e "${BLUE}📡 Updating backend...${NC}"
cd server
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Backend npm install failed${NC}"
    exit 1
fi

# Restart backend
pm2 restart niemadidaphat-backend
if [ $? -ne 0 ]; then
    echo -e "${RED}Warning: Failed to restart backend with PM2${NC}"
fi

# Update frontend
echo -e "${BLUE}🎨 Updating frontend...${NC}"
cd ..
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Frontend npm install failed${NC}"
    exit 1
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Frontend build failed${NC}"
    exit 1
fi

# Restart frontend
pm2 restart niemadidaphat-frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}Warning: Failed to restart frontend with PM2${NC}"
fi

# Show status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
pm2 status

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo -e "Frontend: https://niemadidaphat.com"
echo -e "Backend: https://api.niemadidaphat.com"
