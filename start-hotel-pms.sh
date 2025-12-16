#!/bin/bash

echo "🚀 Starting Hotel PMS Application..."
echo "📍 Frontend: https://hotel.stephenweb.space"
echo "📍 Backend API: https://api.hotel.stephenweb.space"
echo ""

echo "🔄 Cleaning up PMS-specific processes..."

# Kill only PMS backend
pkill -f "/home/Coding/stephen_project/pms/hotel-pms/server/server.js" 2>/dev/null

# Kill only PMS frontend (vite)
pkill -f "vite" 2>/dev/null
pkill -f "/home/Coding/stephen_project/pms/hotel-pms/client" 2>/dev/null

sleep 2

echo "📡 Starting backend server (port 5000)..."
cd /home/Coding/stephen_project/pms/hotel-pms/server
node -r dotenv/config server.js &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 7

if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

echo "⚛️ Starting React frontend (port 5173)..."
cd /home/Coding/stephen_project/pms/hotel-pms/client
npm run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 12

if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ React frontend started successfully"
else
    echo "❌ React frontend failed to start"
    exit 1
fi

echo "🌐 Starting Cloudflare tunnel..."
echo ""
echo "🎯 YOUR APPLICATION IS READY FOR CLIENT DEMO:"
echo "   • Frontend: https://hotel.stephenweb.space"
echo "   • Backend API: https://api.hotel.stephenweb.space"
echo ""
echo "📝 DNS may take 5–30 min"
echo "🔧 Local: http://localhost:5173, http://localhost:5000"
echo ""

cloudflared tunnel run hotel-pms
