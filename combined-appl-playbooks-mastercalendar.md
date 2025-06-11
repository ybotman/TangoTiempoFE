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
