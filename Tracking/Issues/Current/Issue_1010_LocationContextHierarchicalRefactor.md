# Issue 1010: Location Context Hierarchical Refactor

## Overview
Refactor the location context system to implement a Hierarchical Responsibility Model where GeoLocationContext is the clear owner of location state, and MasteredLocationContext is refactored to be a supporting service that doesn't reach back up into GeoLocationContext. This will eliminate circular dependencies and simplify the architecture while maintaining compatibility with existing components.

## Details
- **Reported On:** 2025-05-09
- **Reported By:** Architecture Review
- **Environment:** Development/Local
- **Component/Page/API Affected:** GeoLocationContext, MasteredLocationContext, location-dependent components
- **Symptoms:** 
  1. Circular dependency between GeoLocationContext and MasteredLocationContext
  2. Complex initialization sequence that can lead to race conditions
  3. Multiple formats for coordinate data
  4. Unclear responsibility boundaries between contexts

## Steps to Reproduce
1. Examine the current implementation of GeoLocationContext and MasteredLocationContext
2. Note circular dependencies where:
   - GeoLocationContext imports `useMasteredLocation`
   - MasteredLocationContext imports `useGeoLocation`
3. Observe complex initialization sequence and registration mechanisms

## Investigation
- **Initial Analysis:** While Issue #1004 and #1009 addressed immediate symptoms by changing provider order and adding registration mechanisms, the underlying architectural issue remains.
- **Root Cause:** Lack of clear hierarchical relationship between the contexts, leading to circular dependencies.
- **Architectural Design Issue:** Both contexts currently reach into each other, making the system hard to reason about and maintain.
- **Key Files to Review:** 
  - `/src/app/contexts/GeoLocationContext.js`
  - `/src/app/contexts/MasteredLocationContext.js`
  - `/src/app/components/Providers.js`

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Approach:** Implement a Hierarchical Responsibility Model where:
  1. GeoLocationContext becomes the master context that components interact with
  2. MasteredLocationContext becomes a supporting service with no dependency on GeoLocationContext
  3. Establish clear one-way data flow between contexts
  
- **Implementation Plan:**
  1. Refactor MasteredLocationContext to remove dependencies on GeoLocationContext
  2. Update GeoLocationContext to directly call backend APIs when needed instead of going through MasteredLocationContext
  3. Maintain backward compatibility with existing components
  4. Standardize coordinate format throughout the system
  5. Improve error handling and fallback mechanisms
  6. Add clear documentation about the hierarchical relationship

- **Testing:** 
  1. Test with the "Select Venues" menu functionality
  2. Verify LocationContextModal displays correctly
  3. Ensure all location-dependent components continue to function
  4. Test edge cases like initialization errors and API failures

## Resolution Log
- **Commit/Branch:** Not yet created
- **PR:** To be created after implementation
- **Deployed To:** Not yet deployed
- **Verification Status:** 🚧 In Progress

---

> Note: This issue builds on the fixes from Issue #1004 and Issue #1009, focusing on a cleaner architectural solution rather than immediate symptom fixes.