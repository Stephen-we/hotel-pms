#!/bin/bash

echo "🚀 Starting Hotel PMS Application..."
echo "📍 Frontend: https://hotel.stephenweb.space"
echo "📍 Backend API: https://api.hotel.stephenweb.space"
echo ""

# Kill any existing processes on our ports
echo "🔄 Cleaning up existing processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Start backend server on port 5000
echo "📡 Starting backend server (port 5000)..."
cd /home/Coding/stephen_project/pms/hotel-pms/server
npm start &
BACKEND_PID=$!

# Wait for backend to initialize
echo "⏳ Waiting for backend to start..."
sleep 7

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend development server on port 5173
echo "⚛️  Starting React frontend (port 5173)..."
cd /home/Coding/stephen_project/pms/hotel-pms/client
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 12

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ React frontend started successfully"
else
    echo "❌ React frontend failed to start"
    exit 1
fi

# Start Cloudflare tunnel
echo "🌐 Starting Cloudflare tunnel..."
echo ""
echo "🎯 YOUR APPLICATION IS READY FOR CLIENT DEMO:"
echo "   • Frontend: https://hotel.stephenweb.space"
echo "   • Backend API: https://api.hotel.stephenweb.space"
echo ""
echo "📝 Note: DNS may take 5-30 minutes to fully propagate"
echo "🔧 Local access: http://localhost:5173 (frontend), http://localhost:5000 (backend)"
echo ""

# Start Cloudflare tunnel (this will block)
cloudflared tunnel run hotel-pms
