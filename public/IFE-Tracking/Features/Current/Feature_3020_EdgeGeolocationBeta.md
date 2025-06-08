# Feature 3020: Edge Geolocation Beta (POC)

## Status: 🚧 In Progress

## Overview
Implement a modern, edge-based geolocation strategy using Cloudflare headers and Next.js middleware to replace the current IP-based API approach. This beta feature will run in parallel with existing geolocation for A/B testing.

## Motivation
- **Performance**: Eliminate external API calls by using Cloudflare's built-in geo headers
- **Reliability**: Remove dependency on ipapi.co rate limits
- **Cost**: Zero additional cost (Cloudflare provides headers for free)
- **Privacy**: No precise coordinates, city-level only, no permission prompts
- **Edge Computing**: Leverage Vercel Edge Network for faster response times

## Requirements

### Phase 1: Infrastructure Setup
- [ ] Configure Cloudflare to inject geo headers (CF-IPCity, CF-IPCountry, CF-IPContinent)
- [ ] Create Next.js middleware to intercept and process headers
- [ ] Set secure httpOnly cookie with location data
- [ ] Forward location as custom header for SSR

### Phase 2: Beta Implementation
- [ ] Create new `useEdgeLocation` hook for beta testing
- [ ] Add feature flag `ENABLE_EDGE_GEOLOCATION` 
- [ ] Implement fallback hierarchy (CF → Firebase → Manual → Default)
- [ ] Add debug panel to compare old vs new location data

### Phase 3: Frontend Integration
- [ ] Create location override UI component
- [ ] Store manual overrides in localStorage
- [ ] Update API calls to use new location data when beta enabled
- [ ] Add performance tracking metrics

### Phase 4: Developer Experience
- [ ] Mock CF headers in development environment
- [ ] Add environment variable for forced location testing
- [ ] Create documentation for local testing
- [ ] Implement crawler/bot detection and handling

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

## Notes
- This is a POC to validate edge-based geolocation
- Old system remains fully functional during beta
- Users can opt-out via debug menu
- Privacy-first approach maintained throughout