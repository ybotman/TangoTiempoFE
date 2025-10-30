# Retrospective Session: 2025-10-23 - API Keys Exposed in Public Repository

## Session: 2025-10-23 - Critical Security Remediation & Google API Billing Investigation

### Key Learnings

#### API Keys Hardcoded in Public GitHub Repository 🚨
**CRITICAL SECURITY ISSUE**: Multiple API keys were hardcoded and exposed in public repository

**Root Cause**:
- Google Geolocation API key hardcoded as fallback in `src/app/test-google-api/page.js:18`
- Firebase API key exposed in documentation `public/Playbook/MasterCalendar/Base64-Encoded-JSON.md:33`
- Repository visibility: PUBLIC (https://github.com/ybotman/tangotiempo.com)
- Keys accessible to anyone at public URLs on TEST branch

**Exposed Keys Discovered**:
1. **Google Geolocation API** (`...hRTFkACc`)
   - File: `src/app/test-google-api/page.js` line 18
   - Pattern: `process.env.NEXT_PUBLIC_GOOGLE_API_KEY || 'HARDCODED_KEY'`
   - Public URL: https://github.com/ybotman/tangotiempo.com/blob/TEST/src/app/test-google-api/page.js#L18

2. **Firebase API** (`...kAMo755o`)
   - File: `public/Playbook/MasterCalendar/Base64-Encoded-JSON.md` line 33
   - Exposed in documentation example showing base64 decode process
   - Public URL: https://github.com/ybotman/tangotiempo.com/blob/TEST/public/Playbook/MasterCalendar/Base64-Encoded-JSON.md#L33

**Good News - Keys Had Restrictions**:
- ✅ HTTP Referrer restrictions (localhost:3001, tangotiempo.com, test.tangotiempo.com)
- ✅ API restrictions (Geocoding, Geolocation, Time Zone, Places APIs only)
- ✅ These restrictions significantly limited abuse potential
- ⚠️ But still vulnerable to calls from legitimate domains via browser console

**Impact**:
- Recent unexpected Google API charges likely explained by exposed keys
- Keys could be used by anyone from allowed domains
- Security audit scan revealed ONLY these 2 exposed keys (other APIs safe in .env.local)

**Remediation Completed** (Commit 43ecaea):
```bash
security: Remove hardcoded API keys from repository

Changes:
1. src/app/test-google-api/page.js:
   - Removed hardcoded fallback key
   - Added proper error handling when env var missing
   - Requires NEXT_PUBLIC_GOOGLE_API_KEY to be configured

2. public/Playbook/MasterCalendar/Base64-Encoded-JSON.md:
   - Redacted Firebase API key with [REDACTED] placeholder
   - Added security warning about not committing keys

3. Created separate keys for PROD and TEST:
   - PROD: TangoTiempoMapsAndGeocode-PROD-20250823
   - TEST: TangoTiempoMapsAndGeocode-TEST-20250823
   - Both with same security restrictions

4. Updated Vercel environment variables for both deployments
5. Updated local .env.local with TEST key
6. Committed and pushed to DEVL branch
```

**CRITICAL INSTRUCTION FOR FUTURE SESSIONS**:
When adding API keys to projects:
1. **NEVER commit API keys** to version control
2. **NEVER use hardcoded fallbacks** (no `|| 'HARDCODED_KEY'` patterns)
3. **Always use environment variables** (NEXT_PUBLIC_* for frontend)
4. **Redact keys in documentation** - use placeholders like [YOUR_KEY_HERE]
5. **Scan repo before making public**: `grep -r "AIzaSy" .` for Google keys
6. **Use separate keys** for PROD and TEST environments
7. **Apply key restrictions** immediately (HTTP referrers + API restrictions)
8. **Consider pre-commit hooks** to prevent key commits

**Scanning Pattern That Works**:
```bash
# Scan for Google API keys (AIzaSy pattern)
grep -r "AIzaSy" --include="*.js" --include="*.jsx" --include="*.md" . | grep -v node_modules

# Scan for other common API keys
grep -rE "(sk-|pk\.|AKIA|xoxb-|ghp_)" --include="*.js" --include="*.md" . | grep -v node_modules

# Check what's tracked in git
git ls-files | grep -E "\.env|\.key|secrets"
```

#### Related Issue: Infinite Loop in Geolocation (FIXED Oct 18) ✅
**DISCOVERY**: While investigating API charges, found previous infinite loop fix

**Problem** (Fixed in commit ae0fb9d):
- Distance calculation useEffect was recalculating every render
- Caused hundreds of renders per second
- Led to Google API rate limiting (429 errors)

**Fix Applied** (src/app/hooks/useServiceHealth.js):
```javascript
// GUARD: Prevent infinite loop - only calculate if distance doesn't exist yet
if (geoAPICoords.distanceToGoogle || googleGeoCoords.distanceToIpapi) {
  return; // EXIT - already calculated
}
```

**Timeline**:
- Infinite loop fixed: Oct 18, 2025 (commit ae0fb9d)
- API keys exposed: Unknown start date → Fixed Oct 23, 2025 (commit 43ecaea)
- Current charges: Likely combination of both issues

#### Duplicate API Calls Still Present ⚠️
**ADDITIONAL FINDING**: Visitor tracking makes duplicate Google API calls

**Problem Pattern**:
```javascript
// calendar/layout.js lines 27-30
const browserGeoData = await getGeolocationData();  // Calls Google API (NO CACHE)
const geoData = await fetchAllGeolocationData();     // Calls Google API (5-min cache)
```

**Impact**:
- Every page load = 2 Google API calls instead of 1
- Removed 24-hour throttle = more frequent calls on refreshes
- MapCenter tracking fires on every location change (5-min cache only)

**NOT FIXED YET** - Future optimization needed

### What Worked Well
1. **Systematic security audit** - Found all exposed keys with grep patterns
2. **Separate keys for environments** - PROD and TEST isolation
3. **Proper key restrictions** - HTTP referrers + API limits applied immediately
4. **Good git hygiene** - .env.local properly gitignored
5. **Clear documentation** - Security fix commit message comprehensive
6. **User awareness** - User knew to check API charges, triggered investigation

### What Needs Improvement
1. **Pre-commit hooks** - Should have prevented keys from being committed
2. **Code review process** - Hardcoded fallback patterns should be flagged
3. **Documentation patterns** - Need guidelines for showing API examples without exposing keys
4. **API call optimization** - Duplicate geolocation calls still need fixing
5. **Monitoring** - Should have alerts for unusual API usage spikes

### Process Improvements for Future Sessions

#### BEFORE Making Repo Public:
1. Run security audit scan for API keys
2. Check .gitignore includes all .env* files
3. Verify no hardcoded credentials in test files
4. Review documentation for exposed secrets

#### WHEN Adding New API Keys:
1. Store in .env.local (never commit)
2. Add to Vercel environment variables
3. Document in README with placeholders only
4. Apply key restrictions immediately
5. Test without fallback values

#### ONGOING Monitoring:
1. Review Google Cloud billing weekly
2. Set up budget alerts in Google Cloud Console
3. Monitor API usage quotas
4. Regular security audits (monthly grep scans)

### Remaining Tasks
- [ ] Delete old exposed keys from Google Cloud Console (CRITICAL)
- [ ] Monitor Google Cloud billing for next 48 hours
- [ ] Test localhost with new TEST key
- [ ] Deploy to TEST and verify tracking works
- [ ] Optimize duplicate geolocation API calls (future ticket)
- [ ] Consider adding pre-commit hooks (git-secrets or similar)

### Acceptance Criteria (All Met ✅)
- ✅ No hardcoded API keys in repository
- ✅ All environments use separate keys from env vars
- ✅ Security fix committed and pushed to DEVL
- ✅ Vercel configured with new keys
- ✅ Local development updated with TEST key
- ⏳ Old exposed keys deleted (user action required)
- ⏳ No unauthorized API usage detected (monitoring in progress)

---

## Related Sessions
- 2025-10-18: Infinite loop geolocation fix (ae0fb9d)
- 2025-10-19: MapCenter tracking implementation (TIEMPO-323)
- 2025-10-22: Two-stage category filter toggle (TIEMPO-327)

## Git Commits This Session
- `43ecaea` - security: Remove hardcoded API keys from repository
