# Feature 3020: Technical Design - Edge Geolocation Diagnostics Page

## Overview
Create a dedicated diagnostics page at `/geo-diagnostics` that displays all geolocation information and allows testing of both current and new edge-based approaches.

## Page Architecture

### Route: `/geo-diagnostics`
- No menu entry required (accessed directly via URL)
- Protected by environment check (only in dev/test) or role-based access
- Server-side rendering to capture edge headers

## Page Components

### 1. Edge Geolocation Panel
```
┌─ Cloudflare Edge Headers ──────────────────┐
│ CF-IPCity: Boston                          │
│ CF-IPCountry: US                           │
│ CF-IPContinent: NA                         │
│ CF-Timezone: America/New_York              │
│ CF-Connecting-IP: 192.168.1.1              │
│ Status: ✅ Available                       │
└────────────────────────────────────────────┘
```

### 2. Current IP Geolocation Panel
```
┌─ Current System (ipapi.co) ─────────────────┐
│ Status: ✅ Active                           │
│ City: Boston                                │
│ Region: Massachusetts                       │
│ Country: US                                 │
│ Latitude: 42.3601                          │
│ Longitude: -71.0589                        │
│ Last Updated: 2 mins ago                   │
│ Cache Status: Valid (58 mins remaining)    │
│ API Calls Today: 142/1000                  │
└────────────────────────────────────────────┘
```

### 3. Comparison Panel
```
┌─ System Comparison ─────────────────────────┐
│ Metric           Current    Edge    Better  │
│ ─────────────────────────────────────────── │
│ Response Time    320ms      0ms      ✅     │
│ Accuracy         City       City     →      │
│ API Calls        Yes        No       ✅     │
│ Cost             $0.001     $0       ✅     │
│ Privacy          Good       Better   ✅     │
└────────────────────────────────────────────┘
```

### 4. Location Context States
```
┌─ Location Contexts ─────────────────────────┐
│ GeoLocationContext:                         │
│   - User Location: Boston, MA               │
│   - Selected Location: Cambridge, MA        │
│   - Loading: false                          │
│                                             │
│ MasteredLocationContext:                    │
│   - Current City: Boston (ID: 507f1f...)   │
│   - Division: Massachusetts                 │
│   - Region: Northeast                       │
│   - Country: United States                  │
└────────────────────────────────────────────┘
```

### 5. Feature Flag Control
```
┌─ Beta Testing Control ──────────────────────┐
│ Edge Geolocation: [Toggle Switch]          │
│ Current Status: Disabled                    │
│ When enabled:                               │
│   - Uses CF headers for location           │
│   - Falls back to current system           │
│   - Logs performance metrics               │
└────────────────────────────────────────────┘
```

### 6. Manual Testing Tools
```
┌─ Location Override ─────────────────────────┐
│ Test Different Locations:                   │
│ [Select: Boston, NYC, LA, Chicago...]      │
│ [Apply Override] [Clear Override]          │
│                                             │
│ Simulate CF Headers:                        │
│ City: [________] Country: [__]             │
│ [Apply Headers]                             │
└────────────────────────────────────────────┘
```

### 7. Performance Metrics
```
┌─ Performance Tracking ──────────────────────┐
│ Edge Geolocation Metrics (Last 24h):       │
│   - Requests: 0                             │
│   - Avg Response: N/A                      │
│   - Success Rate: N/A                      │
│                                             │
│ Current System Metrics (Last 24h):         │
│   - Requests: 3,421                        │
│   - Avg Response: 312ms                    │
│   - Success Rate: 94.2%                    │
│   - Failures: 198 (rate limited)           │
└────────────────────────────────────────────┘
```

## Implementation Details

### File Structure
```
src/app/geo-diagnostics/
├── page.js                 # Main diagnostics page
├── components/
│   ├── EdgeGeolocationPanel.js
│   ├── CurrentSystemPanel.js
│   ├── ComparisonPanel.js
│   ├── ContextStatesPanel.js
│   ├── FeatureFlagControl.js
│   ├── ManualTestingTools.js
│   └── PerformanceMetrics.js
└── utils/
    └── geoTestUtils.js
```

### Middleware Implementation
```javascript
// middleware.js
export function middleware(request) {
  // Only process geo-diagnostics routes
  if (request.nextUrl.pathname === '/geo-diagnostics') {
    const response = NextResponse.next();
    
    // Extract CF headers
    const cfHeaders = {
      city: request.headers.get('cf-ipcity'),
      country: request.headers.get('cf-ipcountry'),
      continent: request.headers.get('cf-ipcontinent'),
      timezone: request.headers.get('cf-timezone'),
      ip: request.headers.get('cf-connecting-ip')
    };
    
    // Set as cookie for client access
    response.cookies.set('cf-geo-data', JSON.stringify(cfHeaders), {
      httpOnly: false, // Allow client access for diagnostics
      secure: true,
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });
    
    // Forward as headers for SSR
    Object.entries(cfHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(`x-geo-${key}`, value);
    });
    
    return response;
  }
}
```

### Data Flow
1. User visits `/geo-diagnostics`
2. Middleware captures CF headers
3. Page renders with both edge and current data
4. Real-time comparison displayed
5. User can toggle beta feature
6. Manual overrides for testing

## Key Features

### Auto-Refresh
- Poll current location every 30 seconds
- Update metrics in real-time
- Show cache expiration countdown

### Export Functionality
- Download diagnostics as JSON
- Include timestamp and all data points
- Useful for bug reports

### Visual Indicators
- Green: Working correctly
- Yellow: Degraded/fallback
- Red: Failed/unavailable
- Blue: Beta/experimental

## Security Considerations
- Page only accessible in development by default
- Production access requires admin role
- No sensitive data exposed
- Rate limit tracking anonymized

## Benefits
1. **Developer Testing**: Easy verification of both systems
2. **QA Validation**: Clear comparison metrics
3. **Beta Testing**: Simple toggle for A/B testing
4. **Debugging**: All geo data in one place
5. **Performance Monitoring**: Real-time metrics

This diagnostics page provides complete visibility into both geolocation systems while facilitating the transition to edge-based detection.