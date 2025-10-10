# Venue Delete API - Frontend Integration Guide

**For:** FET (Frontend Team)
**From:** BEAF (Backend Azure Functions Team)
**Date:** 2025-10-10
**Status:** Available in BESV, Coming Soon in BEAF

---

## 🗑️ Quick Start: Deleting Venues

### Current Endpoint (BESV - Use This Now)

**Endpoint:** `DELETE /api/venues/:id`
**Base URL:** `http://localhost:3010` (local) | `https://tangotiempo.com` (production)

**Example Request:**
```javascript
import axios from 'axios';

async function deleteVenue(venueId, firebaseToken) {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${venueId}`,
      {
        headers: {
          'Authorization': `Bearer ${firebaseToken}`
        }
      }
    );

    console.log('Venue deleted:', response.data);
    // { message: "Venue deleted successfully" }

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      alert('You do not have permission to delete venues');
    } else if (error.response?.status === 404) {
      alert('Venue not found');
    } else {
      console.error('Delete error:', error);
    }
    throw error;
  }
}

// Usage in your component:
const handleDelete = async (venueId) => {
  const token = await getCurrentUserToken(); // Your Firebase auth helper
  await deleteVenue(venueId, token);
  refreshVenueList();
};
```

---

## 🔐 Security & Authorization

### Required Roles

**Only these user roles can delete venues:**

| Role | Code | Can Delete |
|------|------|------------|
| **Admin** | ADM | ✅ Any venue (global access) |
| **RegionalAdmin** | RA | ✅ Venues in their assigned regions only |
| **Organizer** | ORG | ❌ Cannot delete venues |
| **User** | USER | ❌ Cannot delete venues |

### Authorization Flow

```
1. User clicks "Delete Venue" button
   ↓
2. Frontend gets Firebase token: await user.getIdToken()
   ↓
3. Frontend sends DELETE request with token in Authorization header
   ↓
4. Backend verifies token with Firebase
   ↓
5. Backend checks user role (ADM or RA required)
   ↓
6. Backend validates regional permissions (for RA)
   ↓
7. Backend deletes venue and returns success
```

### Error Responses

**401 Unauthorized** - No token or invalid token
```json
{
  "message": "Invalid token"
}
```
**Fix:** User needs to log in again

---

**403 Forbidden** - User doesn't have required role
```json
{
  "message": "RegionalAdmin role required",
  "error": "INSUFFICIENT_ROLE"
}
```
**Fix:** Show error message "You don't have permission to delete venues"

---

**403 Forbidden** - Venue outside RegionalAdmin's region
```json
{
  "message": "RegionalAdmin access not approved or enabled",
  "error": "RA_ACCESS_DENIED"
}
```
**Fix:** Show error message "This venue is outside your assigned region"

---

**404 Not Found** - Venue doesn't exist
```json
{
  "message": "Venue not found"
}
```
**Fix:** Refresh venue list, show "Venue no longer exists"

---

**500 Server Error** - Database or server issue
```json
{
  "message": "Error deleting venue",
  "error": "Internal server error"
}
```
**Fix:** Show generic error, log to Sentry, contact backend team

---

## 🎨 Frontend Implementation

### React Component Example

```jsx
// components/VenueList.js
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { deleteVenue } from '../services/venueService';

export function VenueList({ venues, onVenueDeleted }) {
  const { currentUser } = useAuth();
  const [deleting, setDeleting] = useState(null);

  // Check if user can delete venues
  const canDelete = currentUser?.roles?.some(role =>
    ['ADM', 'RA'].includes(role.roleNameCode)
  );

  const handleDelete = async (venue) => {
    if (!confirm(`Delete venue "${venue.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(venue._id);

    try {
      const token = await currentUser.getIdToken();
      await deleteVenue(venue._id, token);

      // Success notification
      toast.success(`Venue "${venue.name}" deleted successfully`);

      // Refresh list
      onVenueDeleted(venue._id);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete this venue');
      } else if (error.response?.status === 404) {
        toast.error('Venue not found');
        onVenueDeleted(venue._id); // Remove from list anyway
      } else {
        toast.error('Failed to delete venue. Please try again.');
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="venue-list">
      {venues.map(venue => (
        <div key={venue._id} className="venue-card">
          <h3>{venue.name}</h3>
          <p>{venue.address1}, {venue.city}</p>

          {canDelete && (
            <button
              onClick={() => handleDelete(venue)}
              disabled={deleting === venue._id}
              className="btn-danger"
            >
              {deleting === venue._id ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Service Layer Example

```javascript
// services/venueService.js
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3010';

export const deleteVenue = async (venueId, firebaseToken) => {
  if (!firebaseToken) {
    throw new Error('Authentication required');
  }

  const response = await axios.delete(
    `${baseURL}/api/venues/${venueId}`,
    {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};
```

---

## 📚 API Documentation

### Swagger UI (Interactive Testing)

**Local Development:**
```
http://localhost:7072/api/docs
```

**TEST Environment:**
```
https://calendarbe-test-bpg5caaqg5chbndu.eastus-01.azurewebsites.net/api/docs
```

**PROD Environment:**
```
https://CalendarBEAF-PROD.azurewebsites.net/api/docs
```

**How to Use Swagger:**
1. Open Swagger UI in browser
2. Click "Authorize" button (top right)
3. Enter Firebase token: `Bearer <YOUR_TOKEN>`
4. Find "DELETE /api/venues/{id}" endpoint
5. Click "Try it out"
6. Enter venue ID
7. Click "Execute"
8. See response

### OpenAPI JSON Spec

**Endpoint:** `GET /api/swagger.json`

Load into Postman, Insomnia, or any API client:
```bash
curl http://localhost:7072/api/swagger.json > calendar-api.json
```

---

## 🔄 Migration: BESV → BEAF

### Current State (Use BESV)

**Backend:** BESV (Express) at `http://localhost:3010`
**Frontend:** Point to BESV for all venue operations

```javascript
// .env.local
NEXT_PUBLIC_BE_URL=http://localhost:3010
```

### Future State (Switch to BEAF)

**Backend:** BEAF (Azure Functions) at `http://localhost:7072`
**Frontend:** Update environment variable

```javascript
// .env.local
NEXT_PUBLIC_BE_URL=http://localhost:7072
```

**No code changes needed!** Same API contract.

---

## ✅ Checklist: Implement Venue Delete

### Frontend Tasks

- [ ] Add delete button to venue list/details page
- [ ] Check user role before showing delete button
  ```javascript
  const canDelete = user.roles.some(r => ['ADM', 'RA'].includes(r.roleNameCode));
  ```
- [ ] Add confirmation dialog before delete
  ```javascript
  if (!confirm('Delete this venue?')) return;
  ```
- [ ] Get Firebase token from authenticated user
  ```javascript
  const token = await currentUser.getIdToken();
  ```
- [ ] Call DELETE endpoint with token in Authorization header
- [ ] Handle success (refresh list, show notification)
- [ ] Handle errors (401, 403, 404, 500)
- [ ] Show loading state while deleting
- [ ] Log errors to monitoring (Sentry, LogRocket, etc.)

### Testing Checklist

- [ ] **Admin user** can delete any venue
- [ ] **RegionalAdmin** can delete venues in their region
- [ ] **RegionalAdmin** gets 403 for venues outside their region
- [ ] **Organizer** cannot see delete button
- [ ] **Unauthenticated** user gets 401 error
- [ ] Deleted venue disappears from list
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly

---

## 🐛 Troubleshooting

### "No token provided" (401)

**Cause:** User not authenticated or token expired

**Fix:**
```javascript
// Force token refresh
const token = await currentUser.getIdToken(true); // Force refresh
```

### "RegionalAdmin role required" (403)

**Cause:** User doesn't have ADM or RA role

**Fix:**
- Check user's roles in database (UserLogins collection)
- Verify role assignment is correct
- Contact backend team if role should exist but doesn't

### "Venue not found" (404)

**Cause:** Venue was already deleted or doesn't exist

**Fix:**
- Remove venue from frontend state
- Refresh venue list from server

### CORS Error

**Cause:** Backend not configured to accept requests from frontend origin

**Fix:** Contact BESV/BEAF team to add your origin to CORS whitelist

---

## 📞 Support

**Questions?** Contact:
- **BESV Team:** For current Express backend issues
- **BEAF Team:** For future Azure Functions migration
- **Slack:** #backend-api channel

**Documentation:**
- BESV: `calendar-be/routes/serverVenues.js`
- BEAF: `calendar-be-af/docs/BEAF-Authentication-TODO.md`
- BEAF: `calendar-be-af/src/functions/Venue_Delete.js`

---

## 🚀 Quick Reference

```javascript
// Delete venue (complete example)
import axios from 'axios';
import { toast } from 'react-toastify';

const deleteVenue = async (venueId) => {
  try {
    // Get Firebase token
    const token = await getCurrentUser().getIdToken();

    // Delete venue
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/venues/${venueId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    // Success!
    toast.success('Venue deleted');
    return true;
  } catch (error) {
    // Handle errors
    const status = error.response?.status;
    if (status === 401) toast.error('Please log in again');
    else if (status === 403) toast.error('Permission denied');
    else if (status === 404) toast.error('Venue not found');
    else toast.error('Delete failed');
    return false;
  }
};
```

---

**Last Updated:** 2025-10-10
**Version:** 1.0
**API Version:** v1
