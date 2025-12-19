#!/bin/bash
echo "🔄 RESTARTING HOTEL PMS"
echo "======================"

# Stop everything
echo "Stopping services..."
pkill -f "node server.js" 2>/dev/null && echo "✓ Backend"
pkill -f "vite" 2>/dev/null && echo "✓ Frontend"
pkill -f "cloudflared.*9b928fb8" 2>/dev/null && echo "✓ Tunnel"
sleep 5

echo "Waiting for cleanup..."
sleep 3

# Start MERN
echo ""
echo "Starting MERN stack..."
npm run dev > /dev/null 2>&1 &
echo "Waiting 15 seconds for servers..."
sleep 15

# Verify local
echo ""
echo "Local verification:"
curl -s http://localhost:5000 | grep -q "Hotel PMS API" && echo "✓ Backend: localhost:5000" || echo "✗ Backend failed"
curl -s http://localhost:5173 | grep -q "hotel-pms" && echo "✓ Frontend: localhost:5173" || echo "✗ Frontend failed"

# Start tunnel
echo ""
echo "Starting Cloudflare tunnel..."
sleep 5
cd server
echo ""
echo "✅ SYSTEM RESTARTED"
echo "🌐 https://hotel.stephenweb.space"
echo "🔧 https://hotel-api.stephenweb.space"
echo ""
cloudflared tunnel --config cloudflared-simple.yml run 9b928fb8-36b6-45b7-a90c-ddf2950713af
