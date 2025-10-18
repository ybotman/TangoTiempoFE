# Azure Functions Integration Guide

**For**: Frontend Developers
**Purpose**: Integrate Azure Functions monitoring into service status grid
**Created**: 2025-10-06
**Branch**: `feature/af-prep-monitoring`

---

## Overview

This document explains how the frontend monitors Azure Functions health status using the 3×3 service status grid.

---

## Azure Functions Endpoints

### Local Development
- **Base URL**: `http://localhost:7071`
- **Health**: `http://localhost:7071/api/health`
- **Swagger**: `http://localhost:7071/api/docs` (when available)
- **Events**: `http://localhost:7071/api/events?appId=1`
- **Venues**: `http://localhost:7071/api/venues?appId=1`

### Production
- **Base URL**: Set via `NEXT_PUBLIC_AF_URL` environment variable
- **Production URL**: `https://calendarbeaf-prod.azurewebsites.net`

---

## Frontend Configuration

### Environment Variables

**.env.local** (Development):
```env
# Azure Functions - defaults to localhost:7071
NEXT_PUBLIC_AF_ENABLED=false  # Set to true when AF is running
NEXT_PUBLIC_AF_URL=http://localhost:7071  # Optional, defaults to this
```

**Vercel Production** (Add via Vercel Dashboard):
```env
NEXT_PUBLIC_AF_ENABLED=true
NEXT_PUBLIC_AF_URL=https://calendarbeaf-prod.azurewebsites.net
```

### Adding Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **tangotiempo.com**
3. Go to **Settings** → **Environment Variables**
4. Add two variables:
   - `NEXT_PUBLIC_AF_ENABLED` = `true`
   - `NEXT_PUBLIC_AF_URL` = `https://calendarbeaf-prod.azurewebsites.net`
5. Select environment: **Production** (and optionally Preview)
6. Click **Save**
7. **Redeploy** your production site for changes to take effect

---

## Service Status Grid Behavior

### Development Mode (localhost)
When AF is running on `localhost:7071`:
- **AF Health dot**: 🟢 Green if healthy, ⚫ Gray if not started
- **AF Events dot**: 🟢 Green if endpoint exists, ⚫ Gray if coming soon
- **AF Venues dot**: 🟢 Green if endpoint exists, ⚫ Gray if coming soon

**Tooltip when NOT running**:
```
AF Health
Status: ○ disabled
Not running (start with: func start)
```

### Production Mode
When `NEXT_PUBLIC_AF_ENABLED=true`:
- **AF Health dot**: 🟢 Green if healthy, 🔴 Red if down
- **AF Events dot**: 🟢 Green if healthy, 🔴 Red if down
- **AF Venues dot**: 🟢 Green if healthy, 🔴 Red if down

---

## How It Works

### Health Check Logic

**File**: `src/app/hooks/useServiceHealth.js`

```javascript
const checkAzureFunctions = async () => {
  // Defaults to localhost:7071 for dev
  const afUrl = process.env.NEXT_PUBLIC_AF_URL || 'http://localhost:7071';

  // 1. Check AF Health endpoint
  const response = await fetch(`${afUrl}/api/health`);

  if (response.ok) {
    // AF is healthy - check Events and Venues
    checkAFEvents(afUrl);
    checkAFVenues(afUrl);
  }
};
```

### Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| `healthy` | 🟢 Green | Service is up and responding |
| `checking` | 🟠 Orange | Currently checking status |
| `error` | 🔴 Red | Service is down (production only) |
| `disabled` | ⚫ Gray | Service not configured/not running |

---

## Starting Azure Functions Locally

### Backend Developer:
```bash
cd calendar-be
func start  # Starts on localhost:7071
```

### Frontend Auto-Detection:
1. Frontend checks `localhost:7071/api/health` every 30 seconds
2. If AF is running: Grid shows 🟢 green dots
3. If AF is NOT running: Grid shows ⚫ gray dots with hint

---

## Testing the Integration

### 1. Without AF Running (Default)
```bash
npm run dev  # Start frontend only
```

**Expected Grid**:
```
Row 1: 🟢 🟢 🟢  (Express, Firebase, Mapbox - all green)
Row 2: 🟢 🟢 🟡  (MongoDB, GA, Geo - green + yellow)
Row 3: ⚫ ⚫ ⚫  (AF Health, Events, Venues - all gray)
```

### 2. With AF Running
```bash
# Terminal 1: Start backend AF
cd calendar-be && func start

# Terminal 2: Start frontend
npm run dev
```

**Expected Grid**:
```
Row 1: 🟢 🟢 🟢  (Express, Firebase, Mapbox)
Row 2: 🟢 🟢 🟡  (MongoDB, GA, Geo)
Row 3: 🟢 ⚫ ⚫  (AF Health green, Events/Venues gray until built)
```

### 3. When Events/Venues Are Built
Once backend implements `/api/events` and `/api/venues`:
```
Row 3: 🟢 🟢 🟢  (All AF services green)
```

---

## API Response Formats

### Health Endpoint
**Request**: `GET /api/health`

**Response** (ACTUAL from localhost:7071):
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T02:31:01.417Z",
  "service": "calendar-be-af",
  "environment": "development",
  "version": "1.0.0",
  "uptime": 159.77
}
```

**Status**: ✅ WORKING

### Events Endpoint (Future)
**Request**: `GET /api/events?appId=1&limit=1`

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 0,
    "pageSize": 1,
    "total": 234
  }
}
```

---

## Swagger Documentation

### Accessing API Docs
✅ **Swagger is LIVE!**

**Local**: `http://localhost:7071/api/docs`
**Production**: `https://your-af-url.azurewebsites.net/api/docs`

### Available Documentation
✅ **Health Check** - `/api/health` (System monitoring)
✅ **Health Version** - `/api/health/version` (Version info)
✅ **Categories** - `/api/categories` (Event categories)
✅ **Roles** - `/api/roles` (User roles)
✅ **Metrics** - `/api/metrics` (Observability)
🚧 **Events API** - `/api/calendars/{id}/events` (Coming soon)
🚧 **Venues API** - (Coming soon)

**Swagger JSON**: `http://localhost:7071/api/swagger.json`

---

## Troubleshooting

### Grid Shows Gray Dots for AF
**Problem**: All 3 AF dots are gray (⚫)

**Solutions**:
1. Check if Azure Functions is running: `lsof -i :7071`
2. Start AF: `cd calendar-be && func start`
3. Verify health endpoint: `curl http://localhost:7071/api/health`
4. Check browser console for CORS errors

### Grid Shows Red Dots for AF
**Problem**: AF Health dot is red (🔴)

**Solutions**:
1. Check AF server logs for errors
2. Verify MongoDB connection
3. Check network connectivity
4. Review Application Insights for errors

### Dots Never Update
**Problem**: Grid stuck on "checking" (🟠 orange)

**Solutions**:
1. Hard refresh browser (Cmd+Shift+R)
2. Check browser console for errors
3. Verify fetch requests in Network tab
4. Check if health endpoint is accessible

---

## Migration Strategy

### Phase 1: Monitoring Only (Current)
- Grid monitors AF health
- Shows green when running, gray when not
- No production traffic to AF

### Phase 2: A/B Testing
- Add `appId=test-af` parameter to route requests
- Compare Express vs AF performance
- Monitor metrics in grid

### Phase 3: Gradual Rollout
- Route increasing % of traffic to AF
- Monitor grid for any red dots
- Rollback if issues detected

### Phase 4: Full Migration
- All traffic to AF
- Express decommissioned
- Grid shows all AF services green

---

## Related Files

**Frontend**:
- `src/app/hooks/useServiceHealth.js` - Health check logic
- `src/app/components/DevTools/ServiceStatusGrid.js` - Visual grid
- `src/app/components/UI/SiteHeader.js` - Integration point

**Backend** (calendar-be):
- `src/functions/Health_Basic.js` - AF health endpoint
- `src/functions/Category_Get.js` - Example AF function
- `public/swagger.json` - API documentation (when ready)

---

## JIRA Tickets

- **CALBEAF-37**: Production Infrastructure & Readiness (Epic)
- **CALBEAF-38**: Observability Infrastructure
- **CALBEAF-40**: A/B Testing Implementation

---

## Questions?

Ask El Gotan or check:
- Backend Swagger docs: `http://localhost:7071/api/docs`
- Backend repo: `calendar-be/`
- This doc: `docs/AZURE-FUNCTIONS-INTEGRATION.md`
