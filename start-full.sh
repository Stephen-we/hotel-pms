#!/bin/bash
echo "==============================================="
echo "🏨 HOTEL PMS - PRODUCTION STARTUP"
echo "==============================================="
echo "📱 Frontend: https://hotel.stephenweb.space"
echo "🔧 Backend:  https://api.hotel.stephenweb.space"
echo "==============================================="

# 1. CLEANUP
echo ""
echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "cloudflared.*9b928fb8" 2>/dev/null
sleep 2

# 2. START MERN STACK
echo ""
echo "🚀 Starting MERN stack development servers..."
cd /home/Coding/stephen_project/pms/hotel-pms

# Check if concurrently is available, if not use fallback
if command -v concurrently &> /dev/null; then
    npm run dev &
    MERN_PID=$!
    echo "✅ Using concurrently for both servers"
else
    echo "⚠️  concurrently not found, starting servers individually..."
    cd server && npm run dev &
    cd ../client && npm run dev &
    MERN_PID=$(jobs -p)
    cd ..
fi

echo "⏳ Waiting for servers to initialize (15 seconds)..."
sleep 15

# Check if servers are running
if ps -p $MERN_PID > /dev/null 2>/dev/null; then
    echo "✅ MERN servers started successfully"
else
    echo "❌ MERN servers failed to start. Check logs above."
    exit 1
fi

# 3. START CLOUDFLARE TUNNEL
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
echo "📝 Tunnel ID: 9b928fb8-36b6-45b7-a90c-ddf2950713af"
echo "📁 Config: /home/Coding/stephen_project/pms/hotel-pms/server/cloudflared.yml"

# Run tunnel in foreground (script will block here)
cd server
cloudflared tunnel --config cloudflared.yml run
