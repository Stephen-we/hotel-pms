#!/bin/bash
echo "�� HOTEL PMS STATUS CHECK"
echo "══════════════════════════════════════"

# 1. ACTIVE SERVICES
echo "1. ACTIVE SERVICES:"
if ps aux | grep -q "node server.js"; then
    echo "   ✅ Backend running (localhost:5000)"
else
    echo "   ❌ Backend stopped"
fi

if ps aux | grep -q "vite"; then
    echo "   ✅ Frontend running (localhost:5173)"
else
    echo "   ❌ Frontend stopped"
fi

if ps aux | grep -q "cloudflared.*9b928fb8"; then
    echo "   ✅ Cloudflare Tunnel running"
    CONN_INFO=$(cloudflared tunnel info 9b928fb8-36b6-45b7-a90c-ddf2950713af 2>/dev/null)
    if echo "$CONN_INFO" | grep -q "CONNECTOR ID"; then
        echo "   🔗 Tunnel connections established"
    fi
else
    echo "   ❌ Tunnel stopped"
fi

# 2. LOCAL ACCESS
echo ""
echo "2. LOCAL ACCESS:"
echo -n "   Backend: "
if curl -s --max-time 3 http://localhost:5000 | grep -q "Hotel PMS API"; then
    echo "✅ http://localhost:5000"
else
    echo "❌ Not responding"
fi

echo -n "   Frontend: "
if curl -s --max-time 3 http://localhost:5173 | grep -q "hotel-pms"; then
    echo "✅ http://localhost:5173"
else
    echo "❌ Not responding"
fi

# 3. DNS RESOLUTION
echo ""
echo "3. DNS RESOLUTION:"
echo -n "   hotel.stephenweb.space: "
HOTEL_IP=$(dig +short hotel.stephenweb.space 2>/dev/null | head -1)
if [ -n "$HOTEL_IP" ]; then
    echo "✅ $HOTEL_IP"
else
    echo "❌ Not resolving"
fi

echo -n "   hotel-api.stephenweb.space: "
API_IP=$(dig +short hotel-api.stephenweb.space 2>/dev/null | head -1)
if [ -n "$API_IP" ]; then
    echo "✅ $API_IP"
else
    echo "⏳ Not yet resolving (checking Cloudflare DNS...)"
    CF_IP=$(dig @1.1.1.1 +short hotel-api.stephenweb.space 2>/dev/null | head -1)
    [ -n "$CF_IP" ] && echo "   ℹ️  Cloudflare DNS resolves: $CF_IP"
fi

# 4. PUBLIC ACCESS
echo ""
echo "4. PUBLIC ACCESS:"
echo -n "   Frontend (https://hotel.stephenweb.space): "
if timeout 5 curl -s -o /dev/null -w "%{http_code}" https://hotel.stephenweb.space 2>/dev/null | grep -q "200\|304"; then
    echo "✅ Accessible"
else
    echo "❌ Unreachable (tunnel may need time)"
fi

echo -n "   API (https://hotel-api.stephenweb.space): "
API_RESPONSE=$(timeout 5 curl -s https://hotel-api.stephenweb.space 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "Hotel PMS API"; then
    echo "✅ Working: \"$API_RESPONSE\""
elif [ -n "$API_RESPONSE" ]; then
    echo "⚠️  Responds: \"$API_RESPONSE\""
else
    echo "⏳ Testing..."
    # Try HTTP as fallback
    HTTP_RESPONSE=$(timeout 5 curl -s http://api.hotel.stephenweb.space 2>/dev/null)
    if echo "$HTTP_RESPONSE" | grep -q "Hotel PMS API"; then
        echo "   ℹ️  HTTP API works: \"$HTTP_RESPONSE\""
    fi
fi

echo ""
echo "🕐 Checked at: $(date +%H:%M:%S)"
echo "💡 DNS/SSL can take 5-15 minutes to fully propagate"
