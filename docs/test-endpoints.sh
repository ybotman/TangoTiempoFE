#!/bin/bash

FIREBASE_ID="166SiZFoRLdzLSPKHfvWE12sYvB3"
API_BASE="http://localhost:3010/api"
APP_ID="1"

echo "Testing API endpoints for Firebase ID: $FIREBASE_ID"
echo "=================================================="

# Test GET endpoints
echo "\n\nTesting GET endpoints..."
echo "------------------------"

# Test optimized endpoint
echo "\nTesting GET /api/optimized-userlogins/firebase/$FIREBASE_ID"
curl -s -X GET "$API_BASE/optimized-userlogins/firebase/$FIREBASE_ID?appId=$APP_ID" -H "Content-Type: application/json" | head -c 100
echo "..."

# Test standard endpoint
echo "\nTesting GET /api/userlogins/firebase/$FIREBASE_ID"
curl -s -X GET "$API_BASE/userlogins/firebase/$FIREBASE_ID?appId=$APP_ID" -H "Content-Type: application/json" | head -c 100
echo "..."

# Test PUT endpoints
echo "\n\nTesting PUT endpoints..."
echo "------------------------"

USER_DATA='{
  "firebaseUserId": "'$FIREBASE_ID'",
  "appId": "'$APP_ID'",
  "localUserInfo": {
    "firstName": "Test",
    "lastName": "User-'$(date +%H%M%S)'"
  }
}'

echo "Using test data: $USER_DATA"

# Test 1: Standard updateUserInfo endpoint
echo "\nTesting PUT /api/userlogins/updateUserInfo"
curl -s -X PUT "$API_BASE/userlogins/updateUserInfo" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" | head -c 150
echo "..."

# Test 2: Firebase ID endpoint
echo "\nTesting PUT /api/userlogins/firebase/$FIREBASE_ID"
curl -s -X PUT "$API_BASE/userlogins/firebase/$FIREBASE_ID" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" | head -c 150
echo "..."

# Test 3: Root ID endpoint
echo "\nTesting PUT /api/userlogins/$FIREBASE_ID"
curl -s -X PUT "$API_BASE/userlogins/$FIREBASE_ID" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" | head -c 150
echo "..."

# Test 4: Optimized endpoint
echo "\nTesting PUT /api/optimized-userlogins/firebase/$FIREBASE_ID"
curl -s -X PUT "$API_BASE/optimized-userlogins/firebase/$FIREBASE_ID" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" | head -c 150
echo "..."

# Test 5: Root endpoint
echo "\nTesting PUT /api/userlogins"
curl -s -X PUT "$API_BASE/userlogins" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA" | head -c 150
echo "..."

echo "\n\nTesting completed"