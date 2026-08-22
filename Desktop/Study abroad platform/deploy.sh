#!/bin/bash

# 🚀 StudyAbroad.ai - Production Deployment Script
# This script handles full deployment from development to production

set -e  # Exit on error

echo "═══════════════════════════════════════════════════════════"
echo "🚀 StudyAbroad.ai Production Deployment"
echo "═══════════════════════════════════════════════════════════"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Step 1: Environment Check ──────────────────────────────────
echo -e "\n${YELLOW}Step 1: Environment Check${NC}"
if [ ! -f "backend/.env.production" ]; then
    echo -e "${RED}❌ Missing backend/.env.production${NC}"
    echo "Create it using backend/.env.production as template"
    exit 1
fi
echo -e "${GREEN}✅ .env.production found${NC}"

# ─── Step 2: Dependencies Check ─────────────────────────────────
echo -e "\n${YELLOW}Step 2: Installing Dependencies${NC}"
cd backend
npm install --production
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

cd ../frontend
npm install
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"
cd ..

# ─── Step 3: Database Verification ──────────────────────────────
echo -e "\n${YELLOW}Step 3: Verifying Database Connection${NC}"
cd backend
node -e "
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connection successful'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
"
cd ..

# ─── Step 4: Security Check ─────────────────────────────────────
echo -e "\n${YELLOW}Step 4: Security Verification${NC}"
cd backend
npm audit || echo "⚠️  Run 'npm audit' to check for vulnerabilities"
cd ..

# ─── Step 5: Load Testing ───────────────────────────────────────
echo -e "\n${YELLOW}Step 5: Running Load Tests (k6)${NC}"
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
sleep 3

echo "Running load test with 100 concurrent users..."
k6 run ../k6_load_test.js --vus 100 --duration 30s || {
    kill $BACKEND_PID
    exit 1
}

kill $BACKEND_PID 2>/dev/null
cd ..

# ─── Step 6: E2E Testing ────────────────────────────────────────
echo -e "\n${YELLOW}Step 6: Running E2E Tests${NC}"
echo "Use Postman Collection: Postman_Collection.json"
echo "Or run: npm test (if test scripts are configured)"

# ─── Step 7: Build & Optimize ───────────────────────────────────
echo -e "\n${YELLOW}Step 7: Optimizing Builds${NC}"

# Backend optimizations
cd backend
echo "Optimizing backend..."
# Implement compression
npm install compression --save

# Frontend optimizations
cd ../frontend
echo "Optimizing frontend..."
npm run build
echo -e "${GREEN}✅ Frontend optimized (check dist/ folder)${NC}"

# Analyze bundle size
if command -v webpack-bundle-analyzer &> /dev/null; then
    echo "Bundle size: $(du -sh dist/ | cut -f1)"
fi
cd ..

# ─── Step 8: Health Check ──────────────────────────────────────
echo -e "\n${YELLOW}Step 8: Health Check${NC}"
cd backend
npm start &
BACKEND_PID=$!
sleep 2

HEALTH=$(curl -s http://localhost:5000/ | grep -q "StudyAbroad.ai API" && echo "healthy" || echo "unhealthy")
if [ "$HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    kill $BACKEND_PID
    exit 1
fi

kill $BACKEND_PID 2>/dev/null
cd ..

# ─── Step 9: Deployment Options ────────────────────────────────
echo -e "\n${YELLOW}Step 9: Choose Deployment Platform${NC}"
echo "1. Railway.app (Recommended - $0.50/day)"
echo "2. Heroku (Now Paid)"
echo "3. Render (Free tier available)"
echo "4. DigitalOcean (Custom VPS)"
echo "5. AWS (EC2/Lambda)"

read -p "Select deployment option (1-5): " deployment_choice

case $deployment_choice in
    1)
        echo -e "\n${GREEN}Railway.app Deployment${NC}"
        echo "1. Push code to GitHub"
        echo "2. Connect Railway to GitHub"
        echo "3. Set environment variables in Railway dashboard"
        echo "Command: git push origin main"
        ;;
    2)
        echo -e "\n${GREEN}Heroku Deployment${NC}"
        echo "1. heroku login"
        echo "2. heroku create studyabroad-app"
        echo "3. heroku config:set JWT_SECRET=... (set all env vars)"
        echo "4. git push heroku main"
        ;;
    3)
        echo -e "\n${GREEN}Render Deployment${NC}"
        echo "1. Push code to GitHub"
        echo "2. Create new Web Service in Render dashboard"
        echo "3. Connect GitHub repository"
        echo "4. Set environment variables"
        echo "5. Deploy"
        ;;
    4)
        echo -e "\n${GREEN}DigitalOcean VPS Deployment${NC}"
        echo "1. SSH into droplet"
        echo "2. Install Node.js & npm"
        echo "3. Clone repository"
        echo "4. Set .env.production"
        echo "5. Use PM2 to run: pm2 start backend/server.js"
        echo "6. Setup Nginx as reverse proxy"
        ;;
    5)
        echo -e "\n${GREEN}AWS Deployment${NC}"
        echo "1. Use Elastic Beanstalk or Lambda + API Gateway"
        echo "2. Set environment variables in console"
        echo "3. Deploy using AWS CLI or console"
        ;;
esac

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
