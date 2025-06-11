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

