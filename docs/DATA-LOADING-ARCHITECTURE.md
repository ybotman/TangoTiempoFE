# Data Loading Architecture - TangoTiempo

## System Overview Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[Components]
        UIFilters[UI Filters<br/>Search/Category/Organizer]
    end
    
    subgraph "Context Layer"
        GeoCtx[GeoLocationContext<br/>- userLocation<br/>- selectedLocation<br/>- temporaryLocation<br/>- userMapPreferences]
        LocAPICtx[LocationAPIContext<br/>- fetchNearestCity<br/>- fetchCities<br/>- fetchRegions<br/>- fetchDivisions]
        EventDiscCtx[EventDiscoveryContext<br/>- aiRecommendations]
        UserCtx[UserContext<br/>- userData<br/>- userRole]
    end
    
    subgraph "Hook Layer"
        useEvents[useEvents Hook<br/>- resolveLocationParameters<br/>- fetchEvents<br/>- pagination]
        useGeoLocations[useGeoLocations<br/>IP Geolocation<br/>Currently Disabled]
        useUsers[useUsers Hook<br/>- fetchUserData<br/>- updatePreferences]
        usePostFilter[usePostFilter<br/>Category Filtering]
    end
    
    subgraph "Event Bus"
        EventBus[LocationEventBus<br/>- NEAREST_CITY_FETCHED<br/>- LOCATION_SELECTED<br/>- LOCATION_CLEARED<br/>- TEMPORARY_LOCATION_SET]
        UserSettingsEvent[UserSettingsEvent<br/>- OPEN_USER_SETTINGS<br/>- CLOSE_USER_SETTINGS]
    end
    
    subgraph "API Layer"
        EventAPI[Event APIs<br/>/api/events]
        LocationAPI[Location APIs<br/>/api/masteredLocations]
        UserAPI[User APIs<br/>/api/userlogins]
        VenueAPI[Venue APIs<br/>/api/venues]
    end
    
    subgraph "Storage Layer"
        SessionStore[SessionStorage<br/>- temporaryLocation<br/>- rateLimitFlags]
        LocalStore[LocalStorage<br/>- selectedOrganizers<br/>- UI preferences]
        Backend[Backend DB<br/>- User preferences<br/>- Event data<br/>- Location data]
    end
    
    UI --> useEvents
    UI --> UIFilters
    UIFilters --> usePostFilter
    
    useEvents --> GeoCtx
    useEvents --> UserCtx
    useEvents --> EventDiscCtx
    useEvents --> EventAPI
    
    GeoCtx --> LocAPICtx
    GeoCtx --> useGeoLocations
    GeoCtx --> SessionStore
    
    LocAPICtx --> LocationAPI
    LocAPICtx --> EventBus
    
    UserCtx --> useUsers
    useUsers --> UserAPI
    useUsers --> Backend
    
    EventBus --> GeoCtx
    UserSettingsEvent --> UI
    
    EventAPI --> Backend
    LocationAPI --> Backend
    UserAPI --> Backend
    VenueAPI --> Backend
```

## Location Resolution Priority Flow

```mermaid
graph TD
    Start[useEvents Hook Invoked] --> Check1{Explicit Params?<br/>region/division/city<br/>lat/lng}
    Check1 -->|Yes| UseExplicit[Use Explicit Parameters]
    Check1 -->|No| Check2{Temporary Location?<br/>Non-logged users}
    
    Check2 -->|Yes| UseTempLoc[Use Temporary Location<br/>From SessionStorage]
    Check2 -->|No| Check3{User Preferences?<br/>useLocationPreferences=true}
    
    Check3 -->|Yes| CheckMapMode{Map Mode?<br/>useCenterLocation}
    Check3 -->|No| Check4{Use GeoContext?<br/>useGeoLocationContext=true}
    
    CheckMapMode -->|Yes| UseMapCenter[Use Map Center<br/>defaultCenterLocation<br/>+ defaultZoomRange]
    CheckMapMode -->|No| UseMultiCity[Use Multi-City Mode<br/>masteredCityIds[]]
    
    Check4 -->|Yes| CheckSelected{Selected Location?}
    Check4 -->|No| NoLocation[No Location Filter<br/>Show All Events]
    
    CheckSelected -->|Yes| UseSelected[Use Selected Location]
    CheckSelected -->|No| CheckUserLoc{User Physical Location?}
    
    CheckUserLoc -->|Yes| UseUserLoc[Use Browser Location]
    CheckUserLoc -->|No| NoLocation
    
    UseExplicit --> BuildQuery[Build API Query]
    UseTempLoc --> BuildQuery
    UseMapCenter --> BuildQuery
    UseMultiCity --> BuildQuery
    UseSelected --> BuildQuery
    UseUserLoc --> BuildQuery
    NoLocation --> BuildQuery
    
    BuildQuery --> FetchAPI[Fetch Events from API]
```

## User Settings Data Flow

```mermaid
graph LR
    subgraph "User Settings Structure"
        UserData[userData]
        UserData --> LocalUserInfo[localUserInfo]
        LocalUserInfo --> UserDefaults[userDefaults]
        
        UserDefaults --> MapSettings[Map Settings<br/>- useCenterLocation<br/>- defaultCenterLocation<br/>- defaultZoomRange]
        UserDefaults --> CitySettings[City Settings<br/>- masteredCityIds[]<br/>- masteredRegionName<br/>- masteredDivisionName]
        UserDefaults --> AISettings[AI Settings<br/>- includeAiGenerated]
    end
    
    subgraph "Update Flow"
        UIModal[UserSettingsModal] --> UpdateAPI[PUT /api/userlogins/updateUserInfo]
        UpdateAPI --> Backend[Backend Database]
        Backend --> RefreshUser[Refresh User Data]
        RefreshUser --> UserContext[Update UserContext]
        UserContext --> TriggerRefetch[Trigger Event Refetch]
    end
```

## Role-Based Data Access

```mermaid
graph TD
    UserRole[User Role] --> RoleCheck{Role Type?}
    
    RoleCheck -->|Anonymous| AnonAccess[View Only<br/>No Create/Edit]
    RoleCheck -->|NamedUser| NamedAccess[View Only<br/>Can Save Preferences]
    RoleCheck -->|RegionalOrganizer| OrgAccess[Create/Edit Own Events<br/>Filter: organizerId]
    RoleCheck -->|RegionalAdmin| AdminAccess[Create/Edit All Events<br/>In Assigned Cities]
    
    OrgAccess --> OrgAPI[POST /api/events/post<br/>PUT /api/events/:id<br/>DELETE /api/events/:id]
    AdminAccess --> AdminAPI[POST /api/events/ra/create<br/>PUT /api/events/ra/:id<br/>DELETE /api/events/:id]
```

## Special Site Behaviors

```mermaid
graph TD
    PageLoad[Page Load] --> CheckHost{Check Hostname/<br/>Referrer}
    
    CheckHost -->|Contains 'bostontangocalendar'| BostonMode[Boston Tango Mode]
    CheckHost -->|Other| StandardMode[Standard Mode]
    
    BostonMode --> SetBoston[Auto-select Boston<br/>42.3601, -71.0589]
    StandardMode --> CheckGeo{Check Geolocation}
    
    CheckGeo -->|Enabled| GetUserLoc[Get User Location]
    CheckGeo -->|Disabled| DefaultUS[Default US Center<br/>39.8283, -98.5795]
    
    SetBoston --> UpdateGeoCtx[Update GeoLocationContext]
    GetUserLoc --> UpdateGeoCtx
    DefaultUS --> UpdateGeoCtx
```

## State Variables Reference

| Variable | Source | Purpose | Type |
|----------|--------|---------|------|
| **Location Variables** |
| effectiveRegion | resolveLocationParameters | Resolved region name | string |
| effectiveDivision | resolveLocationParameters | Resolved division name | string |
| effectiveCity | resolveLocationParameters | Resolved city name | string |
| effectiveLat | resolveLocationParameters | Resolved latitude | number |
| effectiveLng | resolveLocationParameters | Resolved longitude | number |
| effectiveCityIds | resolveLocationParameters | Array of city IDs | number[] |
| effectiveZoomRange | resolveLocationParameters | Search radius (miles) | number |
| **User Settings** |
| useCenterLocation | userDefaults | Map mode enabled | boolean |
| defaultCenterLocation | userDefaults | Map center coords | {lat, lng} |
| defaultZoomRange | userDefaults | Default radius | number |
| masteredCityIds | userDefaults | Selected cities | number[] |
| includeAiGenerated | userDefaults | Show AI events | boolean |
| **Context States** |
| userLocation | GeoLocationContext | Browser location | {lat, lng} |
| selectedLocation | GeoLocationContext | UI selected location | object |
| temporaryLocation | GeoLocationContext | Non-logged preferences | object |
| userMapPreferences | GeoLocationContext | Logged user map prefs | object |
| **Filters** |
| selectedCategories | EventCalendar | Active category filters | string[] |
| searchTerm | EventCalendar | Search query | string |
| selectedOrganizers | EventCalendar | Filtered organizers | string[] |
| includeAiGenerated | EventDiscoveryContext | AI events filter | boolean |

## API Parameter Mapping

```javascript
// Event API Parameters
{
  // Application Context
  appId: 1,  // TangoTiempo (2 = Boston Tango)
  
  // Pagination
  page: 1,
  limit: 100,
  
  // Date Range
  start: "2024-01-01T00:00:00Z",
  end: "2024-12-31T23:59:59Z",
  
  // Location Filters (Hierarchical)
  masteredRegionName: "North America",
  masteredDivisionName: "USA",
  masteredCityName: "Boston",
  cityIds: [123, 456],  // Multi-city mode
  
  // Geo Search (Map mode)
  lat: 42.3601,
  lng: -71.0589,
  radius: 50,  // miles
  sortByDistance: true,
  useGeoSearch: true,
  
  // Role Filters
  organizerId: "abc123",  // RegionalOrganizer only
  userRole: "RegionalOrganizer",
  
  // AI Filter
  includeAiGenerated: true
}
```

## Key Implementation Files

- **Hooks**
  - `/src/app/hooks/useEvents.js` - Main event fetching logic
  - `/src/app/hooks/useGeoLocations.js` - IP geolocation (disabled)
  - `/src/app/hooks/useUsers.js` - User data management
  - `/src/app/hooks/usePostFilter.js` - Client-side filtering

- **Contexts**
  - `/src/app/contexts/GeoLocationContext.js` - Location state
  - `/src/app/contexts/LocationAPIContext.js` - Location APIs
  - `/src/app/contexts/EventDiscoveryContext.js` - AI filtering
  - `/src/app/contexts/UserContext.js` - User authentication

- **Components**
  - `/src/app/components/Modals/UserSettings/UserSettingsModal.js` - Settings UI
  - `/src/app/components/Events/EventCalendar.js` - Main calendar
  - `/src/app/components/UI/LocationSelector.js` - Location picker
  - `/src/app/components/Maps/MapComponent.js` - Map interface

- **Utils**
  - `/src/app/utils/EventAPI.js` - Event API calls
  - `/src/app/utils/LocationEventBus.js` - Event bus implementation
  - `/src/app/utils/UserSettingsEvent.js` - Settings modal events