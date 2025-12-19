#!/bin/bash
echo "==============================================="
echo "🏨 HOTEL PMS - COMPLETE STARTUP"
echo "==============================================="

# 1. CLEANUP
echo "🧹 Stopping existing processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f cloudflared 2>/dev/null
sleep 3

# 2. FIX API URL (TEMPORARY - HTTP until SSL fixed)
echo ""
echo "🔧 Configuring API URL (using HTTP temporarily)..."
cd client
echo "VITE_API_URL=http://api.hotel.stephenweb.space/api" > .env.production
echo "✅ Production API URL set to HTTP"
cd ..

# 3. START MERN STACK
echo ""
echo "🚀 Starting MERN development servers..."
npm run dev &
MERN_PID=$!
echo "⏳ Waiting for servers to start (15 seconds)..."
sleep 15

# 4. VERIFY LOCAL SERVERS
echo ""
echo "🔍 Verifying local servers:"
if curl -s http://localhost:5000 | grep -q "Hotel PMS API"; then
    echo "✅ Backend: http://localhost:5000"
else
    echo "❌ Backend failed"
    exit 1
fi
if curl -s http://localhost:5173 | grep -q "hotel-pms"; then
    echo "✅ Frontend: http://localhost:5173"
else
    echo "❌ Frontend failed"
    exit 1
fi

# 5. START CLOUDFLARE TUNNEL (WITH CORRECT FLAG)
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
echo "📊 Tunnel ID: 9b928fb8-36b6-45b7-a90c-ddf2950713af"
sleep 5
cd server
cloudflared tunnel --config cloudflared-final.yml run --loglevel info
