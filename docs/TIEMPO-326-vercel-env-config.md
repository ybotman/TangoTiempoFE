# TIEMPO-326: Vercel Environment Variable Configuration

**JIRA**: https://hdtsllc.atlassian.net/browse/TIEMPO-326

**Issue**: PROD Vercel deployment writing to wrong MongoDB database (TangoTiempo instead of TangoTiempoProd)

**Priority**: High - Production data integrity issue

---

## Problem Statement

**Current State:**
- PROD Vercel → Uses default AF URL → Connects to TEST database ❌
- TEST Vercel → Uses default AF URL → Connects to TEST database ✅ (by accident)
- DEV local → Uses localhost:7071 → Connects to TEST database ✅

**Result:** Production data mixed with test data in TangoTiempo database

---

## Root Cause

Frontend (Vercel) needs different `NEXT_PUBLIC_AF_URL` values for each environment to route to the correct Azure Functions backend, which in turn connects to the correct MongoDB database.

**Backend is already configured correctly:**
- PROD Azure Functions → TangoTiempoProd database ✅
- TEST Azure Functions → TangoTiempo database ✅

**Frontend is missing environment-specific configuration.**

---

## Solution

Configure `NEXT_PUBLIC_AF_URL` in Vercel Dashboard for each environment.

### Environment Configuration

| Environment | Variable | Value | MongoDB Database |
|---|---|---|---|
| **Production** | `NEXT_PUBLIC_AF_URL` | `https://calendarbeaf-prod.azurewebsites.net` | TangoTiempoProd ✅ |
| **Preview** | `NEXT_PUBLIC_AF_URL` | `https://calendarbeaf-test.azurewebsites.net` | TangoTiempo ✅ |
| **Development** | `NEXT_PUBLIC_AF_URL` | `http://localhost:7071` | TangoTiempo (local) ✅ |

---

## Implementation Steps

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select project: `tangotiempo` (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar

### Step 2: Add/Update Production Environment

1. Check if `NEXT_PUBLIC_AF_URL` exists for **Production**
2. If exists: Click **Edit** → Update value
3. If not exists: Click **Add New**

**Configuration:**
```
Key: NEXT_PUBLIC_AF_URL
Value: https://calendarbeaf-prod.azurewebsites.net
Environment: Production (checked)
```

Click **Save**

### Step 3: Add/Update Preview Environment

**Configuration:**
```
Key: NEXT_PUBLIC_AF_URL
Value: https://calendarbeaf-test.azurewebsites.net
Environment: Preview (checked)
```

Click **Save**

### Step 4: Add/Update Development Environment

**Configuration:**
```
Key: NEXT_PUBLIC_AF_URL
Value: http://localhost:7071
Environment: Development (checked)
```

Click **Save**

### Step 5: Redeploy Environments

**Production:**
1. Go to **Deployments** tab
2. Find latest PROD deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Confirm redeploy

**Preview/TEST:**
1. Push to TEST branch (triggers automatic deployment)
2. Or manually redeploy from Deployments tab

---

## Verification Steps

### Test PROD Environment

1. **Trigger an event that writes to MongoDB:**
   - Login to https://tangotiempo.com (PROD)
   - Perform action (login tracking, visitor tracking, etc.)

2. **Check MongoDB TangoTiempoProd database:**
   ```bash
   # Connect to MongoDB
   mongosh "mongodb+srv://tangotiem-prod.cluster.mongodb.net/TangoTiempoProd"

   # Check UserLoginHistory
   db.UserLoginHistory.find().sort({ timestamp: -1 }).limit(1)

   # Verify timestamp is recent
   ```

3. **Expected Result:** New data appears in **TangoTiempoProd** ✅

### Test TEST/Preview Environment

1. **Trigger event on TEST:**
   - Login to https://tangotiempo-test.vercel.app (or preview URL)
   - Perform action

2. **Check MongoDB TangoTiempo database:**
   ```bash
   # Connect to TEST database
   mongosh "mongodb+srv://tangotiem-test.cluster.mongodb.net/TangoTiempo"

   # Check UserLoginHistory
   db.UserLoginHistory.find().sort({ timestamp: -1 }).limit(1)
   ```

3. **Expected Result:** New data appears in **TangoTiempo** ✅

---

## Affected Collections

All tracking collections will now write to correct database:

**Production (TangoTiempoProd):**
- UserLoginHistory
- UserLoginAnalytics
- VisitorTrackingHistory
- VisitorTrackingAnalytics

**TEST (TangoTiempo):**
- UserLoginHistory
- UserLoginAnalytics
- VisitorTrackingHistory
- VisitorTrackingAnalytics

---

## Backend Status

✅ **Already Configured Correctly**

Backend Azure Functions are properly configured:

**PROD (`calendarbeaf-prod.azurewebsites.net`):**
- Environment variable: `MONGODB_URI` → TangoTiempoProd connection string
- Verified: Writes to TangoTiempoProd ✅

**TEST (`calendarbeaf-test.azurewebsites.net`):**
- Environment variable: `MONGODB_URI` → TangoTiempo connection string
- Verified: Writes to TangoTiempo ✅

---

## Timeline

- **Step 1-4**: 5 minutes (add environment variables)
- **Step 5**: 5-10 minutes (redeploy both environments)
- **Verification**: 5 minutes (test and verify)

**Total**: ~20 minutes

---

## Rollback Plan

If issues occur after deployment:

1. **Immediate**: Revert environment variable to previous value
2. **Redeploy** PROD environment
3. **Investigate**: Check Vercel deployment logs
4. **Test locally**: Verify AF URL is correct

---

## Related Tickets

- **TIEMPO-323**: User Login and Visitor Tracking (uses these endpoints)
- **TIEMPO-313**: Frontend Integration: Visitor & Login Tracking
- **CALBEAF-53**: Add IP address field to tracking collections (backend)

---

## Success Criteria

✅ PROD Vercel writes to TangoTiempoProd database
✅ TEST/Preview Vercel writes to TangoTiempo database
✅ No production data in test database
✅ No test data in production database
✅ All 4 tracking collections work correctly in both environments

---

**Updated**: 2025-10-22
**Status**: Ready to implement
**Assignee**: Frontend team (Sarah/Gotan)
