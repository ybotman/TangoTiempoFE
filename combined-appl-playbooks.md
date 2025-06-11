# TangoTiempo — Authentication & Role Workflow

## 1. Firebase Authentication  
- **Login:** Users sign in via Firebase Auth, receiving a unique **Firebase UID**.  
- **Firebase UID** serves as the primary key to link into our application data.

## 2. UserLogins Collection  
- One-to-one mapping: **Firebase UID ↔ UserLogin** document.  
- **UserLogin** fields:  
  - `_id` (UserLogin ID)  
  - `firebaseUid`  
  - `roles: string[]` (e.g. `NamedUser`, `RegionalOrganizer`, `RegionalAdmin`)  
  - `organizerId?: ObjectId` (populated when approved as an organizer)

## 3. Roles Collection  
- Defines all possible roles:  
  - `NamedUser` (read-only)  
  - `RegionalOrganizer` (event‐create/edit)  
  - `RegionalAdmin` (higher‐level management)  
- UserLogin’s `roles` array references these values.

## 4. Organizer Approval & Linking  
1. **Application:** A user requests to become an organizer.  
2. **CalOps Approval:** Admin reviews and, if approved:  
   - Creates an **Organizer** document (`_id = organizerId`)  
   - Updates the user’s UserLogin:  
     ```js
     userLogin.organizerId = organizerId;
     userLogin.roles.push("RegionalOrganizer");
     ```  
   - Copies `firebaseUid` into the Organizer record for traceability.

## 5. Role Switching at Runtime  
- **Default Role:** Upon login, users start as `NamedUser`.  
- **Switch Role:** A UI control lets the user toggle to `RegionalOrganizer` if they have that role.  
- **Permissions Change:**  
  - **NamedUser**:  
    - Browse all public events  
    - Favorite organizers  
    - Receive notifications (per tier)  
  - **RegionalOrganizer**:  
    - Filter to view *only* events they own  
    - Create / edit / cancel events under their `organizerId`  
    - Manage venues within their region

## 6. Event Creation Workflow  
1. **Login → Firebase UID → UserLogin** lookup  
2. **Role = RegionalOrganizer?**  
   - Yes → Load organizer’s events (`event.organizerId == userLogin.organizerId`)  
   - No → Read-only view  
3. **Create/Edit Event:**  
   - New event document is saved with `organizerId` = userLogin.organizerId  
   - Security rules enforce that only RegionalOrganizers may write events with their own organizerId

---
**Note:**  
- The one-to-one mapping of Firebase UID, UserLogin ID, and Organizer ID ensures secure, traceable role assignments.  
- Role arrays in UserLogin drive UI permissions and API access.  
- CalOps remains the source of truth for approving and managing organizer relationships.  # 🔐 Using `NEXT_PUBLIC_FIREBASE_JSON` in Your Vercel Environment

This app uses a single base64-encoded environment variable to store the entire Firebase configuration object required by the frontend. This is helpful for keeping your `.env` files and Vercel dashboard clean, especially when multiple Firebase keys are involved.

---

## 📦 Why Use Base64-Encoded JSON?

Instead of storing each key separately like this:

```env
NEXT_PUBLIC_FIREBASE_APIKEY=...
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECTID=...
```

We use a single environment variable:

```env
NEXT_PUBLIC_FIREBASE_JSON=ewogICAgImFwaUtleSI6ICJBSXphU3lCYnlKdXh1Q0lZLUJ3e... (truncated)
```

This base64 string represents a full Firebase config object.

---

## 🔓 Decoding the Variable

The `NEXT_PUBLIC_FIREBASE_JSON` value is base64-encoded. When decoded, it returns the following JSON:

```json
{
  "apiKey": "AIzaSyBbyJuxuCIY-BwxLPItpQbtegAkAMo755o",
  "authDomain": "tangotiempo-257ff.firebaseapp.com",
  "projectId": "tangotiempo-257ff",
  "storageBucket": "tangotiempo-257ff.appspot.com",
  "messagingSenderId": "685681979859",
  "appId": "1:685681979859:web:6609aa591ea8917166bf26",
  "measurementId": "G-8DED6NXCJ8"
}
```

---

## 🔧 How to Decode Locally

### In Node.js:

```js
const firebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);
```

### In Bash:

```bash
echo $NEXT_PUBLIC_FIREBASE_JSON | base64 -d
```

---

## 🚨 Security Notes

* This method is **not secure** — it's only obfuscation, not encryption.
* Do not put private Firebase Admin SDK keys in the frontend.
* Only include the public Firebase web config (safe to expose).

---

## ✅ When to Use

Use this method when:

* You want to reduce clutter in your Vercel or local `.env` files
* You need to pass the full Firebase web config to your frontend
* You're deploying on platforms (like Vercel) that have better support for single-string vars

---

## 🧪 Testing It

To validate your Firebase config in the browser or console:

```js
const config = JSON.parse(atob(process.env.NEXT_PUBLIC_FIREBASE_JSON));
console.log(config);
```

You should see the full object printed in your dev tools.

---

This approach keeps your env clean and centralizes all config data while preserving compatibility with Firebase Web SDK initialization.
# TangoTiempo.com Event & Geolocation System (README)

## Overview
TangoTiempo.com (TT.com) provides a national calendar of Argentine tango events, built with precision geographic tagging and flexible event filtering. This system is centered on two location models: `Venue` (the physical address of the event) and the `Mastered Location Hierarchy` (City > Division > Region > Country), which supports broad search queries, normalized filtering, and geographic distance calculations.

This README outlines the data structure, usage, and event filtering strategy for TT.com's geolocation-aware calendar system.

---

## Core Concepts

### 1. Events
Every Event in TT.com has the following required attributes:
- **title**: The name of the event
- **startDate** and **endDate**: When the event begins and ends
- **venueID**: A reference to a `Venue` where the event takes place

Additional attributes may include multiple organizers, categories, featured flags, and geolocation-based filtering metadata. Events also contain:
- `isActive`: Whether the event is currently visible
- `categoryFirstId`, `categorySecondId`, `categoryThirdId`: For fine-grained event classification

### 2. Venue
Each venue represents a physical place, like a dance studio or event hall. Key fields:
- **name**, **address1**, **city**, **state**, **zip**
- **geolocation**: `{ type: "Point", coordinates: [longitude, latitude] }`
- **masteredCityId**, **masteredDivisionId**, **masteredRegionId**

Venues include a geospatial index and are always assigned to a mastered city (either explicitly or via proximity detection).

### 3. Mastered Location Hierarchy
This hierarchy is a curated set of normalized cities and regions for standardizing geographic categorization.
- `masteredCity`: includes geolocation and references a `masteredDivision`
- `masteredDivision`: contains U.S. state abbreviations and links to `masteredRegion`
- `masteredRegion`: groups multiple divisions (e.g., Northeast)

All mastered locations are indexed and can be queried independently or in combination.

### 4. Deprecated `Location` Model
The legacy `Location` model has been fully deprecated. Event references to `locationID` are now redirected to `venueID`, and all filtering logic is migrated to use `Venue` and `MasteredLocation` collections. Migration and compatibility APIs remain for legacy support, but are tagged with `deprecationNotice`.

---

## Filtering & Search Options
Event filtering in TT.com supports flexible combinations of:

### A. Venue-Based Filtering
- Search by specific `venueID`
- Search by `geolocation` proximity using `$near` queries
- Example use: `GET /api/events?lat=42.35&lng=-71.05&radius=20km`

### B. Mastered Location-Based Filtering
- Search by ObjectId: `masteredCityId`, `masteredDivisionId`, `masteredRegionId`
- Search by canonical names: `masteredCityName`, `masteredRegionName`
- Combines well with geolocation fallback

### C. Combined Filtering
Filters can be composed:
- Venue proximity + Region
- Organizer + City
- Category + Date Range + City

---

## Primary API Endpoints

### Events
- `GET /api/events/` — full event search with advanced filtering (location, category, organizer, dates, etc.)
- `GET /api/events/all` — fetch all events for an appId
- `POST /api/events/post` — create a new event
- `PUT /api/events/:id` — update an event
- `DELETE /api/events/:id` — remove an event
- `GET /api/events/byMasteredLocations` — retrieve events by region/division/city name
- `GET /api/events/byRegionAndCategory` — filter by masteredRegion and category

### Venues
- `GET /api/venues/` — search for venues by name, region, or city
- `POST /api/venues/` — create a new venue (with auto-city association)
- `GET /api/venues/nearest-city` — find nearest mastered city for lat/lng

### Mastered Locations
- `GET /api/masteredLocations/regions` — list of regions
- `GET /api/masteredLocations/divisions` — list of divisions by region
- `GET /api/masteredLocations/cities` — cities by division
- `GET /api/masteredLocations/nearestMastered` — nearest mastered city to lat/lng

### Deprecated
- `GET /api/locations/` — legacy API mapped internally to `venues`

---

## Notes on Implementation
- All venue entries must include `latitude`, `longitude`, and an address.
- All geolocation fields are indexed using MongoDB's `2dsphere` indexes.
- New venue creation includes automatic duplicate detection within 100 meters.
- When a new venue is added, if `masteredCityId` is not provided, the system finds the nearest mastered city using `$near` and assigns the full hierarchy (division, region, country).
- Filtering logic in `/api/events/` supports both backward-compatible name filters and forward-compatible ObjectId filters.

---

## Summary
TT.com's geolocation system merges precision and abstraction: precision via physical venue coordinates, and abstraction via the normalized mastered region system. Every event is both place-specific and region-aware. This dual structure supports flexible calendar filtering, venue clustering, geospatial relevance sorting, and scalable geographic search across thousands of entries per year.

By transitioning from deprecated `Location` models to `Venue`-driven and mastered city hierarchy-based filtering, the TT.com platform ensures long-term flexibility, speed, and clarity in data architecture.

-- NOTE : LOCATIONS HAS BEEN COMPLETED, VENUES are the NORM.
-- NOTE :  REGIONS CONTEXT APPEARS TO BE NO LONGER USE USED and MAY BE RETIRED.


Summary finds for the STATES

  1. The LocationContextModal component is fetching cities with coordinates through the useMasteredLocations hook
  2. I've confirmed that the cities API endpoint returns data with latitude/longitude coordinates
  3. The modal includes proper CSS imports for Leaflet and uses dynamic imports for map components
  4. The component has a guard to filter out cities without coordinates
  5. The modal includes debug logging to track what's happening during rendering
# User Login Optimization Applied

This file documents the optimization applied to the `/api/userlogins/firebase/:firebaseId` endpoint.

## Optimizations Applied

1. Added timeout handling for database queries and Firebase API calls
2. Implemented conditional Firebase data refresh to reduce API calls
3. Used lean() queries for better MongoDB performance
4. Added detailed logging and timing information
5. Provided better error handling with specific status codes

## Performance Improvements

- Reduced Firebase API calls by only refreshing stale data (older than 24 hours)
- Eliminated pre-save hook overhead by using direct updateOne() operations
- Added query timeouts to prevent indefinite waiting
- Added proper error handling for better client-side experience

## MongoDB Indexes Applied

The following indexes have been created to improve query performance:

```javascript
// Primary lookup index for authentication
db.userlogins.createIndex({ "firebaseUserId": 1, "appId": 1 }, { unique: true });

// Role-based lookups
db.userlogins.createIndex({ "roleIds": 1 });

// Active users lookup
db.userlogins.createIndex({ "active": 1, "appId": 1 });

// Regional organizer lookup
db.userlogins.createIndex({ "regionalOrganizerInfo.organizerId": 1 });
db.userlogins.createIndex({ 
  "regionalOrganizerInfo.isActive": 1, 
  "regionalOrganizerInfo.isEnabled": 1,
  "regionalOrganizerInfo.isApproved": 1
});
```

## Verification

Please test the endpoint with a variety of users to verify the performance improvements.

Applied: 2025-04-26T06:10:07.120Z
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
```# MasterCalendar API Usage Guide

This document provides a programming-oriented reference for the available API endpoints in the MasterCalendar backend. It is intended for developers integrating with the system, building frontend clients, or automating workflows.

---

## Table of Contents
- [General Notes](#general-notes)
- [Authentication](#authentication)
- [Events API](#events-api)
- [Organizers API](#organizers-api)
- [Regions API](#regions-api)
- [Categories API](#categories-api)
- [Locations API](#locations-api)
- [Venues API](#venues-api)
- [UserLogins API](#userlogins-api)
  - [Optimized vs Legacy](#optimized-vs-legacy-userlogins)
- [Roles API](#roles-api)
- [Health & Debug](#health--debug)
- [Examples](#examples)

---

## General Notes
- All endpoints are prefixed with `/api/`.
- Most endpoints support standard REST verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Data is exchanged as JSON.
- CORS is enabled for allowed origins.

## Authentication
- Some endpoints require authentication (see middleware in codebase).
- Auth is typically via Firebase JWT or session.

---

## Events API
**Base:** `/api/events`

### Endpoints
- `GET /api/events` — List events (supports filters)
- `GET /api/events/:id` — Get event by ID
- `POST /api/events` — Create new event
  - **Required fields:**
    - `name` (string)
    - `startDate` (ISO date string)
    - `endDate` (ISO date string)
    - `categoryId` (ObjectId or string)
    - `venueId` (ObjectId or string)
    - `organizerId` (ObjectId or string)
  - **Optional fields:**
    - `description`, `url`, `image`, etc.
- `PUT /api/events/:id` — Update event
  - **Required:** `id` in URL, body with fields to update
- `DELETE /api/events/:id` — Delete event
  - **Required:** `id` in URL

---

## Organizers API
**Base:** `/api/organizers`

### Endpoints
- `GET /api/organizers` — List all organizers (supports filters)
- `GET /api/organizers/:id` — Get organizer by ID
- `POST /api/organizers` — Create a new organizer
  - **Required fields:**
    - `name` (string)
    - `contactEmail` (string)
  - **Optional fields:**
    - `website`, `phone`, `description`, etc.
- `PUT /api/organizers/:id` — Update an organizer
  - **Required:** `id` in URL, body with fields to update
- `DELETE /api/organizers/:id` — Delete an organizer
  - **Required:** `id` in URL

## Regions API
**DO NOT USE**
- The `/api/regions` endpoint is legacy and should not be used for new development or integrations.

## Categories API
**Base:** `/api/categories`
- Standard CRUD for categories

## Locations API
**Base:** `/api/locations`

### Endpoints
- `GET /api/locations` — List all locations (supports filters)
- `GET /api/locations/:id` — Get location by ID
- `POST /api/locations` — Create a new location
  - **Required fields:**
    - `name` (string)
    - `address` (string)
    - `city` (string or ObjectId)
    - `region` (string or ObjectId)
  - **Optional fields:**
    - `description`, `latitude`, `longitude`, etc.
- `PUT /api/locations/:id` — Update a location
  - **Required:** `id` in URL, body with fields to update
- `DELETE /api/locations/:id` — Delete a location
  - **Required:** `id` in URL

## Venues API
**Base:** `/api/venues`

### Endpoints
- `GET /api/venues` — List all venues (supports filters)
- `GET /api/venues/:id` — Get venue by ID
- `POST /api/venues` — Create a new venue
  - **Required fields:**
    - `name` (string)
    - `locationId` (ObjectId or string)
  - **Optional fields:**
    - `shortName`, `description`, `capacity`, etc.
- `PUT /api/venues/:id` — Update a venue
  - **Required:** `id` in URL, body with fields to update
- `DELETE /api/venues/:id` — Delete a venue
  - **Required:** `id` in URL

---

## UserLogins API
**Base:** `/api/userlogins`

### Optimized vs Legacy UserLogins
- There are two implementations:
  - **Optimized:** `/api/userlogins` (file: `routes/optimizedServerUserLogins.js`)
    - Used by default in production.
    - Performance improvements: query timeouts, audit log exclusion, lean queries, Firebase data caching.
    - Use this for all new integrations.
  - **Legacy:** `/api/userlogins` (file: `routes/serverUserLogins.js`)
    - Older implementation, kept for reference or fallback.

### Key Endpoints (Optimized)
- `GET /api/userlogins/all` — List users (pagination, filter by appId)
- `GET /api/userlogins/firebase/:firebaseId` — Get user by Firebase ID (with appId)
- `PUT /api/userlogins/updateUserInfo` — Update user info
  - **Required fields:**
    - `firebaseUserId` (string)
    - `appId` (string, default "1")
  - **Optional fields:**
    - `localUserInfo` (object: `firstName`, `lastName`, `notificationPreference`, etc.)
    - `regionalOrganizerInfo` (object)
    - `roleIds` (array of ObjectIds or strings)
  - **Body Example:**
    ```json
    {
      "firebaseUserId": "user_firebase_id",
      "appId": "1",
      "localUserInfo": {
        "firstName": "Test",
        "lastName": "User",
        "notificationPreference": "Email"
      }
    }
    ```
- `POST /api/userlogins/fix/oversized-documents` — Admin: Truncate large audit logs

---

## Roles API
**Base:** `/api/roles`
- Standard CRUD for user roles

---

## Health & Debug
- `GET /health` — Health check (status, version, DB, storage, Firebase, etc.)
- `GET /debug/db` — MongoDB connection and collections info

---

## Examples

### Update User Info
```js
// Update user info (first/last name, notification prefs, etc.)
await axios.put('/api/userlogins/updateUserInfo', {
  firebaseUserId: user.uid,
  appId: '1',
  localUserInfo: {
    firstName: 'Test',
    lastName: 'User',
    notificationPreference: 'Email'
  }
});
```

### Create Event
```js
await axios.post('/api/events', {
  name: 'Milonga Night',
  startDate: '2025-06-01T20:00:00Z',
  endDate: '2025-06-02T01:00:00Z',
  categoryId: '...',
  venueId: '...',
  organizerId: '...'
});
```

---

## Notes
- For full schema details, see the `models/` directory.
- For advanced usage (batch, admin, etc.), see the code or contact the backend team.
- This guide is for programming/integration use. For user-facing docs, see the main project README.


# Calendar Backend - README

## Overview

The **Calendar Backend** serves as the central data management hub for the **TangoTiempo** ecosystem, providing robust, reliable, and scalable backend services to multiple front-end applications. While several front-end interfaces interact with the backend, the role of the backend is to:

- **Manage Data**: Handle the creation, modification, and retrieval of calendar events, organizers, venues, and user roles.
- **Provide API Access**: Offer a set of RESTful API endpoints for querying and managing calendar-related data.
- **Ensure Security**: Implement Firebase authentication and authorization to manage user roles (e.g., NamedUser, RegionalOrganizer) and ensure that only authorized users can perform certain actions.
- **Support Event Management**: Facilitate event management for organizers, including event creation, editing, and deletion based on user roles.

## Short cut name is often just 
* BE or
* Cal-BE.com or
* Calendar-BE.com or
* C-BE


---

## Technology Stack

The Calendar Backend is built with the following technologies:

- **Node.js** (v20): Server-side JavaScript runtime for building scalable applications.
- **Express.js**: Web framework for Node.js used to build the RESTful API.
- **MongoDB**: NoSQL database to store calendar, event, venue, and user data.
- **Firebase**: Used for authentication and role-based access control.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB to manage the data flow.
- **JWT (JSON Web Tokens)**: For secure communication between the backend and front-end applications.

## User Experience

The **Calendar Backend** provides seamless functionality for the front-end applications, offering the following user experiences:

- **User Authentication**: Users can sign in with Firebase Authentication, and their roles (e.g., NamedUser, RegionalOrganizer) will define the actions they can perform within the calendar system.
- **Event Access**: Users can access events based on their role. RegionalOrganizers can create and manage their own events, while NamedUsers can only view events and set favorites.
- **Event Filtering**: Users can filter events by various parameters like region, organizer, and category.
- **Role Management**: Users who are authorized as organizers can manage their own events and venues, while admins have the ability to approve and manage organizers.

## Key Features

- **Event Management**: Organizers can create, edit, and delete events associated with their account.
- **Geolocation Filtering**: Events can be filtered by proximity to a specific geolocation.
- **Categorization**: Events are categorized into different types, making it easier to search and filter them.
- **Role-Based Permissions**: The backend uses Firebase to manage user roles and permissions, ensuring that each user can only access or modify data they are authorized to.

## API Documentation

The backend exposes several RESTful endpoints for interacting with the calendar data. Refer to the `/api` documentation for specific API routes and usage.// models/masteredCities.js
// models/MasteredCities.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredCitySchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  cityName: { type: String, required: true },
  cityCode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  location: {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  isActive: { type: Boolean, default: true },
  masteredDivisionId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredDivision",
    required: true,
  },
});

// 2dsphere index
masteredCitySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("masteredCity", masteredCitySchema);

// models/categories.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      required: true,
      // No default value - must be provided by frontend
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryCode: {
      type: String,
      required: true,
    },
    categoryNameAbbreviation: {
      type: String,
      required: false,
      default: function () {
        // Default abbreviation is first 4 characters of categoryName uppercase
        return this.categoryName
          ? this.categoryName.substring(0, 4).toUpperCase()
          : "";
      },
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  },
);

// Add a unique compound index for `appId` and `categoryCode`
CategorySchema.index({ appId: 1, categoryCode: 1 }, { unique: true });

const Categories = mongoose.model("Categories", CategorySchema);

module.exports = Categories;

// models/events.js
// models/events.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  // App identifier - required from frontend
  appId: { type: String, required: true },

  title: { type: String, required: true },
  standardsTitle: { type: String, required: false },
  shortTitle: { type: String, required: false },
  description: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categoryFirst: { type: String, required: false },
  categorySecond: { type: String, required: false },
  categoryThird: { type: String, required: false },
  categoryFirstId: { type: mongoose.Schema.Types.ObjectId, required: false },
  categorySecondId: { type: mongoose.Schema.Types.ObjectId, required: false },
  categoryThirdId: { type: mongoose.Schema.Types.ObjectId, required: false },
  ownerOrganizerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: true,
  },
  grantedOrganizerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: false,
  },
  alternateOrganizerID: { // Used in the index
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizers",
    required: false,
  },
  grantedOrganizerName: { type: String, required: false },
  alternateOrganizerName: { type: String, required: false },
  locationName: { type: String, required: false },
  ownerOrganizerName: { type: String, required: true },
  // Mastered location name fields (preserved for backward compatibility)
  masteredRegionName: { type: String, required: false },
  masteredDivisionName: { type: String, required: false },
  masteredCityName: { type: String, required: false },
  // New mastered location ObjectID reference fields
  masteredRegionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasteredRegion",
    required: false,
  },
  masteredDivisionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MasteredDivision",
    required: false,
  },
  masteredCityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "masteredCity",
    required: false,
  },
  // New geolocation field for masteredCity
  masteredCityGeolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  eventImage: { type: String, required: false },
  bannerImage: { type: String, required: false },
  featuredImage: { type: String, required: false },
  seriesImages: [{ type: String, required: false }],
  venueID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: false,
  },
  venueGeolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  recurrenceRule: { type: String, required: false },
  isDiscovered: { type: Boolean, required: true, default:false },
  isOwnerManaged: { type: Boolean, required: true, default: true },
  isActive: { type: Boolean, required: true, default: true },
  isFeatured: { type: Boolean, required: false, default: false },
  isCanceled: { type: Boolean, required: false, default: false },
  isRepeating: { type: Boolean, required: false, default: false },
  discoveredLastDate: { type: Date, required: false },
  discoveredFirstDate: { type: Date, required: false },
  discoveredComments: { type: String, required: false },
  cost: { type: String, required: false },
  expiresAt: { type: Date, required: true },
});

// Indexes for performance
eventSchema.index({ startDate: 1, endDate: 1 });
// Original string-based indexes (maintained for backward compatibility)
eventSchema.index({ masteredRegionName: 1 }); 
eventSchema.index({ masteredDivisionName: 1 });
eventSchema.index({ masteredCityName: 1 });
// New ObjectID-based indexes for mastered locations
eventSchema.index({ masteredRegionId: 1 });
eventSchema.index({ masteredDivisionId: 1 });
eventSchema.index({ masteredCityId: 1 });
// Combined indexes for efficient location queries
eventSchema.index({ masteredCityId: 1, startDate: 1 });
eventSchema.index({ masteredDivisionId: 1, startDate: 1 });
eventSchema.index({ masteredRegionId: 1, startDate: 1 });
// Organizer indexes
eventSchema.index({ ownerOrganizerID: 1 });
eventSchema.index({ grantedOrganizerID: 1 });
eventSchema.index({ alternateOrganizerID: 1 });
eventSchema.index({ venueID: 1 });

// Geospatial indexes for location-based queries
eventSchema.index({ venueGeolocation: '2dsphere' });
eventSchema.index({ masteredCityGeolocation: '2dsphere' });


// Pre-validate to ensure coordinates are set for masteredCityGeolocation
eventSchema.pre('validate', function(next) {
  // Boston coordinates as fallback
  const BOSTON_COORDINATES = [-71.0589, 42.3601];
  
  // If masteredCityGeolocation exists but has no coordinates, add default
  if (this.masteredCityGeolocation && 
      this.masteredCityGeolocation.type === 'Point' && 
      (!this.masteredCityGeolocation.coordinates || 
       this.masteredCityGeolocation.coordinates.length === 0)) {
    console.log(`Adding default Boston coordinates to event ${this._id || 'new'}`);
    this.masteredCityGeolocation.coordinates = BOSTON_COORDINATES;
  }
  next();
});
const Events = mongoose.model("Events", eventSchema);

module.exports = Events;

// models/masteredCountries.js
// models/MasteredCountry.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredCountrySchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  countryName: { type: String, required: true },
  countryCode: { type: String, required: true },
  continent: { type: String, required: true },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model("MasteredCountry", masteredCountrySchema);

// models/masteredDivisions.js
// models/MasteredDivisions.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredDivisionSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  divisionName: { type: String, required: true },
  divisionCode: { type: String, required: true },
  active: { type: Boolean, default: true },
  masteredRegionId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredRegion",
    required: true,
  },
  states: { type: [String], required: true },
});

module.exports = mongoose.model("MasteredDivision", masteredDivisionSchema);

// models/masteredRegions.js
// models/MasteredRegion.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const masteredRegionSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  regionName: { type: String, required: true },
  regionCode: { type: String, required: true },
  active: { type: Boolean, default: true },
  masteredCountryId: {
    type: Schema.Types.ObjectId,
    ref: "MasteredCountry",
    required: true,
  },
});

module.exports = mongoose.model("MasteredRegion", masteredRegionSchema);

// models/organizers.js
// models/organizers.js
const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  linkedUserLogin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userLogins",
    required: false, // Made optional to allow creation without user
  },
  firebaseUserId: { 
    type: String, 
    required: false, // Made optional to allow creation without user
    unique: true,
    sparse: true // Only enforce uniqueness if the field exists
  },
  fullName: { type: String, required: true, default: "CHANGE" },
  shortName: { type: String, required: true, default: "CHANGE" },
  description: { type: String },
  publicContactInfo: {
    phone: { type: String },
    Email: { type: String },
    url: { type: String },
    address: {
      street1: { type: String },
      street2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
  },
  delegatedOrganizerIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizers",
    },
  ],
  organizerPublicImageURL: { type: String },
  wantRender: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: false },
  isRendered: { type: Boolean, default: false },
  organizerBannerImage: { type: String, default: "/defaults/banner.png" },
  organizerProfileImage: { type: String, default: "/defaults/profile.png" },
  organizerLandscapeImage: { type: String, default: "/defaults/landscape.png" },
  organizerLogoImage: { type: String, default: "/defaults/logo.png" },
  images: [
    {
      originalUrl: { type: String },
      thumbnailUrl: { type: String },
      mediumUrl: { type: String },
      largeUrl: { type: String },
      imageType: {
        type: String,
        enum: ["thumbnail", "banner", "profile", "event"],
      },
      tags: [{ type: String }],
      uploadDate: { type: Date, default: Date.now },
      fileSize: { type: Number },
      resolution: { width: Number, height: Number },
      isApproved: { type: Boolean, default: true },
      isExternal: { type: Boolean, default: false },
      externalSource: { type: String },
      orientation: {
        type: String,
        enum: ["landscape", "portrait", "square"],
      },
      isMobileFriendly: { type: Boolean, default: true },
    },
  ],
  organizerRegion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Regions",
    required: true,
  },
  organizerDivision: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Divisions",
    required: false,
  },
  organizerCity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cities",
    required: false,
  },
  organizerTypes: {
    isEventOrganizer: { type: Boolean, required: true, default: true },
    isVenue: { type: Boolean, required: true, default: false },
    isTeacher: { type: Boolean, required: true, default: false },
    isMaestro: { type: Boolean, required: true, default: false },
    isDJ: { type: Boolean, required: true, default: false },
    isOrchestra: { type: Boolean, required: true, default: false },
  },

  updatedAt: { type: Date, default: Date.now },
  lastEventActivityAsOrganizer: { type: Date, default: Date.now },
  isActiveAsOrganizer: { type: Boolean, default: true },
  btcNiceName: { type: String, required: false },
});

// Middleware to update `updatedAt`
organizerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.isActiveAsOrganizer = true;
  next();
});

const Organizers = mongoose.model("Organizers", organizerSchema);
module.exports = Organizers;

// models/roles.js
const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  roleNameCode: { type: String, required: true },
  description: { type: String, required: true },
  appId: { type: String, required: true },
  permissions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add a unique compound index for appId and roleName
roleSchema.index({ appId: 1, roleName: 1 }, { unique: true });

const Roles = mongoose.model("Roles", roleSchema);
module.exports = Roles;

// models/userLogins.js
// models/userLogins.js
const mongoose = require("mongoose");

const notificationPreferencesSchema = new mongoose.Schema({
  new: { type: Boolean, default: false },
  updates: { type: Boolean, default: false },
});

const userCommunicationSettingsSchema = new mongoose.Schema({
  Favorites: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
  DefaultRegion: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
  ExternalRegions: {
    festivals: { type: notificationPreferencesSchema, default: {} },
    workshops: { type: notificationPreferencesSchema, default: {} },
    dayWorkshops: { type: notificationPreferencesSchema, default: {} },
    milongas: { type: notificationPreferencesSchema, default: {} },
    practices: { type: notificationPreferencesSchema, default: {} },
    classes: { type: notificationPreferencesSchema, default: {} },
    concerts: { type: notificationPreferencesSchema, default: {} },
  },
});

const userLoginSchema = new mongoose.Schema({
  // New: appId to differentiate per-application usage
  appId: { type: String, required: true, default: "1" },

  firebaseUserId: { type: String, required: true, unique: true },
  mfaEnabled: { type: Boolean, default: false },
  roleIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Roles" }],
    required: true,
    default: [],
  },
  firebaseUserInfo: {
    email: { type: String },
    displayName: { type: String },
    lastSyncedAt: { type: Date, default: Date.now }
  },
  localUserInfo: {
    isApproved: { type: Boolean, default: true },
    isEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    ApprovalDate: { type: Date },
    loginUserName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    userDefaults: {
      region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Regions",
        required: true,
        default: new mongoose.Types.ObjectId("66c4d99042ec462ea22484bd"),
      },
      division: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {
          _id: new mongoose.Types.ObjectId("6715f5b7f5342510489a6418"),
        },
      },
      city: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        default: {
          _id: new mongoose.Types.ObjectId("6715f5b7f5342510489a6419"),
        },
      },
    },
    subscribedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Events" }],
    favoriteOrganizers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
    ],
    notificationPreference: {
      type: String,
      enum: ["Application", "Email", "Text"],
      default: "Application",
    },
    photo: { type: String },
    imageSharingLevel: {
      type: String,
      enum: ["none", "friends", "all"],
      default: "none",
    },
    messagePrimaryMethod: {
      type: String,
      enum: ["app", "text", "email", "facebook", "twitter"],
      default: "app",
    },
    userCommunicationSettings: {
      type: userCommunicationSettingsSchema,
      default: {},
    },
  },
  regionalOrganizerInfo: {
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Organizers" },
    isApproved: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    ApprovalDate: { type: Date },
    allowedCities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cities" }],
    allowedDivisions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Divisions" },
    ],
    allowedRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Regions" }],
    organizerCommunicationSettingsAdmin: {
      messagePrimaryMethod: {
        type: String,
        enum: ["app", "text", "email", "social"],
        default: "app",
      },
    },
  },
  localAdminInfo: {
    isApproved: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    ApprovalDate: { type: Date },
    adminRegions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Regions" }],
    adminDivisions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Divisions" },
    ],
    adminCities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cities" }],
    userCommunicationSettings: {
      wantFestivalMessages: { type: Boolean, default: false },
      wantWorkshopMessages: { type: Boolean, default: false },
      messagePrimaryMethod: {
        type: String,
        enum: ["app", "text", "email", "social"],
        default: "app",
      },
    },
  },
  auditLog: [
    {
      eventType: { type: String, required: false, default: "update" },
      eventTimestamp: { type: Date, required: false, default: Date.now },
      ipAddress: { type: String },
      platform: { type: String, required: false },
      details: { type: String },
      previousData: { type: mongoose.Schema.Types.Mixed },
    },
  ],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save middleware to log changes and ensure active flags are in sync
userLoginSchema.pre("save", async function (next) {
  if (!this.isNew) {
    const previousDoc = await this.constructor.findById(this._id).lean();
    if (previousDoc) {
      // Only store important fields, not the entire document
      // This prevents recursive growth of the document size
      const { 
        firebaseUserId, 
        roleIds, 
        active,
        regionalOrganizerInfo,
        localUserInfo,
        localAdminInfo
      } = previousDoc;
      
      // Create a reduced audit entry with just the relevant fields
      this.auditLog.push({
        eventType: "update",
        eventTimestamp: new Date(),
        ipAddress: this.ipAddress,
        platform: this.platform,
        // Store only essential previous data, not the entire document
        previousData: {
          firebaseUserId,
          roleIds,
          active,
          regionalOrganizerInfo: regionalOrganizerInfo ? {
            organizerId: regionalOrganizerInfo.organizerId,
            isActive: regionalOrganizerInfo.isActive,
            isEnabled: regionalOrganizerInfo.isEnabled,
            isApproved: regionalOrganizerInfo.isApproved
          } : null,
          localUserInfo: localUserInfo ? {
            firstName: localUserInfo.firstName,
            lastName: localUserInfo.lastName,
            isActive: localUserInfo.isActive,
            isEnabled: localUserInfo.isEnabled,
            isApproved: localUserInfo.isApproved
          } : null,
          localAdminInfo: localAdminInfo ? {
            isActive: localAdminInfo.isActive,
            isEnabled: localAdminInfo.isEnabled,
            isApproved: localAdminInfo.isApproved
          } : null
        }
      });
    }
  }
  
  // Ensure top-level active is true if user has active regionalOrganizerInfo
  if (this.regionalOrganizerInfo && 
      this.regionalOrganizerInfo.organizerId && 
      this.regionalOrganizerInfo.isActive === true && 
      this.regionalOrganizerInfo.isEnabled === true && 
      this.regionalOrganizerInfo.isApproved === true) {
    this.active = true;
  }
  
  // Ensure every user has the NamedUser role (NU) regardless of appId
  try {
    // Only run this check if roleIds exists and is an array
    if (this.roleIds && Array.isArray(this.roleIds)) {
      if (this.roleIds.length === 0) {
        // Need to find and add the NamedUser role for this appId
        const Roles = mongoose.model('Roles');
        // First try to find the NU role for this specific appId
        let namedUserRole = await Roles.findOne({ roleNameCode: 'NU', appId: this.appId });
        
        // If not found for this specific appId, try to find for appId "1" (default)
        if (!namedUserRole) {
          namedUserRole = await Roles.findOne({ roleNameCode: 'NU', appId: "1" });
        }
        
        // If found in either case, add it
        if (namedUserRole) {
          this.roleIds.push(namedUserRole._id);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring default NamedUser role:', error);
    // Continue with save even if role check fails
  }
  
  this.updatedAt = Date.now();
  next();
});

// Use exact collection name to match existing data
const UserLogins = mongoose.model("userlogins", userLoginSchema);

module.exports = UserLogins;

// models/venues.js
// models/Venue.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const venueSchema = new Schema({
  // New
  appId: { type: String, required: true, default: "1" },

  name: { type: String, required: true },
  shortName: { type: String, default: "" },
  address1: { type: String, required: true },
  address2: { type: String, default: "" },
  address3: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, default: "" },
  zip: { type: String, default: "" },
  phone: { type: String, default: "" },
  comments: { type: String, default: "" },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  isValidVenueGeolocation: { type: Boolean, default: false },
  geolocation: {
    type: { type: String, default: "Point", enum: ["Point"] },
    coordinates: { 
      type: [Number],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 2;
        },
        message: "Coordinates must be [longitude, latitude]",
      },
    },
  },
  masteredCityId: { type: Schema.Types.ObjectId, ref: "masteredCity" },
  masteredDivisionId: { type: Schema.Types.ObjectId, ref: "masteredDivision" },
  masteredRegionId: { type: Schema.Types.ObjectId, ref: "masteredRegion" },
  masteredCountryId: { type: Schema.Types.ObjectId, ref: "masteredCountry" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
venueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
venueSchema.index({ geolocation: "2dsphere" });
venueSchema.index({ appId: 1, isActive: 1 });
venueSchema.index({ masteredCityId: 1 });
venueSchema.index({ masteredDivisionId: 1 });
venueSchema.index({ masteredRegionId: 1 });
venueSchema.index({ name: 1 });
venueSchema.index({ name: 'text', address1: 'text', city: 'text' }); // Text search index
venueSchema.index({ appId: 1, masteredCityId: 1, isActive: 1 }); // Combined index for common query pattern

module.exports = mongoose.model("Venue", venueSchema);

# TangoTiempo.com

**TangoTiempo** is the United States’ first fully dedicated Argentine Tango event calendar. It provides a centralized, intuitive, and mobile-friendly interface for dancers, organizers, and tango communities to post, find, and interact with tango events.

## Short cut name is often just 
* TT or
* TT.com

---

## 🌐 Live Site

> [https://tangotiempo.com](https://tangotiempo.com)

---

## 📐 Architecture Overview

- **Frontend:**  
  - Built with **Next.js 15** (App Router) and **React 19+**  
  - Styled using **MUI (Material-UI v6+)**  
  - SSR + CSR hybrid setup for fast loading and SEO
- **Backend API:**  
  - Node.js (v20) + Express (served separately)
  - Hosted on Azure App Service
- **Database:**  
  - MongoDB Atlas (GeoJSON support for venue search)
- **Auth & Hosting:**  
  - Firebase Authentication (Organizers & Admin roles)
  - Cloudflare for CDN and domain management
- **CI/CD:**  
  - GitHub Actions for automated builds and deployments
- **Analytics:**  
  - Vercel Analytics + Google Analytics integration

---

## 📦 Folder Structure (Frontend)

```shell
src/
├── app/               # Next.js app router directory
│   ├── layout.js      # Root layout
│   └── page.jsx       # Landing page
├── components/        # Shared components (UI, forms, context)
├── firebase/          # Firebase client config & helpers
├── hooks/             # Custom React hooks
├── lib/               # API utilities, constants, helper funcs
├── styles/            # Global styles, MUI theme
├── public/            # Static assets (favicon, images)
└── types/             # PropTypes & shared JS types


⸻

🔐 Roles & Permissions
	•	Named User (NU):
	•	Can favorite organizers, get event notifications (tiered), and see banners
	•	Organizer:
	•	Manages events (CRUD), venue linking, ad campaigns
	•	Regional Organizer (RO):
	•	Approves new organizers/venues for their region
	•	Admin (via CalOps):
	•	Full control (CRUD for events, orgs, venues, banners)

⸻

📊 Feature Highlights
	•	📅 Advanced Calendar Filtering: by location, category, date
	•	📍 Venue Geolocation & Mapping
	•	🔔 Tiered Notification System: based on favorite orgs + region
	•	🖼️ Banner Ad Campaigns: organizers can run and target
	•	🔒 Secure Firebase Auth: role-based content access
	•	🧪 Cypress E2E Testing (Planned)
	•	⚙️ Admin Tool (CalOps): separate admin dashboard for ops

⸻

🚀 Getting Started (Local Dev)

# Frontend
cd tangotiempo.com
npm install
npm run dev

Dependencies:
	•	Node 20+
	•	MongoDB URI (set in .env.local)
	•	Firebase API keys (set in .env.local)

⸻

🧪 Testing

Cypress integration for:
	•	Event views
	•	Organizer auth flow
	•	API fetch validation (frontend and backend)

⸻

📝 Environment Variables (.env.local)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api


⸻

🤝 Contributing

Pull requests welcome! Use feature branches and ensure PropTypes and tests are in place.

⸻

🛡️ License

© 2025 TangoTiempo.com – All Rights Reserve# TangoTiempo Context System Analysis

## Overview
TangoTiempo uses React's Context API extensively to manage state across the application. The context system primarily handles authentication, user roles, and location-based functionality. This document focuses on the location-related contexts, which form a complex interdependent system.

## Context Hierarchy

Provider initialization order (from Providers.js):
1. **AuthProvider** - Authentication state
2. **RegionsProvider** - Legacy location system (being deprecated)
3. **LocalizationProvider** - Date/time localization 
4. **RoleProvider** - User role management
5. **GeoLocationProvider** - Unified location system (→ now initializes BEFORE MasteredLocationProvider)
6. **MasteredLocationProvider** - Canonical location data from backend

## Location Context System Analysis

### Three Interrelated Location Contexts

TangoTiempo has three contexts for location management:

1. **GeoLocationContext**
   - Purpose: A unified location system that handles both the user's actual geographic location AND the selected location for filtering content
   - Key State:
     - userLocation: The user's actual physical coordinates (from IP-based geolocation)
     - selectedLocation: The location for filtering content (city, division, region structure)
   - Role:
     - Acts as the high-level context that both stores the user's physical location
     - Manages the selected filtering location (which may be different from where the user is)
     - Gradually replacing RegionsContext with more modern functionality

2. **MasteredLocationContext**
   - Purpose: Provides canonical location data from the backend database
   - Key State:
     - nearestCity: The nearest canonical city to the user's location with complete hierarchy info
   - Role:
     - Ensures locations match the canonical database structure
     - Provides authoritative location data that matches backend records
     - Supplies validated location IDs needed for API calls

3. **RegionsContext** (Deprecated)
   - Purpose: Legacy system for region selection
   - Key State:
     - selectedRegion, selectedDivision, selectedCity
     - selectedRegionID
   - Role:
     - Being phased out in favor of GeoLocationContext
     - Maintained for backward compatibility with older components

### The Circular Dependency Problem

A critical architectural issue exists between GeoLocationContext and MasteredLocationContext:

```
GeoLocationContext ←→ MasteredLocationContext
```

- **GeoLocationContext** imports `useMasteredLocation` from MasteredLocationContext
- **MasteredLocationContext** imports `useGeoLocation` from GeoLocationContext

This creates a bootstrapping problem during initialization.

### Current Solution

The circular dependency is currently managed through several mechanisms:

1. **Provider Order Change**:
   - GeoLocationProvider now initializes before MasteredLocationProvider
   - This allows GeoLocationContext to have a stable identity before MasteredLocationContext tries to use it

2. **Function Registration Pattern**:
   - GeoLocationContext defines a `registerMasteredLocationFunctions` method
   - MasteredLocationContext calls this method after initialization to register its capabilities
   - This allows deferred dependency resolution

3. **Standalone Implementation**:
   - GeoLocationContext includes its own `fetchNearestCityImpl` function
   - This provides fallback functionality when MasteredLocationContext isn't fully initialized

4. **Null Handling**:
   - Both contexts handle null values from each other
   - Default values and fallbacks are provided for when dependencies aren't yet available

## Implications for Venue Selection

The venue selection system relies on this location context architecture:

1. **useVenueSelection Hook**:
   - Connects venue data with the location context system
   - Depends on GeoLocationContext for the current selected location
   - Filters venues based on location hierarchy (city, division, region)
   - Provides distance calculation for venues based on current center point

2. **VenueSelectionModal**:
   - Requires an initialized GeoLocationContext
   - Checks for `hasSelectedCity` before attempting to load venues
   - Displays appropriate user feedback when location system is not fully initialized

## Architectural Recommendations

1. **Complete the Context Transition**:
   - Finish migrating RegionsContext functionality to GeoLocationContext
   - Remove RegionsContext when no longer needed

2. **Resolve Circular Dependency**:
   - Create a shared utility layer for common location functions
   - Consider merging contexts or more clearly separating responsibilities
   - Design a true hierarchical relationship where one context clearly depends on the other

3. **Standardize Data Formats**:
   - Ensure consistent coordinate storage formats across the app
   - Standardize on a single source of truth for location data
   - Add type validation or TypeScript to prevent format inconsistencies

4. **Improve Initialization Logic**:
   - Add explicit initialization states for better UX during loading
   - Implement progressive enhancement when contexts are partially initialized
   - Reduce redundant API calls during initialization

5. **Enhance Error Resilience**:
   - Expand the fallback systems to handle more edge cases
   - Improve error reporting for location system failures
   - Add recovery mechanisms for when geolocation services fail

## Specific Issues

1. **Coordinate Format Inconsistency**:
   - Some parts of the system use direct latitude/longitude properties
   - Others use GeoJSON format with location.coordinates
   - This inconsistency requires extra parsing and validation

2. **Cascade Loading Effects**:
   - The multi-layered context system creates cascading loading states
   - Users may experience sequential loading indicators
   - Could be improved through parallel data loading strategies

3. **Data Duplication**:
   - Location data is duplicated across contexts
   - Synchronization logic adds complexity and potential for inconsistencies
   - A single source of truth would simplify the architecture

## Conclusion

The TangoTiempo location context system provides robust functionality but with significant complexity. The current implementation successfully manages the circular dependency through creative solutions, but a more fundamental redesign could simplify the architecture and improve maintainability. The recommendations above provide a roadmap for addressing these architectural challenges.# GeoLocation System: Current State & Roadmap

## System Overview
TangoTiempo's geolocation system provides location-based filtering, venue selection, and regional organization functionality. The system is built on several interconnected components that manage location data across the application.

## Core Architecture

### Data Models
1. **Venue**: 
   - Physical address with geolocation coordinates
   - References to mastered locations (masteredCityId, masteredDivisionId, masteredRegionId)
   - Geospatial index for proximity queries

2. **MasteredLocation Hierarchy**:
   - **MasteredCity**: Canonical city data with coordinates
   - **MasteredDivision**: State/province level (e.g., MA, CA)
   - **MasteredRegion**: Regional grouping (e.g., Northeast, Southwest)
   - **Country**: Top-level geographic division

3. **Events**:
   - Reference venues via venueID
   - Inherit geolocation data from venues

### Context Providers
1. **GeoLocationContext**:
   - Manages user's physical location (from IP geolocation)
   - Handles selected location for filtering content
   - Determines available filtering options
   - Acts as the high-level context for location state

2. **MasteredLocationContext**:
   - Provides canonical location data from the backend
   - Maps coordinates to nearest mastered locations
   - Ensures locations match the database structure
   - Supplies validated location IDs for API calls

3. **RegionsContext** (Deprecated):
   - Legacy system for region selection
   - Being phased out in favor of GeoLocationContext
   - Maintained for backward compatibility

## Critical Issues

### 1. Circular Dependencies
- **GeoLocationContext** imports from MasteredLocationContext
- **MasteredLocationContext** imports from GeoLocationContext
- This creates a bootstrapping problem during initialization
- Provider order in Providers.js affects which context initializes first
- Current workaround uses function registration pattern to defer dependency resolution

### 2. Initialization Race Conditions
- Components render before contexts are fully initialized
- Contexts have interdependencies creating timing issues
- Fallback mechanisms trigger inconsistently across components
- No clear loading states or synchronization between contexts
- API rate limiting exacerbates timing issues

### 3. Inconsistent Data Access
- Different components access location data through different paths
- Some use GeoLocationContext directly
- Others use MasteredLocationContext or RegionsContext
- No standardized access pattern across the application
- Data changes in one context don't reliably propagate to others

### 4. Coordinate Format Inconsistency
- Some components use direct latitude/longitude properties
- Others use GeoJSON format with location.coordinates array
- No standardized validation or conversion utilities
- Parsing errors when formats don't match expectations

### 5. UI Manifestations
- **LocationContextModal**: Shows "No cities with valid coordinates"
- **Hamburger Menu**: Shows Detroit instead of Boston
- **Calendar Header**: Shows "City: Boston"
- **Organizer Selection**: Shows "No organizers in Boston" despite data existing
- **SelectInput**: Out-of-range value errors for city ID mismatches
- **Venue Selection**: Disabled due to missing selectedLocation.city.id

## Current Roadmap

### Short-term Fixes (Current Issues)

1. **Issue 1025: Location Context UI Inconsistencies**
   - Add proper error handling with fallbacks
   - Improve debugging capabilities in context
   - Ensure consistent location display across all UI components
   - Status: In Progress

2. **Issue 1026: SelectInput Value Mismatch**
   - Implement validation to prevent out-of-range selections
   - Add error handling for mismatched city IDs
   - Improve dropdown option synchronization with context state
   - Status: In Progress

3. **Issue 1021: Organizer Selection Filter**
   - Enhance useOrganizers hook with localStorage caching
   - Add proper null checks and error handling
   - Implement retry logic for API failures
   - Status: Fixed, awaiting merge

4. **Issue 1004: Select Venues Menu**
   - Fix race condition in venue selection initialization
   - Improve loading state handling in SidebarDrawer
   - Add safeguards for missing city selection
   - Status: Fixed, awaiting merge

### Medium-term Architecture (Epic 5003: Service Layer)

1. **Phase 1: Context Refactoring**
   - Refactor MasteredLocationContext to remove GeoLocationContext dependencies
   - Create a CoordinateUtils module for standardized coordinate handling
   - Enhance GeoLocationContext with better initialization and error handling
   - Add loading states and synchronization between contexts

2. **Phase 2: Service Layer Implementation**
   - Create dedicated services for geolocation and masteredLocation
   - Abstract API calls from context providers
   - Implement consistent caching and error handling
   - Break circular dependencies through service abstraction

3. **Phase 3: Component Updates**
   - Update all components to use GeoLocationContext as single source of truth
   - Implement loading states in each component
   - Standardize fallback behavior across all components
   - Add better user feedback for geolocation issues

4. **Phase 4: RegionsContext Retirement**
   - Migrate all RegionsContext usage to GeoLocationContext
   - Provide compatibility layer for legacy components
   - Remove RegionsContext when no longer needed
   - Complete transition to new hierarchical model

### Long-term Vision

1. **Unified Location API**
   - Standardize all location-related API endpoints
   - Implement consistent parameter naming
   - Add comprehensive validation and error handling
   - Provide better rate limiting protections

2. **Enhanced Geolocation Features**
   - Improve IP-based geolocation accuracy
   - Add user location preferences with persistence
   - Implement better caching strategies
   - Support offline mode with fallback data

3. **UI/UX Improvements**
   - Create consistent location selection experience
   - Add visual map-based selection options
   - Provide clearer feedback during loading/error states
   - Implement progressive enhancement for location features

## Implementation Notes

### Recommended Architectural Approach
1. Create a **LocationService** abstraction that both contexts can import
2. Move all API calls to this service layer
3. Implement a clean observer pattern for state synchronization
4. Standardize coordinate formats through utility functions
5. Add explicit loading states to all location-dependent components

### Potential Risks
1. Breaking changes to existing components
2. Migration complexity for legacy components
3. Temporary inconsistencies during transition
4. API rate limiting during high traffic periods

### Success Metrics
1. No console errors related to location initialization
2. Consistent location display across all UI components
3. Successful initialization even with API failures
4. Smooth user experience when changing locations

## Conclusion
The geolocation system requires significant architectural improvements to resolve current issues and provide a stable foundation for future development. The roadmap outlined above addresses both immediate fixes and long-term architectural goals to create a more robust and maintainable system.# Event Filtering Architecture: API & Post-API Filtering

## Overview

TangoTiempo's event display system uses a multi-stage filtering approach combining backend API filtering with frontend post-processing. This document outlines how event data flows through the system, from initial API requests to final display in the calendar.

## Event Data Flow

1. **API Request**: Initial filter parameters sent to `/api/events` endpoint
2. **Data Transformation**: API response standardized for frontend use
3. **Post-API Filtering**: Client-side filtering based on user selections
4. **Calendar Rendering**: FullCalendar displays filtered events

## API-Level Filtering (Primary)

Events are initially filtered at the API level using query parameters:

* **Date Range** (handled by FullCalendar):
  * `start`: Beginning of date range
  * `limit`: Maximum events to return (default 100)

* **Location Hierarchy** (from GeoLocationContext):
  * `masteredRegionId` / `masteredRegionName`: Region filtering
  * `masteredDivisionId`: Division (state) filtering
  * `masteredCityId` / `masteredCityName`: City filtering
  * `venueId`: Specific venue filtering

* **Geolocation** (for proximity search):
  * `lat`: Latitude coordinate
  * `lng`: Longitude coordinate 
  * `radius`: Search radius in miles/km

* **Additional Filters**:
  * `appId`: Application identifier
  * `organizerId`: Filter by specific organizer
  * `isActive`: Show only active events

## Post-API Filtering (Secondary)

After API results return, client-side filtering provides additional refinement:

* **Category Filtering**:
  * Primary, secondary, and tertiary categories
  * Multi-select capability
  * UI controls in the PostFilter component

* **Organizer Filtering** (Implemented; Needs UI Improvement):
  * Filter by selected organizers
  * Implemented in usePostFilter hook
  * UI being improved in current issues

* **Venue Filtering** (Planned):
  * Selection of specific venues from map
  * Implementation planned in Epic 5003

* **Tags Filtering** (Future Feature):
  * Tag-based filtering capability
  * Not yet implemented

## Key Components

### Data Fetching
* **useEvents Hook**: Primary hook for fetching events with API parameters
* **eventService** (Planned): Will abstract API calls in the service layer

### Data Processing  
* **transformEvents Utility**: Standardizes API responses
* **usePostFilter Hook**: Manages client-side filtering logic

### UI Components
* **PostFilter Component**: UI for selecting category filters
* **OrganizerSelection Component**: UI for filtering by organizers (being refined)
* **VenueSelection Component**: UI for venue filtering (in development)

## Technical Implementation

### API Request Logic
```javascript
// Conceptual example - actual implementation may vary
const fetchEvents = async () => {
  // Location parameters from GeoLocationContext
  const locationParams = selectedLocation ? {
    masteredCityId: selectedLocation.cityId,
    masteredDivisionId: selectedLocation.divisionId,
    masteredRegionId: selectedLocation.regionId
  } : {};
  
  // Date parameters from FullCalendar
  const dateParams = {
    start: calendarApi.view.activeStart.toISOString(),
    end: calendarApi.view.activeEnd.toISOString()
  };
  
  // Combined parameters
  const requestParams = {
    appId: 1,
    limit: 200,
    ...locationParams,
    ...dateParams
  };
  
  // API call
  const response = await fetch('/api/events?' + new URLSearchParams(requestParams));
  return await response.json();
};
```

### Post-API Filtering Logic
```javascript
// Conceptual example - actual implementation may vary
const applyPostFilters = (events) => {
  return events.filter(event => 
    // Category filtering
    (selectedCategories.length === 0 || 
     selectedCategories.includes(event.categoryFirst) ||
     selectedCategories.includes(event.categorySecond) ||
     selectedCategories.includes(event.categoryThird)) &&
    
    // Organizer filtering (if enabled)
    (!filterByOrganizer || 
     selectedOrganizers.includes(event.organizerId)) &&
     
    // Venue filtering (if enabled)
    (!filterByVenue ||
     selectedVenues.includes(event.venueId))
  );
};
```

## Optimization Strategies

* **Cached API Results**: Responses stored in localStorage with timestamp
* **Batched Updates**: Filter changes trigger batched API requests
* **Deferred Processing**: Large datasets process in chunks for UI responsiveness
* **Field Normalization**: Handles inconsistent field naming (venueID vs venueId)

## Current Development Focus

* **Service Layer Migration**: Moving API logic to dedicated services
* **Organizer Filtering UI**: Improving the organizer selection experience
* **Venue Selection**: Implementing venue filtering via map interface
* **Performance Optimization**: Reducing unnecessary API calls with better caching

## Best Practices for Development

* **API Filters First**: Always prefer API filtering over client-side for performance
* **Combined Filtering**: Design for combination of multiple filter types
* **Progressive Loading**: Implement loading indicators for slow API responses
* **Error Resilience**: Provide fallbacks when filtering services fail
* **Consistent Pattern**: Follow established patterns for new filter types# IP Geolocation System - Architectural Overview

 ## System Architecture

  TangoTiempo uses a backend-proxied approach for IP-based geolocation that enhances reliability and security:

  1. Client-side Request: The frontend makes calls to /api/firebase/geo/ip endpoint rather than directly to external services
  2. Backend Proxy: Server intercepts these requests and forwards them to ipapi.co
  3. Response Handling: Server processes the response, adds caching headers, and provides fallbacks when needed

  ### Key Features
  - Rate Limit Protection: Server handles rate limits and provides fallback coordinates
  - Caching: 1-hour cache headers reduce redundant external API calls
  - Error Resilience: Fallback coordinates (US center: 39.8283, -98.5795) when service fails
  - Privacy Enhancement: Client code doesn't directly access third-party services
  - Identification: Uses custom User-Agent ('TangoTiempo/1.0') for tracking and compliance

  ### Implementation Approach
  The system follows a layered approach:
  1. Frontend hooks and contexts request location data
  2. Backend proxy handles external service communication
  3. Multi-level fallbacks ensure location functionality despite service issues
  4. Session-based caching prevents repeated hits during rate limiting periods

  ### Alternative Services
  While ipapi.co is the current active service, the system maintains credentials for alternatives:
  - IPSTACK: Alternative geolocation provider (credentials present but not actively used)
  - AbstractAPI: Secondary geolocation option (credentials present but not actively used)

  This architecture provides flexibility to switch providers without frontend code changes.
  ### Implementation Considerations
  - Service Selection: When choosing between services, consider rate limits, accuracy, and response format compatibility
  - Error Handling: Always implement robust error handling and fallbacks for geolocation services
  - Caching Strategy: Implement session-based and HTTP caching to reduce API calls
  - Privacy Compliance: Ensure geolocation usage complies with privacy regulations (GDPR, CCPA)
  - Coordinates Format: Standardize coordinate format (latitude/longitude) throughout the application

 ### Maintenance Guidelines
  - Periodically review rate limits and service performance
  - Monitor for changes in API response formats
  - Consider implementing a service rotation strategy for high-traffic periods
  - Maintain alternative service credentials for rapid switching if needed



## A receent Q and A about current state of the IP location

  ### 1. Where is your FE getting and loading this data?
    - Your frontend gets location data from two main sources:
        - useGeoLocations hook (src/app/hooks/useGeoLocations.js) makes the initial call to /api/firebase/geo/ip
      - This hook is used by GeoLocationContext (src/app/contexts/GeoLocationContext.js), which manages the user's location
  ### 2. Is this information being managed in any contexts?
    - Yes, this information is managed in multiple contexts:
        - GeoLocationContext: Stores user's actual location and selected location for filtering
      - MasteredLocationContext: Uses the coordinates to fetch the nearest canonical city from the backend
      - RegionsContext (deprecated): Still syncs with location data but being phased out
  ### 3. Is this info available in the hamburger debug modals?
    - Yes, based on references in the code, this information should be visible in:
        - GeoLocationContextDebug.js (src/app/components/Modals/Debug/GeoLocationContextDebug.js)
      - MasteredLocationContextDebug.js (src/app/components/Modals/Debug/MasteredLocationContextDebug.js)
      - The debug modals should show coordinates, selected locations, and context state

 ### The geolocation data flows in this sequence:
  1. useGeoLocations hook fetches raw coordinates from the proxy API
  2. GeoLocationContext receives these coordinates and initializes user location
  3. MasteredLocationContext uses these coordinates to fetch the nearest city
  4. Both contexts provide this data to the rest of the application, including debug modals
# TangoTiempo Service Layer Architecture

## Overview

The service layer architecture is a fundamental design pattern that separates data access and API communication from UI components and state management. In TangoTiempo, services act as the bridge between the frontend application and backend APIs, providing a consistent interface for data operations while abstracting away implementation details.

This playbook describes the current state and future direction of TangoTiempo's service layer as part of Epic 5003: Service Layer Architecture.

## Core Principles

* **Single Responsibility**: Each service handles one domain area (events, venues, auth, etc.)
* **Abstraction**: Services hide implementation details of API communication
* **Consistency**: All services follow the same patterns and error handling approaches
* **Testability**: Services are designed for easy unit testing and mocking
* **Resilience**: Services implement retry logic, timeouts, and graceful error handling

## Service Types

### Current Services

* **VenueService**: Handles venue data operations (currently the most complete service implementation)
  * Retrieves venue data filtered by location
  * Provides venue lookup by ID
  * Calculates proximity to user location

### Planned Services (Epic 5003)

* **Phase 1: Foundation & Core Services**
  * **EventService**: Event retrieval and filtering
  * **ServiceUtils**: Shared functionality across services

* **Phase 2: Location & Authentication Services**
  * **GeoLocationService**: User location operations
  * **MasteredLocationService**: Canonical location data operations
  * **AuthService**: Firebase authentication operations

* **Phase 3: User & Organizer Services**
  * **UserService**: User profile and preferences management
  * **OrganizerService**: Organizer data operations

* **Phase 4: Utility & Support Services**
  * **ImageService**: Image handling operations
  * **AnalyticsService**: User behavior tracking
  * **LoggingService**: Application logging
  * **NotificationService**: User notifications

## Standard Service Pattern

Each service follows a consistent structure:

* **Isolated Responsibility**: Focus on a specific domain
* **API Abstraction**: Hide endpoint details and request formatting
* **Error Handling**: Consistent error management and logging
* **Caching**: Data caching where appropriate
* **TypeScript Types**: Complete interface definitions
* **Documentation**: JSDoc comments for all functions

## Benefits of Service Layer

* **Resolves Circular Dependencies**: By extracting API calls from contexts
* **Simplifies Testing**: Pure functions are easier to test than complex hooks
* **Improves Maintainability**: Changes to API structure affect only service files
* **Ensures Consistency**: Standardizes API interactions across the application
* **Enhances Reusability**: Services can be used by multiple components and hooks

## Service Integration with Hooks and Contexts

Services are designed to be consumed by React hooks and context providers, which then expose data to components:

* **Hooks** manage component-level state and call services when needed
* **Contexts** utilize services to provide application-wide state
* **Components** consume hooks and contexts, never services directly

This layered approach creates clear separation of concerns:

1. **Component Layer**: UI rendering and user interaction
2. **Hook/Context Layer**: State management and component integration
3. **Service Layer**: Data fetching and API communication
4. **API Layer**: Backend endpoints

## Epic 5003: Service Layer Architecture

Epic 5003 is implementing a comprehensive service layer throughout TangoTiempo, with the following objectives:

### Current State

* Initial implementation of venueService.js provides pattern for other services
* Most API calls still embedded within hooks
* Circular dependencies exist between contexts
* Inconsistent error handling across the application

### Target State

* Complete service layer covering all API interactions
* Hooks and contexts refactored to use service layer
* Resolved circular dependencies
* Consistent error handling and caching strategy
* Comprehensive test coverage for services

### Implementation Phases

1. **Phase 1: Foundation & Core Services**
   * Establish service pattern with eventService and refined venueService
   * Implement serviceUtils for shared functionality
   * Update core hooks to use these services

2. **Phase 2: Location & Authentication Services**
   * Implement geoLocationService and masteredLocationService
   * Create authService for Firebase operations
   * Resolve circular dependencies between contexts

3. **Phase 3: User & Organizer Services**
   * Implement userService and organizerService
   * Add caching for frequently used data
   * Update related hooks and contexts

4. **Phase 4: Utility & Support Services**
   * Add remaining utility services
   * Implement logging and analytics
   * Ensure consistent patterns across all services

5. **Phase 5: Testing & Documentation**
   * Add unit tests for all services
   * Create comprehensive documentation
   * Implement test mocks for services

## Best Practices for Using Services

* **Never Call Services Directly from Components**: Always use hooks or contexts as intermediaries
* **Follow Established Patterns**: When creating new services, refer to existing implementations
* **Handle Loading States**: Account for async operations in UI
* **Implement Error Handling**: Handle service errors gracefully at the UI level
* **Use Types**: Leverage TypeScript types provided by services

## Example Service Implementation

Here's a conceptual example of a service structure (actual implementation details may vary):

```
src/
└── services/
    ├── serviceUtils.js      # Shared utilities
    ├── eventService.js      # Event operations
    ├── venueService.js      # Venue operations
    ├── geoLocationService.js # Location operations
    ├── authService.js       # Authentication
    ├── userService.js       # User operations
    └── index.js             # Service barrel file
```

## Benefits of the Service Layer Architecture

* **Maintainability**: Changes to backend APIs only require updates to service files
* **Testability**: Services can be tested in isolation from UI components
* **Consistency**: Standardized approach to API communication and error handling
* **Performance**: Centralized implementation of caching and request optimization
* **Developer Experience**: Clear separation of concerns and patterns

## Current Status (May 2025)

Epic 5003 is in the initial planning stage, with focus on establishing patterns and implementing core services. The service layer architecture is a key part of TangoTiempo's ongoing architectural improvements, alongside efforts to resolve circular dependencies and standardize state management.