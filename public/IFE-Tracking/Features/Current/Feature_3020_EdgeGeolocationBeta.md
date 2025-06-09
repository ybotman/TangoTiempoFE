# Feature 3020: Edge Geolocation Beta (POC)

## Status: ✅ POC Complete - Awaiting Cloudflare Configuration

## Overview
Implement a modern, edge-based geolocation strategy using Cloudflare headers and Next.js middleware to replace the current IP-based API approach. This beta feature will run in parallel with existing geolocation for A/B testing.

## Motivation
- **Performance**: Eliminate external API calls by using Cloudflare's built-in geo headers
- **Reliability**: Remove dependency on ipapi.co rate limits
- **Cost**: Zero additional cost (Cloudflare provides headers for free)
- **Privacy**: No precise coordinates, city-level only, no permission prompts
- **Edge Computing**: Leverage Vercel Edge Network for faster response times

## Requirements

### Phase 1: Infrastructure Setup ✅
- [x] Create Next.js middleware to intercept and process headers
- [x] Set secure httpOnly cookie with location data
- [x] Forward location as custom header for SSR
- [ ] Configure Cloudflare to inject geo headers (CF-IPCity, CF-IPCountry, CF-IPContinent) - **Pending**

### Phase 2: Beta Implementation ✅
- [x] Create new `useEdgeLocation` hook for beta testing
- [x] Add feature flag `ENABLE_EDGE_GEOLOCATION` 
- [x] Add debug panel to compare old vs new location data
- [x] Deploy to all environments (DEVL, TEST, PROD)
- [ ] Implement fallback hierarchy (CF → Firebase → Manual → Default) - **Next Phase**

### Phase 3: Frontend Integration 🚧
- [ ] Create location override UI component
- [ ] Store manual overrides in localStorage
- [ ] Update API calls to use new location data when beta enabled
- [ ] Add performance tracking metrics

### Phase 4: Developer Experience ✅
- [x] Mock CF headers in development environment (removed for production clarity)
- [x] Implement crawler/bot detection and handling
- [x] Create `/geo-diagnostics` page for testing
- [ ] Add environment variable for forced location testing
- [ ] Create documentation for local testing

## Technical Design

### Middleware Flow
```
Request → Cloudflare (adds headers) → Next.js Middleware → Cookie/Header → App
```

### Location Data Structure
```javascript
{
  city: "Boston",
  region: "MA", 
  country: "US",
  continent: "NA",
  timezone: "America/New_York",
  source: "cloudflare" | "firebase" | "manual" | "default",
  timestamp: 1234567890
}
```

### Feature Flag Implementation
- Beta users: 10% random sample + opt-in via debug menu
- A/B test metrics: Location accuracy, API performance, user engagement
- Rollback capability via environment variable

## Success Criteria
- [ ] 50%+ reduction in location detection time
- [ ] Zero external API calls for location
- [ ] No degradation in location accuracy
- [ ] Seamless fallback when CF headers unavailable
- [ ] Easy migration path from old system

## Risks & Mitigations
1. **Risk**: CF headers not available in some regions
   - **Mitigation**: Maintain ipapi.co as fallback during beta

2. **Risk**: Cookie size impacts performance
   - **Mitigation**: Minimal JSON structure, 24-hour expiry

3. **Risk**: Development environment differences
   - **Mitigation**: Robust mocking system for local dev

## Testing Plan
- [ ] Unit tests for middleware logic
- [ ] Integration tests for fallback hierarchy
- [ ] Performance benchmarks (old vs new)
- [ ] Multi-region testing via VPN
- [ ] Bot/crawler behavior validation

## Rollout Strategy
1. **Week 1-2**: Deploy to 10% of users with monitoring
2. **Week 3-4**: Expand to 50% if metrics positive
3. **Week 5-6**: Full rollout with old system deprecated
4. **Week 7**: Remove old geolocation code

## Dependencies
- Cloudflare configuration access
- Vercel Edge Network (already enabled)
- Next.js 14+ (already using)
- No new npm packages required

## POC Implementation Details

### What's Been Built
1. **Middleware (`/middleware.js`)**
   - Intercepts requests to `/geo-diagnostics`
   - Extracts Cloudflare headers
   - Sets cookie with geo data
   - Mocks headers in development

2. **Diagnostics Page (`/geo-diagnostics`)**
   - Shows CF headers and current system side-by-side
   - Comparison table of both approaches
   - Feature flag toggle for beta testing
   - Export functionality for debugging

3. **Edge Hook (`useEdgeGeolocation`)**
   - Reads CF data from cookie
   - Provides toggle functionality
   - Transforms data to match existing format

### Access the POC
- Direct URL: `/geo-diagnostics`
- Development: Accessible to all
- Production: Requires SystemAdmin role

### Current State (2025-06-08)
- POC is fully implemented and functional
- Fixed import issues with contexts (using hooks instead of direct context imports)
- Build successful, dev server running
- Geo-diagnostics page accessible at `http://localhost:3001/geo-diagnostics`
- Middleware mocks CF headers in development (removed for production clarity)
- Feature toggle stores preference in localStorage
- Export diagnostics functionality working
- **Deployed to all environments**: DEVL, TEST, and PROD

### Known Issues Resolved
- Fixed: Context import errors (now using `useGeoLocation` and `useMasteredLocation` hooks)
- Fixed: Build manifest missing (rebuilt application)
- Fixed: Route confusion (clarified `/geo-diagnostics` not `/calendar/geo-diagnostics`)
- Fixed: Location display showing `[object Object]` (improved formatLocation function)

### Deployment Status
- Feature branch: `feature/3020-edge-geolocation-beta` created and pushed
- Merged to remote DEVL: ✅ (commit: eeeeed4)
- Merged to remote TEST: ✅ (commit: 68d1ef5)
- Merged to remote PROD: ✅ (commit: a1ae378)
- Local branch cleanup: Removed local TEST and PROD branches (only DEVL locally)

### Production Notes
- `/geo-diagnostics` page is live in production
- Access restricted to SystemAdmin role in production
- Without Cloudflare configuration, shows "No CF headers detected" (expected)
- Current ipapi.co system continues to function normally
- Ready for Cloudflare header configuration

### Next Steps for Full Implementation
1. Configure Cloudflare to inject headers
2. Integrate edge hook with existing contexts
3. Add fallback logic
4. Implement performance tracking
5. Add manual location override functionality
6. Create environment variable for forced location testing

## Cloudflare Configuration Instructions (Free Plan)

### Option 1: Transform Rules (Recommended)
1. Enable IP Geolocation in Cloudflare Network settings
2. Create Transform Rule for HTTP Request Header Modification
3. Add headers: CF-IPCity, CF-IPCountry, etc. using `ip.geoip.*` variables
4. Deploy and test at `/geo-diagnostics`

### Option 2: Cloudflare Workers (100k requests/day free)
- Create Worker to inject geo headers from `request.cf` object
- Route to `tangotiempo.com/*`

### Option 3: Check Existing Headers
- CF-IPCountry may already be present
- CF-Connecting-IP is usually available

## Notes
- This is a POC to validate edge-based geolocation
- Old system remains fully functional during beta
- Users can opt-out via debug menu
- Privacy-first approach maintained throughout
- Free Cloudflare plan supports all necessary features