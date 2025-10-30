# Production Status Summary - 2025-10-24

**Created:** 2025-10-24
**Session Duration:** 20 minutes
**Status:** 🟡 WORKING BUT VULNERABLE

---

## 🚨 CRITICAL ISSUE: Google API Key Exposed

**Problem:** Google Geolocation API key is visible in browser console on production sites.

**Exposed Key:** `AIzaSyAdEQ9Yrqlg2jMbfhivF1PM2m1nTWTGDj0`

**Visible At:**
```javascript
POST https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAdEQ9Yrqlg2jMbfhivF1PM2m1nTWTGDj0
```

**Impact:**
- Anyone can open browser devtools and see the API key
- Key is restricted (HTTP referrers + API limits), but still vulnerable
- Explains recent Google API billing charges

---

## 📊 Current Deployment Status

### Git Branches

| Branch | Version | Commit | Status |
|--------|---------|--------|--------|
| **PROD** | v1.12.12 | c0e35cd | ✅ Old code, API key exposed |
| **TEST** | v1.12.18 | 7510119 | ❌ Backend proxy broken/timeout |
| **DEVL** | v1.12.18 | 7510119 | ❌ Same as TEST |

### Production Sites

| Domain | Status | Issue |
|--------|--------|-------|
| **tangotiempo.com** | 🟡 Working | API key exposed in browser |
| **bostontangocalendar.com** | 🟡 Working | API key exposed in browser |

**Note:** Unclear which branch is actually deployed to tangotiempo.com production - needs Vercel verification.

---

## 🔍 What We Discovered (3 Scenarios Tested)

### Scenario 1: bostontangocalendar.com (initial)
- ❌ CORS errors from Azure Functions backend (`calendarbeaf-prod.azurewebsites.net`)
- ❌ Backend missing `bostontangocalendar.com` in CORS allowlist
- ✅ Site still works (frontend features functional)
- 🚨 Google API key visible in console

### Scenario 2: bostontangocalendar.com (after CORS fix)
- ✅ Site fully functional
- ✅ Events, venues, categories load
- ✅ Visitor tracking works
- 🚨 Google API key still exposed (expected - using v1.12.12)

### Scenario 3: tangotiempo.com/calendar (fresh incognito)
- ✅ Site loads perfectly
- ✅ Map center popup works
- ✅ All features functional
- 🚨 Google API key exposed in browser console

---

## 📝 Root Cause Analysis

### The Security Migration (v1.12.18)

**Goal:** Move Google Geolocation API calls from frontend to Azure Functions backend proxy to hide API key.

**Changes Made:**
1. Commit 43ecaea: Removed hardcoded API keys from repository
2. Commit 7510119: Migrated Google Geolocation API to AFA backend proxy

**Problem:** Azure Functions backend proxy is **broken/timing out**

```javascript
// OLD (v1.12.12 - PROD) - Works but exposes key
fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`)

// NEW (v1.12.18 - TEST) - Secure but broken
fetch(`${afaUrl}/api/geo/google-geolocate`)  // ❌ TIMEOUT
```

**Result:** Can't deploy secure version (v1.12.18) because backend is broken.

---

## 🎯 Current Options

### Option 1: Keep Running (0 minutes) ⭐ RECOMMENDED FOR NOW
- Site is working on v1.12.12
- Accept temporary API key exposure
- **Action Required:** Ben (backend dev) needs to fix Azure Functions `/api/geo/google-geolocate` endpoint
- Once backend fixed, deploy TEST → PROD

**Pros:**
- No downtime
- Site fully functional
- Users unaffected

**Cons:**
- API key remains exposed
- Potential billing issues

### Option 2: Emergency Hotfix (10 minutes)
- Stay on PROD branch (v1.12.12)
- Create workaround for broken backend
- Deploy hotfix

**Pros:**
- Could reduce API exposure

**Cons:**
- Takes time
- May not fully solve security issue
- Site downtime during deployment

---

## 📋 Action Items

### Immediate (Sarah - Frontend)
- [x] Diagnose production issues
- [x] Verify git branch states
- [ ] **VERIFY:** Which branch deploys to tangotiempo.com in Vercel?
- [ ] Document findings in JIRA
- [ ] Create retrospective entry

### Backend Team (Ben)
- [ ] **URGENT:** Fix Azure Functions endpoint `/api/geo/google-geolocate`
  - Currently timing out
  - Needs to proxy Google Geolocation API calls
  - Must return correct response format
- [ ] Verify CORS configuration includes all production domains
- [ ] Test endpoint before notifying Sarah

### After Backend Fixed (Sarah)
- [ ] Test TEST branch (v1.12.18) on staging
- [ ] Verify API key no longer visible in browser
- [ ] Deploy TEST → PROD
- [ ] Verify production deployment
- [ ] Monitor Google API billing

---

## 🔧 Technical Details

### Files Involved

**Frontend (this repo):**
- `src/app/hooks/useServiceHealth.js:376-390` - Changed from direct API to backend proxy
- `src/app/test-google-api/page.js:18` - Removed hardcoded fallback key

**Backend (calendar-be/CALBE - Ben's domain):**
- Azure Functions endpoint: `/api/geo/google-geolocate`
- CORS configuration needs update

### Error Patterns

**Working (v1.12.12):**
```
✅ POST https://www.googleapis.com/geolocation/v1/geolocate?key=...
```

**Broken (v1.12.18):**
```
❌ POST https://calendarbeaf-prod.azurewebsites.net/api/geo/google-geolocate
Error: timeout of 15000ms exceeded
```

---

## 📚 Related Documentation

- Retrospective: `.ybotbot/retrospective-2025-10-23-api-security.md`
- Previous fix: Commit 43ecaea - "security: Remove hardcoded API keys"
- Migration commit: Commit 7510119 - "security: Migrate Google Geolocation API to AFA backend proxy"

---

## 🔐 Security Notes

**API Key Restrictions (good, but not enough):**
- ✅ HTTP Referrer restrictions: localhost:3001, tangotiempo.com, test.tangotiempo.com, bostontangocalendar.com
- ✅ API restrictions: Geocoding, Geolocation, Time Zone, Places APIs only

**Vulnerability:**
- Anyone can open browser console and see the key
- Can make API calls from allowed domains via console
- No rate limiting on our side

---

## 💡 Recommendations

1. **Immediate:** Run with exposed key until backend is fixed (accept risk)
2. **Short-term:** Ben fixes Azure Functions backend proxy (priority)
3. **Medium-term:** Consider additional rate limiting on frontend
4. **Long-term:** Implement API usage monitoring/alerts

---

**Next Update:** After Vercel deployment verification or backend fix

**Contact:**
- Frontend: Sarah (me)
- Backend: Ben
- Azure Functions: Fulton

---

_Last updated: 2025-10-24 by Sarah during emergency production diagnostic session_
