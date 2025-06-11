# MasterCalendar API Usage Guide

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
