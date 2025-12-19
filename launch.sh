#!/bin/bash
# ===========================================
# 🏨 HOTEL PMS - PRODUCTION LAUNCH
# ===========================================

echo "╔══════════════════════════════════════╗"
echo "║        HOTEL PMS STARTUP            ║"
echo "╚══════════════════════════════════════╝"

# 1. STOP EVERYTHING
echo ""
echo "🛑 Stopping existing services..."
pkill -f "node server.js" 2>/dev/null && echo "  ✓ Backend stopped"
pkill -f "vite" 2>/dev/null && echo "  ✓ Frontend stopped"
pkill -f "cloudflared.*9b928fb8" 2>/dev/null && echo "  ✓ Tunnel stopped"
sleep 3

# 2. SET API URL (HTTPS - new domain)
echo ""
echo "🔧 Configuring API endpoint..."
cd client
echo "VITE_API_URL=https://hotel-api.stephenweb.space/api" > .env.production
echo "  ✓ API: https://hotel-api.stephenweb.space/api"
cd ..

# 3. START MERN
echo ""
echo "🚀 Starting MERN stack..."
npm run dev > /tmp/hotel-pms.log 2>&1 &
echo "  ⏳ Waiting 15 seconds for servers..."
sleep 15

# 4. VERIFY LOCAL
echo ""
echo "🔍 Checking local servers..."
if curl -s http://localhost:5000 | grep -q "Hotel PMS API"; then
    echo "  ✓ Backend: http://localhost:5000"
else
    echo "  ✗ Backend failed - check logs"
    exit 1
fi

if curl -s http://localhost:5173 | grep -q "hotel-pms"; then
    echo "  ✓ Frontend: http://localhost:5173"
else
    echo "  ✗ Frontend failed - check logs"
    exit 1
fi

# 5. START TUNNEL
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
echo "  Tunnel: 9b928fb8-36b6-45b7-a90c-ddf2950713af"
echo "  Config: cloudflared-simple.yml"
sleep 5

cd server
echo ""
echo "╔══════════════════════════════════════╗"
echo "║        ✅ SYSTEM READY              ║"
echo "╠══════════════════════════════════════╣"
echo "║ 🌐 Frontend: https://hotel.stephenweb.space"
echo "║ 🔧 API:     https://hotel-api.stephenweb.space"
echo "║ 💻 Local:   http://localhost:5173"
echo "╚══════════════════════════════════════╝"
echo ""
echo "📝 Note: DNS may take 2-5 minutes to propagate"
echo "🔄 Run ./status.sh to check when ready"
echo ""

# Run tunnel
cloudflared tunnel --config cloudflared-simple.yml run 9b928fb8-36b6-45b7-a90c-ddf2950713af
