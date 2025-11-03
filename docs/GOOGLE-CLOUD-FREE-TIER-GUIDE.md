# Google Cloud Free Tier Guide - Geolocation API

**Updated:** 2025-11-01
**Project:** TangoTiempoProd
**Critical:** New pricing model as of March 1, 2025

---

## 🎯 Current Free Tier (As of March 2025)

**Geolocation API:**
```
First 10,000 requests/month: FREE
After 10,000: $5 per 1,000 requests

No more $200 monthly credit!
```

**Daily Budget to Stay Free:**
```
10,000 / 30 days = 333 requests/day maximum
```

---

## 📍 Where to Find Free Tier Info in Google Cloud Console

### Option 1: Pricing Calculator (Official Rates)

1. **Go to:** https://cloud.google.com/products/calculator
2. **Search for:** "Geolocation API"
3. **You'll see:**
   ```
   Geolocation API
   Monthly free quota: 10,000 requests
   Price after quota: $5.00 per 1,000 requests
   ```

---

### Option 2: API-Specific Pricing Page

1. **Go to:** https://developers.google.com/maps/documentation/geolocation/usage-and-billing
2. **Look for table:**
   ```
   SKU: Geolocation
   Free Usage: 0-10,000 requests/month (no charge)
   Price: $5.00 per 1,000 requests
   ```

---

### Option 3: Your Actual Billing Report

1. **Go to:** https://console.cloud.google.com/billing/reports
2. **Select:** TangoTiempoProd project
3. **Filter by:**
   - Service: "Geolocation API"
   - Time range: "October 2025"
4. **Look at Usage column:**
   ```
   Total requests: 45,286
   Billable requests: 45,286 - 10,000 = 35,286
   Cost: 35,286 × $5/1K = $176.43 ✓
   ```

**This confirms:**
- ✅ Free tier: 10,000 requests
- ✅ You used: 45,286 requests
- ✅ Overage: 35,286 requests
- ✅ Charged: $176.43

---

## 🛡️ How to Stay Under Free Tier (10K/month)

### Strategy: 48-Hour Server-Side Cache

**Current State (Before Hot Fix):**
```
Daily API calls: 3,234
Monthly: 97,020 calls
Overage: 87,020 calls
Cost: $435/month
```

**After Hot Fix (Now):**
```
Daily API calls: 0
Monthly: 0 calls
Cost: $0/month ✅
```

**With 48-Hour Cache (Recommended):**
```
Unique visitors/day: ~400
Each visitor cached for 48 hours
Daily API calls: 400 / 2 = 200 calls/day
Monthly: 6,000 calls
Cost: $0/month ✅ (under 10K free tier)
```

---

## 🚨 Set Hard Quota to Prevent Overage

### Go to Quotas Page

1. **Direct Link:** https://console.cloud.google.com/apis/api/geolocation.googleapis.com/quotas?project=tangotiempoprod

2. **Or Navigate:**
   - Console → APIs & Services
   - Click "Geolocation API"
   - Click "Quotas & System Limits"

3. **Find:** "Requests per day per project"

4. **Click "Edit Quotas"** (pencil icon)

5. **Set New Limit:**
   ```
   Current: Unlimited (or 10,000+)
   New Value: 333 (to stay under 10K/month)

   Calculation: 10,000 / 30 days = 333/day
   ```

6. **Click "Submit"**

7. **Result:**
   - After 333 calls in a day, API returns error
   - No more surprise bills!
   - Error: "Quota exceeded for quota metric 'Queries per day'"

---

## 📊 Monitor Your Usage Daily

### Billing Reports (Historical)

1. **Go to:** https://console.cloud.google.com/billing/reports
2. **Filter:**
   - Time: "Last 7 days"
   - Service: "Geolocation API"
3. **Chart shows:**
   - Daily usage
   - Cumulative cost
   - Trend line

---

### Quotas Dashboard (Real-Time)

1. **Go to:** https://console.cloud.google.com/apis/dashboard
2. **Select:** TangoTiempoProd
3. **Look at:** "Traffic" section
   ```
   Geolocation API
   Today: X requests (limit: 333)
   Last 30 days: Y requests
   ```

---

### Set Up Budget Alerts

1. **Go to:** https://console.cloud.google.com/billing/budgets
2. **Click:** "Create Budget"
3. **Configure:**
   ```
   Name: Geolocation API Budget
   Projects: TangoTiempoProd
   Services: Geolocation API
   Budget amount: $10/month
   Alerts: 50%, 90%, 100%
   Email: your@email.com
   ```

4. **Note:** Budget alerts DON'T stop spending, they just notify you. Hard quota stops spending.

---

## 📋 Daily Monitoring Checklist

### Every Day for First Week:

**Morning Check:**
```
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Check: Geolocation API calls today
3. Target: <333 calls/day
4. If >300: Investigate why
```

**Evening Check:**
```
1. Go to: https://console.cloud.google.com/billing/reports
2. Filter: Today, Geolocation API
3. Check: Cost should be $0.00
4. If >$0: Check if quota exceeded
```

---

## 🎯 What "Free Tier" Means in 2025

### Old Model (Pre-March 2025):
```
✅ $200/month credit
✅ Applies to ALL Maps APIs combined
✅ Shows as "Credit" in billing

Example:
- Maps SDK: $100
- Geolocation: $150
- Total: $250
- Credit: -$200
- You pay: $50
```

### New Model (March 2025+):
```
✅ Per-API free usage quotas
✅ Does NOT show as "Credit"
✅ Automatic - no opt-in needed

Example:
- Geolocation: 12,000 calls
- Free tier: 10,000 calls
- Overage: 2,000 calls
- Cost: 2,000 × $5/1K = $10

You pay: $10 (no credit applied)
```

---

## 🔍 Why You Don't See "Free Tier" in Console

**Answer:** It's not labeled "Free Tier" or "Credit"

**Instead, look for:**

1. **In Pricing Docs:**
   - "Monthly free quota: 10,000 requests"
   - "No charge" tier

2. **In Billing Reports:**
   - First 10K requests show as $0.00
   - Remaining requests show actual cost

3. **In Quotas:**
   - No explicit "free tier" label
   - Just set daily limit to 333 to stay under 10K/month

---

## 💡 Verification Steps

### Test #1: Check Pricing Page
```
URL: https://mapsplatform.google.com/pricing/
Look for: "Geolocation API" section
Should show: "First 10,000 requests/month - No charge"
```

### Test #2: Check Your Bill
```
Go to: Billing → Reports
Filter: October 2025, Geolocation API
Math:
  Total requests: 45,286
  Minus free tier: -10,000
  Billable: 35,286
  Cost: 35.286 × $5 = $176.43 ✓ (matches your bill)
```

### Test #3: Set Quota to 333/day
```
Go to: Quotas page
Set: 333 requests/day
Result: Can't exceed 10K/month (333 × 30 = 9,990)
```

---

## 🚨 Action Items

### Immediate (Today):
- [x] Hot fix deployed - tracking disabled
- [ ] Set hard quota: 333/day in Google Cloud
- [ ] Verify quota saved successfully

### This Week:
- [ ] Monitor billing daily - should be $0
- [ ] Build server-side cache (48-hour TTL)
- [ ] Test cache in DEVL environment

### Next Week:
- [ ] Deploy cache to TEST
- [ ] Re-enable tracking with cache
- [ ] Monitor usage: target <200 calls/day

### Ongoing:
- [ ] Check usage daily (first month)
- [ ] Review monthly bill
- [ ] Adjust cache TTL if needed (48h → 72h)

---

## 📚 Official Documentation Links

1. **Geolocation API Pricing:**
   https://developers.google.com/maps/documentation/geolocation/usage-and-billing

2. **Maps Platform Pricing:**
   https://mapsplatform.google.com/pricing/

3. **Quotas & Limits:**
   https://console.cloud.google.com/apis/api/geolocation.googleapis.com/quotas

4. **Billing Reports:**
   https://console.cloud.google.com/billing/reports

5. **Budget Alerts:**
   https://console.cloud.google.com/billing/budgets

---

## ✅ Success Criteria

**You're staying in free tier when:**
```
✅ Daily calls: <333
✅ Monthly calls: <10,000
✅ Monthly bill: $0.00
✅ Hard quota set: 333/day
✅ Cache hit rate: >60%
```

**Red flags:**
```
❌ Daily calls: >333
❌ Monthly bill: >$0
❌ Quota errors in logs
❌ No cache implemented
```

---

**Generated:** 2025-11-01
**For:** GotanMan / TangoTiempoProd
**Purpose:** Stay under 10K/month free tier
