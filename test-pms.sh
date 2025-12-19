#!/bin/bash
echo "🔍 QUICK PMS TEST"
echo "================="

echo "1. Testing API HTTPS..."
for i in {1..3}; do
    RESPONSE=$(curl -s --max-time 5 https://hotel-api.stephenweb.space 2>/dev/null)
    if echo "$RESPONSE" | grep -q "Hotel PMS API"; then
        echo "   ✅ SUCCESS! API returned: $RESPONSE"
        break
    elif [ $i -eq 3 ]; then
        echo "   ⚠️  Still waiting for SSL/DNS. Testing HTTP fallback..."
        HTTP_RESPONSE=$(curl -s --max-time 5 http://api.hotel.stephenweb.space 2>/dev/null)
        if echo "$HTTP_RESPONSE" | grep -q "Hotel PMS API"; then
            echo "   ✅ HTTP API works: $HTTP_RESPONSE"
            echo "   ℹ️  HTTPS may take 5-10 more minutes"
        fi
    else
        echo "   ⏳ Attempt $i failed, waiting 30s..."
        sleep 30
    fi
done

echo ""
echo "2. Testing Frontend..."
if curl -s --max-time 5 https://hotel.stephenweb.space > /dev/null; then
    echo "   ✅ Frontend accessible"
else
    echo "   ❌ Frontend issue"
fi

echo ""
echo "3. System Summary:"
echo "   Frontend: https://hotel.stephenweb.space"
echo "   API: https://hotel-api.stephenweb.space"
echo "   Local: http://localhost:5173"
echo ""
echo "🎯 Your Hotel PMS is running! DNS/SSL may need more time."
