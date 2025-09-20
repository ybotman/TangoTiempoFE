# TIEMPO-XXX: Add State Abbreviations to Cities API Response

## Summary
The `/api/masteredLocations/cities` endpoint currently returns city data without state abbreviations, causing frontend displays to show incomplete location information (e.g., "- Boston" instead of "MA - Boston").

## Description
Frontend components expect a `stateAbbr` field in city objects to properly display location information in dropdowns and other UI elements. The current API response lacks this field, requiring frontend workarounds.

### Current API Response Structure
```json
{
  "_id": "6751f58a5db435dd8005e479",
  "active": true,
  "appId": "1",
  "cityCode": "BSTN",
  "cityName": "Boston",
  "location": {
    "type": "Point",
    "coordinates": [-71.0589, 42.3601]
  },
  "masteredDivisionId": "6751f58a5db435dd8005e461",
  "isActive": true,
  "latitude": 42.3601,
  "longitude": -71.0589
}
```

### Required API Response Structure
```json
{
  "_id": "6751f58a5db435dd8005e479",
  "active": true,
  "appId": "1",
  "cityCode": "BSTN",
  "cityName": "Boston",
  "stateAbbr": "MA",  // <-- Add this field
  "location": {
    "type": "Point",
    "coordinates": [-71.0589, 42.3601]
  },
  "masteredDivisionId": "6751f58a5db435dd8005e461",
  "isActive": true,
  "latitude": 42.3601,
  "longitude": -71.0589
}
```

## Technical Details

### Backend Implementation Approach
1. The city's state can be derived from the relationship: City → Division → States array
2. Each city has a `masteredDivisionId` that links to a division
3. Each division contains a `states` array listing state names
4. Need to map state names to standard 2-letter abbreviations

### State Mapping Required
The divisions API shows states as full names (e.g., "Massachusetts"), but frontend needs abbreviations (e.g., "MA").

Example division data:
```json
{
  "_id": "6751f58a5db435dd8005e461",
  "divisionName": "New England",
  "states": ["Maine", "Vermont", "New Hampshire", "Massachusetts", "Rhode Island", "Connecticut"]
}
```

## Acceptance Criteria
1. [ ] GET `/api/masteredLocations/cities` returns `stateAbbr` field for each city
2. [ ] State abbreviations follow standard US postal codes (2 letters, uppercase)
3. [ ] Cities with invalid/missing division relationships should return `stateAbbr: null`
4. [ ] API response maintains backward compatibility (only adds field, doesn't remove/change existing)
5. [ ] Performance impact is minimal (state data should be efficiently retrieved)

## Testing
1. Verify all cities in the database have correct state abbreviations
2. Test edge cases:
   - Cities with missing division relationships
   - International cities (if any)
   - Cities in territories (PR, VI, etc.)
3. Verify frontend components display "STATE - City" format correctly

## Frontend Components Affected
- `RegionalOrganizersSettings.js` - City selection dropdown
- `RegionalOrganizersStatus.js` - Selected cities display
- `useMasteredCities.js` - Hook expecting stateAbbr field
- Any other component displaying city information

## Priority
High - This affects the user experience for Regional Organizers selecting their operating cities.

## Notes
- Consider caching state lookups for performance
- Ensure consistency with venue data which already has state field
- Update API documentation to reflect new field