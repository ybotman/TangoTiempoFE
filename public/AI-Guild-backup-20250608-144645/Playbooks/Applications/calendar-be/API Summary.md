# Master Calendar API Documentation

## Overview

The Master Calendar backend provides a comprehensive REST API for managing events, users, venues, and other related data. This documentation serves as a guide for applications that need to integrate with the Calendar Backend system.

## Base URL

All API endpoints are relative to the base URL of the deployed backend server:

```
http://localhost:3010/api
```

## Authentication

Authentication is handled via Firebase, using JSON Web Tokens (JWT).

### Authentication Flow

1. Client authenticates with Firebase Authentication
2. Client receives an ID token from Firebase
3. Client sends requests with the token in Authorization header: `Authorization: Bearer <token>`
4. Server verifies the token using Firebase Admin SDK
5. Server associates Firebase user with internal user model

## Common Parameters

Most endpoints accept the following common parameters:

- `appId`: Application identifier (required, default: "1")
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 100, max: 500)
- `select`: Field selection for response (optional)

## API Endpoints

### Events API (`/api/events`)

#### GET /api/events
Retrieves events with advanced filtering capabilities.

**Query Parameters:**
- `appId`: Application ID (required)
- `start`, `end`: Date range in ISO format
- `organizerId`: Filter by organizer ID
- `masteredRegionName`, `masteredDivisionName`, `masteredCityName`: String-based location filtering
- `masteredRegionId`, `masteredDivisionId`, `masteredCityId`: ObjectID-based location filtering
- `useObjectIds`: Whether to use ObjectID-based location filtering ("true"/"false")
- `venueId`: Filter by venue ID
- `lat`, `lng`, `radius`: Geolocation filtering
- `useGeoSearch`: Whether to use enhanced geolocation search ("true"/"false")
- `sortByDistance`: Whether to sort results by distance from coordinates ("true"/"false")
- `categoryId`: Filter by category ID
- `active`, `featured`, `canceled`, `discovered`: Status flags
- `search`: Text search
- `userRole`: User role for role-based access
- `page`, `limit`: Pagination parameters

**Response:**
```json
{
  "events": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "filterType": "string",
  "query": {
    // Applied filters
  }
}
```

#### GET /api/events/id/:id
Retrieves a specific event by ID.

**Parameters:**
- `id`: Event ID (path parameter)
- `appId`: Application ID (query parameter, required)

#### POST /api/events/post
Creates a new event.

**Authorization:** Required

**Request Body:**
- `appId`: Application ID (required)
- `title`: Event title (required)
- `startDate`: Start date (required)
- `endDate`: End date (required)
- `ownerOrganizerID`: Organizer ID (required)
- `venueID`: Venue ID
- Other event fields as per the event model

**Response:** The created event object

#### PUT /api/events/:eventId
Updates an existing event.

**Authorization:** Required (must be event owner or admin)

**Parameters:**
- `eventId`: Event ID (path parameter)
- `appId`: Application ID (query parameter or request body, required)

**Request Body:** Updated event fields

**Response:** The updated event object

#### DELETE /api/events/:eventId
Deletes an event.

**Authorization:** Required (must be event owner or admin)

**Parameters:**
- `eventId`: Event ID (path parameter)
- `appId`: Application ID (query parameter, required)

### Categories API (`/api/categories`)

#### GET /api/categories
Retrieves categories with pagination.

**Query Parameters:**
- `appId`: Application ID (required)
- `page`, `limit`: Pagination parameters
- `select`: Fields to select

**Response:**
```json
{
  "categories": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Venues API (`/api/venues`)

#### GET /api/venues
Retrieves venues with filtering.

**Query Parameters:**
- `appId`: Application ID (default: "1")
- `cityId`/`masteredCityId`: City ID filter
- `masteredDivisionId`, `masteredRegionId`: Location hierarchy filters
- `isActive`: Active status filter
- `name`: Name filter (partial match)
- `page`, `limit`: Pagination parameters
- `select`: Fields to select
- `populate`: Whether to populate references ("true"/"false")

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### GET /api/venues/nearest-city
Finds the nearest mastered city to given coordinates.

**Query Parameters:**
- `latitude`, `longitude`: Coordinates (required)
- `maxDistance`: Maximum distance in meters (default: 50000)
- `appId`: Application ID (default: "1")

#### GET /api/venues/:id
Retrieves a venue by ID.

**Parameters:**
- `id`: Venue ID (path parameter)
- `populate`: Whether to populate references (query parameter, "true"/"false")

#### POST /api/venues
Creates a new venue.

**Request Body:**
- `appId`: Application ID (default: "1")
- `name`: Venue name (required)
- `address1`: Address line 1 (required)
- `city`: City (required)
- `latitude`, `longitude`: Coordinates (required)
- `masteredCityId`: Optional city ID (will be detected from coordinates if not provided)
- Other venue fields

**Response:** The created venue object

#### PUT /api/venues/:id
Updates a venue.

**Parameters:**
- `id`: Venue ID (path parameter)

**Request Body:** Updated venue fields

**Response:** The updated venue object

#### DELETE /api/venues/:id
Deletes a venue.

**Parameters:**
- `id`: Venue ID (path parameter)

### User Logins API (`/api/userlogins`)

#### GET /api/userlogins/firebase/:firebaseId
Retrieves a user login by Firebase ID.

**Parameters:**
- `firebaseId`: Firebase user ID (path parameter)
- `appId`: Application ID (query parameter, default: "1")

#### POST /api/userlogins
Creates a new user login.

**Request Body:**
- `firebaseUserId`: Firebase user ID (required)
- `appId`: Application ID (default: "1")

#### PUT /api/userlogins/updateUserInfo
Updates user information.

**Request Body:**
- `firebaseUserId`: Firebase user ID (required)
- `appId`: Application ID (default: "1")
- `regionalOrganizerInfo`: Regional organizer information
- `roleIds`: User roles
- Other user fields

#### PUT /api/userlogins/:firebaseId/roles
Updates user roles.

**Parameters:**
- `firebaseId`: Firebase user ID (path parameter)

**Request Body:**
- `roleIds`: Array of role IDs (required)
- `appId`: Application ID (default: "1")

#### Optimized User Login Endpoints

These endpoints provide optimized versions of the user login functionality with better performance:

- `GET /api/optimized-userlogins/firebase/:firebaseId`: Gets user by Firebase ID with optimized performance

### Mastered Locations API (`/api/mastered-locations`)

#### GET /api/mastered-locations/countries
Retrieves mastered countries with pagination.

**Query Parameters:**
- `isActive`: Active status filter
- `appId`: Application ID (default: "1")
- `page`, `limit`: Pagination parameters
- `select`: Fields to select

#### GET /api/mastered-locations/regions
Retrieves mastered regions with pagination.

**Query Parameters:**
- `countryId`: Country ID filter
- `isActive`: Active status filter
- `appId`: Application ID (default: "1")
- `page`, `limit`: Pagination parameters
- `select`: Fields to select
- `populate`: Whether to populate references ("true"/"false")

#### GET /api/mastered-locations/divisions
Retrieves mastered divisions with pagination.

**Query Parameters:**
- `regionId`: Region ID filter
- `isActive`: Active status filter
- `appId`: Application ID (default: "1")
- `page`, `limit`: Pagination parameters
- `select`: Fields to select
- `populate`: Whether to populate references ("true"/"false")

#### GET /api/mastered-locations/cities
Retrieves mastered cities with pagination.

**Query Parameters:**
- `divisionId`: Division ID filter
- `isActive`: Active status filter
- `appId`: Application ID (default: "1")
- `page`, `limit`: Pagination parameters
- `select`: Fields to select
- `populate`: Whether to populate references ("true"/"false")

#### GET /api/mastered-locations/all
Retrieves all geo-hierarchy data (countries, regions, divisions, cities).

**Query Parameters:**
- `appId`: Application ID (default: "1")
- `isActive`: Active status filter
- `limit`: Maximum items per entity type
- `populate`: Whether to populate references (default: "true")

### Organizers API (`/api/organizers`)

#### GET /api/organizers
Retrieves organizers with filtering.

**Query Parameters:**
- `appId`: Application ID (default: "1")
- `region`/`regionID`/`masteredRegionId`: Region filter
- `division`/`masteredDivisionId`: Division filter
- `city`/`masteredCityId`: City filter
- `isActive`, `wantRender`, `isEnabled`: Status filters
- `page`, `limit`: Pagination parameters
- `select`: Fields to select

**Response:**
```json
{
  "organizers": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### GET /api/organizers/:id
Retrieves an organizer by ID.

**Parameters:**
- `id`: Organizer ID (path parameter)
- `appId`: Application ID (query parameter, default: "1")

#### POST /api/organizers
Creates a new organizer.

**Request Body:**
- `appId`: Application ID (default: "1")
- Organizer fields as per the organizer model

**Response:** The created organizer object

#### PUT /api/organizers/:id
Updates an organizer.

**Parameters:**
- `id`: Organizer ID (path parameter)
- `appId`: Application ID (query parameter or request body, default: "1")

**Request Body:** Updated organizer fields

**Response:** The updated organizer object

#### DELETE /api/organizers/:id
Deletes an organizer.

**Parameters:**
- `id`: Organizer ID (path parameter)
- `appId`: Application ID (query parameter, default: "1")

### Roles API (`/api/roles`)

#### GET /api/roles
Retrieves roles with pagination.

**Query Parameters:**
- `appId`: Application ID (default: "1")
- `page`, `limit`: Pagination parameters
- `select`: Fields to select

**Response:**
```json
{
  "roles": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Legacy APIs

The following endpoints are considered legacy and will return an empty response with a message to use their replacement APIs:

- `/api/locations` - Use `/api/venues` instead
- `/api/regions` - Use `/api/mastered-locations` instead

## Data Models

### Events Model
```javascript
{
  appId: String,                        // required
  title: String,                        // required
  standardsTitle: String,
  shortTitle: String,
  description: String,
  startDate: Date,                      // required
  endDate: Date,                        // required
  categoryFirstId: ObjectId,
  categorySecondId: ObjectId,
  categoryThirdId: ObjectId,
  ownerOrganizerID: ObjectId,           // required, ref: "Organizers"
  grantedOrganizerID: ObjectId,         // ref: "Organizers"
  alternateOrganizerID: ObjectId,       // ref: "Organizers"
  ownerOrganizerName: String,           // required
  masteredRegionName: String,
  masteredDivisionName: String,
  masteredCityName: String,
  masteredRegionId: ObjectId,           // ref: "MasteredRegion"
  masteredDivisionId: ObjectId,         // ref: "MasteredDivision"
  masteredCityId: ObjectId,             // ref: "masteredCity"
  masteredCityGeolocation: {
    type: String,                       // default: "Point"
    coordinates: [Number]               // [longitude, latitude]
  },
  eventImage: String,
  bannerImage: String,
  featuredImage: String,
  venueID: ObjectId,                    // ref: "Venue"
  venueGeolocation: {
    type: String,                       // default: "Point"
    coordinates: [Number]               // [longitude, latitude]
  },
  recurrenceRule: String,
  isDiscovered: Boolean,                // default: false
  isOwnerManaged: Boolean,              // default: true
  isActive: Boolean,                    // default: true
  isFeatured: Boolean,                  // default: false
  isCanceled: Boolean,                  // default: false
  isRepeating: Boolean,                 // default: false
  cost: String,
  expiresAt: Date                       // required
}
```

### Categories Model
```javascript
{
  appId: String,                        // required
  categoryName: String,                 // required
  categoryCode: String,                 // required
  categoryNameAbbreviation: String,     // default: first 4 chars of categoryName uppercase
  createdAt: Date,                      // automatically added
  updatedAt: Date                       // automatically added
}
```

### Venues Model
```javascript
{
  appId: String,                        // required, default: "1"
  name: String,                         // required
  shortName: String,                    // default: ""
  address1: String,                     // required
  address2: String,                     // default: ""
  city: String,                         // required
  state: String,                        // default: ""
  zip: String,                          // default: ""
  phone: String,                        // default: ""
  comments: String,                     // default: ""
  latitude: Number,                     // required
  longitude: Number,                    // required
  isValidVenueGeolocation: Boolean,     // default: false
  geolocation: {
    type: String,                       // default: "Point"
    coordinates: [Number]               // required, [longitude, latitude]
  },
  masteredCityId: ObjectId,             // ref: "masteredCity"
  masteredDivisionId: ObjectId,         // ref: "masteredDivision"
  masteredRegionId: ObjectId,           // ref: "masteredRegion"
  masteredCountryId: ObjectId,          // ref: "masteredCountry"
  isActive: Boolean,                    // default: true
  createdAt: Date,                      // default: Date.now
  updatedAt: Date                       // default: Date.now
}
```

### User Logins Model
```javascript
{
  appId: String,                        // required, default: "1"
  firebaseUserId: String,               // required, unique
  mfaEnabled: Boolean,                  // default: false
  roleIds: [ObjectId],                  // ref: "Roles", required, default: []
  firebaseUserInfo: {
    email: String,
    displayName: String,
    lastSyncedAt: Date                  // default: Date.now
  },
  localUserInfo: {
    isApproved: Boolean,                // default: true
    isEnabled: Boolean,                 // default: true
    isActive: Boolean,                  // default: true
    ApprovalDate: Date,
    loginUserName: String,
    firstName: String,
    lastName: String,
    userDefaults: {
      region: ObjectId,                 // ref: "Regions", required
      division: Mixed,
      city: Mixed
    }
  },
  regionalOrganizerInfo: {
    organizerId: ObjectId,              // ref: "Organizers"
    isApproved: Boolean,                // default: false
    isEnabled: Boolean,                 // default: false
    isActive: Boolean,                  // default: false
    ApprovalDate: Date
  },
  active: Boolean,                      // default: true
  createdAt: Date,                      // default: Date.now
  updatedAt: Date                       // default: Date.now
}
```

### Organizers Model
```javascript
{
  appId: String,                        // required, default: "1"
  linkedUserLogin: ObjectId,            // ref: "userLogins"
  firebaseUserId: String,               // unique if exists
  fullName: String,                     // required, default: "CHANGE"
  shortName: String,                    // required, default: "CHANGE"
  description: String,
  publicContactInfo: {
    phone: String,
    Email: String,
    url: String,
    address: {
      street1: String,
      street2: String,
      city: String,
      state: String,
      postalCode: String
    }
  },
  delegatedOrganizerIds: [ObjectId],    // ref: "Organizers"
  organizerPublicImageURL: String,
  wantRender: Boolean,                  // default: false
  isActive: Boolean,                    // default: false
  isEnabled: Boolean,                   // default: false
  organizerRegion: ObjectId,            // ref: "Regions", required
  organizerDivision: ObjectId,          // ref: "Divisions"
  organizerCity: ObjectId,              // ref: "Cities"
  organizerTypes: {
    isEventOrganizer: Boolean,          // required, default: true
    isVenue: Boolean,                   // required, default: false
    isTeacher: Boolean,                 // required, default: false
    isMaestro: Boolean,                 // required, default: false
    isDJ: Boolean,                      // required, default: false
    isOrchestra: Boolean                // required, default: false
  },
  updatedAt: Date,                      // default: Date.now
  lastEventActivityAsOrganizer: Date,   // default: Date.now
  isActiveAsOrganizer: Boolean          // default: true
}
```

### Roles Model
```javascript
{
  roleName: String,                     // required
  roleNameCode: String,                 // required
  description: String,                  // required
  appId: String,                        // required
  permissions: [String],                // default: []
  createdAt: Date,                      // default: Date.now
  updatedAt: Date                       // default: Date.now
}
```

### Mastered Locations Models

#### Mastered Country
```javascript
{
  appId: String,                        // required, default: "1"
  countryName: String,                  // required
  countryCode: String,                  // required
  continent: String,                    // required
  active: Boolean                       // default: true
}
```

#### Mastered Region
```javascript
{
  appId: String,                        // required, default: "1"
  regionName: String,                   // required
  regionCode: String,                   // required
  active: Boolean,                      // default: true
  masteredCountryId: ObjectId           // ref: "MasteredCountry", required
}
```

#### Mastered Division
```javascript
{
  appId: String,                        // required, default: "1"
  divisionName: String,                 // required
  divisionCode: String,                 // required
  active: Boolean,                      // default: true
  masteredRegionId: ObjectId,           // ref: "MasteredRegion", required
  states: [String]                      // required
}
```

#### Mastered City
```javascript
{
  appId: String,                        // required, default: "1"
  cityName: String,                     // required
  cityCode: String,                     // required
  latitude: Number,                     // required
  longitude: Number,                    // required
  location: {
    type: String,                       // enum: ["Point"], required, default: "Point"
    coordinates: [Number]               // required, [longitude, latitude]
  },
  isActive: Boolean,                    // default: true
  masteredDivisionId: ObjectId          // ref: "MasteredDivision", required
}
```

## Error Handling

Most endpoints follow a consistent error handling pattern:

- 400: Bad Request - Missing required parameters or invalid input
- 401: Unauthorized - Missing or invalid authentication token
- 403: Forbidden - Insufficient permissions for the requested operation
- 404: Not Found - Resource not found
- 409: Conflict - Duplicate resource or conflicting operation
- 500: Internal Server Error - Unexpected server error

Errors typically return a JSON object with a `message` field and sometimes additional details:

```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "details": "Additional information"
}
```