#!/bin/bash
echo "==============================================="
echo "🏨 HOTEL PMS - PRODUCTION STARTUP"
echo "==============================================="
echo "⚠️  IMPORTANT: Ensure Cloudflare SSL mode is 'Flexible'"
echo "   Dashboard → SSL/TLS → Overview → Change to 'Flexible'"
echo "==============================================="
echo ""

# 1. CLEANUP
echo "🧹 Cleaning up..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f cloudflared 2>/dev/null
sleep 3

# 2. START MERN
echo ""
echo "🚀 Starting MERN stack..."
cd /home/Coding/stephen_project/pms/hotel-pms
npm run dev &
MERN_PID=$!
echo "⏳ Waiting 15 seconds for servers..."
sleep 15

# 3. VERIFY LOCAL
echo ""
echo "🔍 Verifying local servers..."
curl -s http://localhost:5000 | grep -q "Hotel PMS API" && echo "✅ Backend local:5000" || echo "❌ Backend failed"
curl -s http://localhost:5173 | grep -q "hotel-pms" && echo "✅ Frontend local:5173" || echo "❌ Frontend failed"

# 4. START TUNNEL
echo ""
echo "🌐 Starting Cloudflare Tunnel..."
cd server
cloudflared tunnel --config cloudflared-final.yml run --log-level info
