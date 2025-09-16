## TEST to PROD Deployment Summary

### Current Versions:
- TEST: v1.9.0 (just bumped)
- PROD: v1.4.5 (last deployment)

### Major Changes in TEST (ready for PROD):

1. **TIEMPO-279: Boston Calendar Feature** (COMPLETED)
   - New /calendar/boston route for iframe compatibility
   - Full visual parity with main calendar
   - 200-mile radius for New England coverage

2. **TIEMPO-276: Venue Location Filtering** (COMPLETED)
   - Distance-based venue filtering using user location
   - User's zoomRange preference sent to API
   - Improved venue search performance

3. **TIEMPO-283: User Settings Fix** (COMPLETED)
   - Fixed undefined user errors
   - Improved error handling

### Tickets Needing Backend Work (blocking):
- TIEMPO-277: Deploy venue filtering backend (frontend ready)
- TIEMPO-215: Venue API GET based on map location

### Other In-Progress Work (not blocking):
- TIEMPO-218: Timezone DST
- TIEMPO-256: Deep linking for events
- TIEMPO-271: RO profile bypass bug
- TIEMPO-260: Save state feedback

### Deployment Steps:
1. Ensure backend for TIEMPO-277 is deployed
2. Run final tests on TEST environment
3. Create PR from TEST to PROD
4. Bump to v2.0.0 (major release with Boston feature)
5. Deploy to PROD
6. Test Boston iframe at bostontangocalendar.com
