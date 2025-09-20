# Venue Attribute Lineage Analysis

**Generated**: 2025-01-28  
**Purpose**: Track how each venue attribute flows from backend API to frontend display/logic

## Venue Data Structure from Backend

```javascript
{
  _id: "680c5112ef6308b31e5b5670",
  appId: "1",
  name: "(Maine) Metta Studio 40",
  shortName: "",
  address1: " Main St Bldg 13, Suite 136,",
  address2: "",
  address3: "",
  city: "Biddeford",
  state: "ME",
  zip: "",
  phone: "",
  comments: "",
  latitude: 43.4969645,
  longitude: -70.4664723,
  isValidVenueGeolocation: false,
  geolocation: Object,
  masteredCityId: "6751f58a5db435dd8005e46d",
  masteredDivisionId: "6751f58a5db435dd8005e460",
  masteredRegionId: "6751f58a5db435dd8005e45b",
  masteredCountryId: "6751f57e2e74d97609e7dca0",
  isActive: false,
  createdAt: "2025-04-26T03:20:50.344+00:00",
  updatedAt: "2025-04-27T03:11:42.932+00:00",
  __v: 0
}
```

## Attribute-by-Attribute Analysis

### 1. `_id` (MongoDB ObjectId)
**Used for:**
- Primary identifier
- React keys in lists
- Venue selection/deselection
- API calls for updates

**Where displayed:**
- Never shown to users directly
- Used internally for state management

**Filtering:**
- Not used for filtering

**Joins/Lookups:**
- Events collection references this as `venueId`
- Used in venue selection state

**Transformations:**
- None

---

### 2. `appId`
**Used for:**
- Multi-tenant application filtering
- API authentication/authorization

**Where displayed:**
- Never shown to users

**Filtering:**
- Backend filters all queries by appId
- Frontend sends appId in API calls

**Joins/Lookups:**
- Matched against user's appId

**Transformations:**
- None

---

### 3. `name` (Primary Display Name)
**Used for:**
- Main venue display label
- Search/autocomplete
- Event listings

**Where displayed:**
- VenueSelectionModal tooltips
- Event detail cards
- Venue lists
- Map markers

**Filtering:**
- Text search in venue selection
- Autocomplete matching

**Joins/Lookups:**
- None

**Transformations:**
- Sometimes combined with city: `${name}, ${city}`

---

### 4. `shortName`
**Used for:**
- Alternative display when space limited
- Fallback if empty: uses `name`

**Where displayed:**
- Compact venue lists
- Mobile views
- Calendar event cards (when space constrained)

**Filtering:**
- Included in text search

**Joins/Lookups:**
- None

**Transformations:**
- `displayName = shortName || name`

---

### 5-7. `address1`, `address2`, `address3`
**Used for:**
- Full address display
- Directions/maps integration

**Where displayed:**
- Venue detail popups
- Event detail pages
- Venue information cards

**Filtering:**
- Not used for filtering

**Joins/Lookups:**
- None

**Transformations:**
- Combined into single address string
- Empty values filtered out

---

### 8-10. `city`, `state`, `zip`
**Used for:**
- Location context
- Address completion
- Regional grouping

**Where displayed:**
- Venue cards: `${city}, ${state}`
- Address blocks
- Search results

**Filtering:**
- City used in location-based filtering
- State used for regional views

**Joins/Lookups:**
- None directly (but conceptually linked to masteredCityId)

**Transformations:**
- Combined for display: `${city}, ${state} ${zip}`

---

### 11. `phone`
**Used for:**
- Contact information
- Click-to-call on mobile

**Where displayed:**
- Venue detail cards
- Contact sections

**Filtering:**
- Not used

**Joins/Lookups:**
- None

**Transformations:**
- Phone number formatting (if implemented)

---

### 12. `comments`
**Used for:**
- Additional venue information
- Special instructions

**Where displayed:**
- Venue detail popups
- Expandable info sections

**Filtering:**
- Not used

**Joins/Lookups:**
- None

**Transformations:**
- None

---

### 13-14. `latitude`, `longitude`
**Used for:**
- Map positioning
- Distance calculations
- Radius filtering

**Where displayed:**
- Map markers
- Debug info (coordinates)

**Filtering:**
- PRIMARY FILTER: Distance from center point
- Venues without coordinates excluded from maps

**Joins/Lookups:**
- None

**Transformations:**
- Haversine distance calculation
- Coordinate validation

---

### 15. `isValidVenueGeolocation`
**Used for:**
- Data quality indicator
- Map display decisions

**Where displayed:**
- Not shown to users
- May affect map marker styling

**Filtering:**
- Could filter out invalid locations

**Joins/Lookups:**
- None

**Transformations:**
- None

---

### 16. `geolocation` (GeoJSON Object)
**Used for:**
- Alternative coordinate storage
- MongoDB geospatial queries

**Where displayed:**
- Not directly displayed

**Filtering:**
- Backend geospatial queries

**Joins/Lookups:**
- None

**Transformations:**
- Extracted to latitude/longitude

---

### 17-20. Mastered Location IDs
- `masteredCityId`
- `masteredDivisionId`
- `masteredRegionId`
- `masteredCountryId`

**Used for:**
- Hierarchical location relationships
- Regional filtering
- Location-based grouping

**Where displayed:**
- Not shown directly (IDs)
- Used to fetch location names

**Filtering:**
- Division scope filtering in VenueSelectionModal
- Regional event filtering

**Joins/Lookups:**
- Joined with mastered locations collections
- Used to get location names

**Transformations:**
- ID → Name lookups

---

### 21. `isActive`
**Used for:**
- Soft delete functionality
- Hide inactive venues

**Where displayed:**
- Not shown to users
- Inactive venues typically filtered out

**Filtering:**
- Backend: `isActive: true` filter
- Frontend: Filtered before display

**Joins/Lookups:**
- None

**Transformations:**
- None

---

### 22-23. `createdAt`, `updatedAt`
**Used for:**
- Audit trail
- Sorting by recency
- Data freshness

**Where displayed:**
- Admin interfaces only
- Not in public UI

**Filtering:**
- Could filter by date ranges
- Sort by newest/oldest

**Joins/Lookups:**
- None

**Transformations:**
- Date formatting for display

---

## Key Code Locations

### Data Fetching
- `/hooks/useVenues.js` - Fetches venue data
- `/hooks/useVenueSelection.js` - Filters and manages venue selection

### Display Components
- `/components/Modals/Venues/VenueSelectionModal.js` - Main venue UI
- `/components/Modals/Venues/VenueUpcomingEvents.js` - Venue events

### Filtering Logic
- Distance filtering: `useVenueSelection.js:calculateDistance()`
- Division filtering: `venue.masteredDivisionId === selectedLocation.division.id`
- Active filtering: Backend API

### Transformations
- Coordinate extraction from geolocation
- Address concatenation
- Display name selection (shortName || name)

## Critical Patterns

1. **ID vs Name Usage**:
   - Backend stores and filters by IDs
   - Frontend displays names
   - Lookups happen at data fetch time

2. **Coordinate Handling**:
   - Multiple sources: latitude/longitude fields OR geolocation object
   - Always validate before use
   - Required for map display

3. **Filtering Hierarchy**:
   1. appId (backend)
   2. isActive (backend)
   3. Coordinates exist (frontend)
   4. Distance from center (frontend)
   5. Division match (frontend, optional)

4. **Display Fallbacks**:
   - name → shortName (if provided)
   - Full address → partial address
   - Coordinates → exclude from map