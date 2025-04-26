# Feature 3002: Debug Menu

## Summary
A temporary debug menu system accessible from the hamburger menu that provides transparent access to internal application state, context data, and environment variables. This menu will serve as a powerful troubleshooting tool during development and initial production phases, to be removed 6 months post-launch.

## Motivation
- Create a developer-friendly debugging tool accessible directly in the UI
- Provide visibility into critical context providers and their current state
- Enable quick diagnosis of context-related issues without console logging
- Reduce troubleshooting time by exposing environment variable values directly
- Support diagnosis of location, authentication, and other state-related issues

## Scope
- **In-Scope:** 
  - New "Debug" submenu in the hamburger menu (only visible in development)
  - Context state viewers for all major context providers
  - Environment variable display with active values
  - Collapsible displays with JSON formatting for readability
  - Specialized views for critical contexts (Auth, Role, GeoLocation)
  - Optional manual state overrides for testing

- **Out-of-Scope:** 
  - Persistent debug state storage
  - Advanced visual debug features (network request tracing, etc.)
  - Remote debugging capabilities
  - Log aggregation features
  - Performance profiling tools

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Nested hamburger menu item with context-specific submenu options |
| API        | No new API endpoints, displays client-side context and env vars |
| Backend    | No backend changes required |
| Integration | Hooks into all major context providers for state access |

## Design
1. Add "Debug" menu item to hamburger menu with submenu:
   - Context
     - Auth Provider
     - Regions Provider
     - Role Provider
     - Mastered Location Provider
     - GeoLocation Provider
   - Environment Variables

2. Each debug view will:
   - Display current context state in formatted JSON
   - Highlight critical values
   - Provide collapsible sections for large objects
   - Include timestamps for state changes when available
   - Offer manual override controls (for development only)

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Create Debug menu structure in hamburger | 2025-04-26 |
| ⏳ Pending      | Implement AuthProvider debug view  | 2025-04-26 |
| ⏳ Pending      | Implement RegionsProvider debug view | 2025-04-26 |
| ⏳ Pending      | Implement RoleProvider debug view   | 2025-04-26 |
| ⏳ Pending      | Implement MasteredLocationProvider debug view | 2025-04-26 |
| ⏳ Pending      | Implement GeoLocationProvider debug view | 2025-04-26 |
| ⏳ Pending      | Add Environment Variables debug view | 2025-04-26 |
| ⏳ Pending      | Add collapsible JSON display component | 2025-04-26 |
| ⏳ Pending      | Add context value overriding capabilities | 2025-04-26 |
| ⏳ Pending      | Add production env detection to hide in prod | 2025-04-26 |
| ⏳ Pending      | Add auto-removal date tracking (6 mo post-launch) | 2025-04-26 |

## Rollback Plan
- Simple menu removal if issues arise
- Feature includes environment-based conditional rendering to disable in production
- No database changes required for rollback

## Dependencies
- All context providers in the Providers component
- Access to process.env variables
- React modal components for displaying debug information
- JSON formatter component for readable state displays

## Linked Issues / Docs
- Issue_1004_SelectVenuesMenuNotWorking (debugging this issue inspired this feature)
- Providers component in `/src/app/components/Providers.js`
- All context providers:
  - AuthProvider
  - RegionsProvider
  - RoleProvider 
  - MasteredLocationProvider
  - GeoLocationProvider

## Owner
Tango Tiempo Dev Team

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-04-26 |
| First Dev | TBD        |
| Review    | TBD        |
| Completed | TBD        |
| Removal   | 6 months post-launch |

---

## Technical Implementation Notes

### Context Access Pattern
Each debug view will follow a consistent pattern:
```jsx
const ContextDebugView = () => {
  const contextData = useContext(TargetContext);
  return (
    <DebugDisplay 
      title="Context Name" 
      data={contextData} 
      allowOverride={isDevelopment}
    />
  );
};
```

### Environment Variable Display
The environment variable display will:
- Only show whitelisted variables (no secrets)
- Group by categories (API endpoints, feature flags, etc.)
- Indicate if variables are missing expected values
- Show the environment name

### Auto-Removal Mechanism
Feature will track the application launch date and self-disable after 6 months by:
- Storing launch date in localStorage the first time the app is loaded in production
- Comparing current date to launch date + 6 months
- Automatically hiding debug menu when timespan is exceeded