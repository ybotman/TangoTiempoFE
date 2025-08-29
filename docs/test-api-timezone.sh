#!/bin/bash

echo "========================================="
echo "TIEMPO-239: API Timezone Test"
echo "Testing event creation with venue timezone"
echo "========================================="
echo ""

# Get a test venue with timezone data
echo "1. Fetching NYC venue with timezone..."
NYC_VENUE=$(curl -s "http://localhost:3010/api/venues?appId=1&limit=1&city=New York" | jq -r '.data[0] | {id: ._id, name: .name, timezone: .timezone, timezoneAbbr: .timezoneAbbr}')

if [ "$NYC_VENUE" = "null" ]; then
    echo "❌ No NYC venue found. Trying any venue..."
    NYC_VENUE=$(curl -s "http://localhost:3010/api/venues?appId=1&limit=1" | jq -r '.data[0] | {id: ._id, name: .name, timezone: .timezone, timezoneAbbr: .timezoneAbbr}')
fi

echo "Venue found:"
echo "$NYC_VENUE" | jq .
echo ""

# Check if venue has timezone data
VENUE_TZ=$(echo "$NYC_VENUE" | jq -r '.timezone')
if [ "$VENUE_TZ" = "null" ] || [ -z "$VENUE_TZ" ]; then
    echo "⚠️  Warning: Venue has no timezone data"
    echo "   Backend may not have CALBE-43 implemented yet"
else
    echo "✅ Venue has timezone: $VENUE_TZ"
fi
echo ""

# Test event data endpoint
echo "2. Fetching recent event with display times..."
RECENT_EVENT=$(curl -s "http://localhost:3010/api/events?appId=1&limit=1" | jq -r '.data[0] | {
    title: .title,
    startDate: .startDate,
    displayStartTime: .displayStartTime,
    displayEndTime: .displayEndTime,
    timezoneAbbr: .timezoneAbbr,
    venueTimezone: .venueTimezone,
    hasTimezoneData: .hasTimezoneData
}')

echo "Recent event:"
echo "$RECENT_EVENT" | jq .
echo ""

# Check for display fields
DISPLAY_START=$(echo "$RECENT_EVENT" | jq -r '.displayStartTime')
if [ "$DISPLAY_START" = "null" ] || [ -z "$DISPLAY_START" ]; then
    echo "⚠️  Warning: Event has no displayStartTime"
    echo "   Backend CALBE-43 may not be fully implemented"
else
    echo "✅ Event has displayStartTime: $DISPLAY_START"
fi

echo ""
echo "========================================="
echo "Test Complete!"
echo "========================================="