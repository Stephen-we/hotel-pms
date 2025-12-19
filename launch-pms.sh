#!/bin/bash
echo "╔══════════════════════════════════════╗"
echo "║        HOTEL PMS - PRODUCTION       ║"
echo "╚══════════════════════════════════════╝"

# 1. STOP EVERYTHING
echo ""
echo "🛑 Stopping existing services..."
pkill -f "node server.js" 2>/dev/null && echo "  ✓ Backend"
pkill -f "vite" 2>/dev/null && echo "  ✓ Frontend"
pkill -f "cloudflared.*9b928fb8" 2>/dev/null && echo "  ✓ Tunnel"
sleep 3

# 2. CONFIGURE API
echo ""
echo "🔧 Configuring API..."
cd client
echo "VITE_API_URL=https://hotel-api.stephenweb.space/api" > .env.production
echo "  ✓ API URL: https://hotel-api.stephenweb.space/api"
cd ..

# 3. START MERN
echo ""
echo "🚀 Starting MERN stack..."
npm run dev > /dev/null 2>&1 &
echo "  ⏳ Waiting 15 seconds..."
sleep 15

# 4. VERIFY LOCAL
echo ""
echo "🔍 Local verification:"
curl -s http://localhost:5000 | grep -q "Hotel PMS API" && echo "  ✓ Backend: localhost:5000" || echo "  ✗ Backend failed"
curl -s http://localhost:5173 | grep -q "hotel-pms" && echo "  ✓ Frontend: localhost:5173" || echo "  ✗ Frontend failed"

# 5. START TUNNEL
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
sleep 5
cd server
echo ""
echo "╔══════════════════════════════════════╗"
echo "║        SYSTEM READY                 ║"
echo "╠══════════════════════════════════════╣"
echo "║ 🌐 https://hotel.stephenweb.space   ║"
echo "║ 🔧 https://hotel-api.stephenweb.space║"
echo "║ 💻 http://localhost:5173            ║"
echo "╚══════════════════════════════════════╝"
echo ""
cloudflared tunnel --config cloudflared-simple.yml run 9b928fb8-36b6-45b7-a90c-ddf2950713af
