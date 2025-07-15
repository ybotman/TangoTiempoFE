# CloudFlare Geolocation Setup Guide

## Overview
CloudFlare provides IP-based geolocation through HTTP headers added to all requests that pass through their network.

## Available Headers by Plan

### Free Plan
- `CF-IPCountry`: Two-letter country code (e.g., "US", "GB", "JP")
- `CF-Connecting-IP`: Visitor's IP address
- `CF-Ray`: Unique request identifier
- `CF-Visitor`: Protocol information (HTTP/HTTPS)

### Enterprise Plan Only
- `CF-IPCity`: City name
- `CF-IPContinent`: Continent code
- `CF-Timezone`: Timezone
- `CF-Region`: Region/state
- `CF-IPLat`: Latitude
- `CF-IPLon`: Longitude
- `CF-Postal-Code`: Postal code

## Setup Instructions

### 1. Enable IP Geolocation in CloudFlare

#### Option A: Using CloudFlare Dashboard
1. Log in to [CloudFlare Dashboard](https://dash.cloudflare.com)
2. Select your domain (tangotiempo.com)
3. Go to Network → IP Geolocation
4. Toggle ON

#### Option B: Using API Script
```bash
# Set your CloudFlare API token
export CLOUDFLARE_API_TOKEN="your-token-here"

# Run the enable script
node scripts/enable-cloudflare-geo.js
```

### 2. Verify Headers are Working

#### In Production (Vercel)
- Deploy to Vercel
- Visit the site
- Open Debug Menu → CloudFlare tab
- You should see at least Country data

#### Local Development
CloudFlare headers are NOT available in local development because:
- localhost doesn't go through CloudFlare's network
- Headers are only added to requests that pass through CloudFlare

To test locally, you can:
1. Use a production/staging URL
2. Use ngrok to tunnel your local server through CloudFlare
3. Manually set test headers in browser DevTools

## Current Implementation

### Middleware (`/middleware.js`)
- Captures all CloudFlare headers
- Stores in `cf-geo-data` cookie
- Processes on every request

### Hook (`/src/app/hooks/useCloudFlareData.js`)
- Reads geolocation data from cookie
- Formats for display
- Handles missing data gracefully

### Debug Component (`/src/app/components/Modals/Debug/CloudFlareDebug.js`)
- Displays available geolocation data
- Shows plan limitations
- Provides raw data view

## Limitations

### Free Plan
- Only country-level data available
- No city, coordinates, or timezone
- Sufficient for basic geo-targeting

### Enterprise Plan Required For
- City-level targeting
- Precise coordinates
- Timezone detection
- Regional/state data

## Alternative Solutions for City Data

If you need city-level data without Enterprise plan:

1. **Client-side Geolocation API**
   - Requires user permission
   - More accurate but privacy-sensitive

2. **Third-party IP Geolocation**
   - Services like ipapi.co, ipinfo.io
   - Backend API integration required
   - Rate limits apply

3. **CloudFlare Workers**
   - Custom worker to fetch geo data
   - Additional complexity
   - Possible additional costs

## Troubleshooting

### "No Data Available" in Debug Menu
1. Check if IP Geolocation is enabled in CloudFlare
2. Verify you're accessing through CloudFlare (not localhost)
3. Check browser console for cookie errors
4. Ensure middleware is processing all routes

### Missing City Data
- This is expected on Free plan
- Upgrade to Enterprise for city data
- Or implement alternative solution

## API Reference

### Enable IP Geolocation
```bash
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/settings/ip_geolocation" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"on"}'
```

### Check Current Setting
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/settings/ip_geolocation" \
     -H "Authorization: Bearer YOUR_API_TOKEN"
```