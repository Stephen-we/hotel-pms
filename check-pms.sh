#!/bin/bash
echo "🏨 HOTEL PMS STATUS"
echo "══════════════════════════════════════"

# 1. SERVICES
echo "1. SERVICES:"
if ps aux | grep -q "node server.js"; then
    echo "   ✓ Backend running"
else
    echo "   ✗ Backend stopped"
fi
if ps aux | grep -q "vite"; then
    echo "   ✓ Frontend running"
else
    echo "   ✗ Frontend stopped"
fi
if ps aux | grep -q "cloudflared.*9b928fb8"; then
    echo "   ✓ Tunnel running"
else
    echo "   ✗ Tunnel stopped"
fi

# 2. DNS
echo ""
echo "2. DNS RESOLUTION:"
echo -n "   hotel.stephenweb.space: "
HOTEL_IP=$(dig +short hotel.stephenweb.space 2>/dev/null | head -1)
[ -n "$HOTEL_IP" ] && echo "✓ $HOTEL_IP" || echo "✗"

echo -n "   hotel-api.stephenweb.space: "
API_IP=$(dig @1.1.1.1 +short hotel-api.stephenweb.space 2>/dev/null | head -1)
if [ -n "$API_IP" ]; then
    echo "✓ $API_IP (Cloudflare DNS)"
else
    echo "✗ (propagating...)"
fi

# 3. PUBLIC ACCESS
echo ""
echo "3. PUBLIC ACCESS:"
echo -n "   Frontend: "
if curl -s --max-time 5 https://hotel.stephenweb.space > /dev/null; then
    echo "✓ https://hotel.stephenweb.space"
else
    echo "✗"
fi

echo -n "   API: "
if [ -n "$API_IP" ]; then
    if curl -s --max-time 5 --dns-servers 1.1.1.1 https://hotel-api.stephenweb.space | grep -q "Hotel PMS API"; then
        echo "✓ https://hotel-api.stephenweb.space"
    else
        echo "⚠️ DNS ready, testing connection..."
    fi
else
    echo "⏳ DNS propagating..."
fi

echo ""
echo "🕐 $(date +%H:%M:%S) | Run every 2 min to track DNS"
