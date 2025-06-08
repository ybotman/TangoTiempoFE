# State Management in TangoTiempo

## Overview
TangoTiempo manages global state primarily using React's Context API. This approach allows different parts of the application to share and react to changes in authentication, user roles, and especially location-based data. There is no Redux or other third-party state management library in use; all global state is handled through custom context providers and hooks.

## Key Context Providers

- **AuthProvider**: Manages authentication state, user login status, and user information.
- **RoleProvider**: Handles user roles and permissions throughout the app.
- **GeoLocationProvider**: Centralizes the user's actual geographic location and the selected location for filtering content. This is the main context for location-aware features.
- **MasteredLocationProvider**: Supplies canonical location data from the backend, ensuring that location selections match backend records and providing validated IDs for API calls.
- **RegionsProvider** (Deprecated): The legacy system for region selection, being phased out in favor of GeoLocationProvider.
- **LocalizationProvider**: Handles date/time localization for the UI.

## Context Hierarchy and Initialization
- Providers are initialized in a specific order to avoid circular dependencies and ensure that each context has access to the data it needs.
- The most critical relationship is between GeoLocationProvider and MasteredLocationProvider, which have a managed circular dependency resolved by provider order and function registration patterns.

## How State Flows
- **Contexts** are set up at the top level of the app (see `Providers.js`), making their state and functions available to all child components via React's `useContext` hook.
- **Hooks** (e.g., `useGeoLocation`, `useMasteredLocation`) are used within components to access and update context state.
- **Venue and Event Selection**: These features rely on the location contexts to filter and display relevant data based on the user's current or selected location.

## Best Practices
- Use context for truly global state (auth, roles, location). For local state, use React's `useState` or `useReducer` within components.
- Avoid direct context mutation; always use provided setter functions or context methods.
- Minimize the number of contexts to reduce complexity and avoid unnecessary re-renders.
- Document context shape and usage for maintainability.

## Recommendations
- Complete the migration from RegionsContext to GeoLocationContext to simplify the location state system.
- Consider a shared utility layer for common state logic to reduce circular dependencies.
- Add explicit initialization/loading states to contexts for better user experience.
- Use TypeScript or PropTypes to enforce context value shapes and catch errors early.

---

By following these patterns, TangoTiempo achieves robust, scalable, and maintainable global state management tailored to its needs.
