#!/bin/bash
echo "🔍 Hotel PMS Health Check"
echo "========================"

echo "1. Local Services:"
if curl -s http://localhost:5000 > /dev/null; then
    echo "   ✅ Backend: http://localhost:5000"
else
    echo "   ❌ Backend down"
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Frontend: http://localhost:5173"
else
    echo "   ❌ Frontend down"
fi

echo ""
echo "2. Tunnel Status:"
TUNNEL_STATUS=$(cloudflared tunnel info 9b928fb8-36b6-45b7-a90c-ddf2950713af 2>&1 | grep -o "HEALTHY\|DEGRADED\|Inactive")
if [[ "$TUNNEL_STATUS" == "HEALTHY" ]]; then
    echo "   ✅ Tunnel is $TUNNEL_STATUS"
elif [[ -n "$TUNNEL_STATUS" ]]; then
    echo "   ⚠️  Tunnel is $TUNNEL_STATUS"
else
    echo "   ❌ Tunnel not running"
fi

echo ""
echo "3. Public Access:"
if curl -s --max-time 5 https://hotel.stephenweb.space > /dev/null; then
    echo "   ✅ https://hotel.stephenweb.space"
else
    echo "   ❌ Frontend domain"
fi

if curl -s --max-time 5 https://api.hotel.stephenweb.space > /dev/null; then
    echo "   ✅ https://api.hotel.stephenweb.space"
else
    echo "   ❌ API domain"
fi

echo ""
echo "📊 Health check complete!"
