# Issue: User Authentication Roles Not Loading Correctly

## Overview
Users who have roles assigned in the backend (e.g., NamedUser, RegionalOrganizer, RegionalAdmin, SystemAdmin, SystemOwner) are only seeing the fallback "AnonymousUser" role in the frontend application, preventing access to proper functionality.

## Details
- **Reported On:** 2025-04-26
- **Reported By:** Toby Balsley
- **Environment:** Local/Development
- **Component/Page/API Affected:** AuthContext.js, RoleContext.js
- **Symptoms:** Users with valid roles see only "AnonymousUser" role rather than their actual assigned roles

## Steps to Reproduce
1. Log in with a user that has multiple roles in CalOps (e.g., toby.balsley@gmail.com with Firebase ID: 166SiZFoRLdzLSPKHfvWE12sYvB3)
2. Observe the console log showing that the server request times out:
   ```
   AuthContext.js:156 Error fetching combined user data: 
   AxiosError {message: 'timeout of 10000ms exceeded', name: 'AxiosError', code: 'ECONNABORTED'...}
   
   AuthContext.js:168 No response received from server: 
   XMLHttpRequest {onreadystatechange: null, readyState: 4, timeout: 10000...}
   ```
3. Note the roles debug output showing only AnonymousUser:
   ```
   Role-based filtering debug: {
     isLoggedIn: true, 
     currentRole: 'AnonymousUser', 
     availableRoles: Array(1), 
     hasRORole: false, 
     organizerId: 'none'...
   }
   ```

## Investigation
- **Initial Trace:** The AuthContext is making a request to `/api/userlogins/firebase/{uid}` that times out
- **Suspected Cause:** Backend API endpoint is timing out, causing the system to fall back to the AnonymousUser role
- **Files to Inspect:** 
  - `/src/app/contexts/AuthContext.js`
  - `/src/app/contexts/RoleContext.js`
  - Backend API endpoint `/api/userlogins/firebase/{uid}`
  - Backend route handler in `be-info/routes/serverUserLogins.js`

## Analysis
### Current Behavior
1. AuthContext makes a request to `/api/userlogins/firebase/{uid}` with a 10-second timeout
2. When this request times out, the fallback logic creates a minimal user object with only 'AnonymousUser' role
3. RoleContext receives this limited role information and propagates it throughout the application
4. User interface shows limited functionality based on AnonymousUser permissions

### Backend Model
The backend model in `userLogins.js` shows that:
1. Users have a `roleIds` array linking to the Roles collection
2. The MongoDB schema has a pre-save hook to ensure users have the NamedUser role
3. The API should return populated role information via the serverUserLogins.js route

### API Endpoint Issue
The endpoint that fetches user login information appears to be timing out, possibly due to:
1. Network connectivity issues to the backend
2. Backend server performance issues
3. Database query performance issues
4. Potential issues with role population or Firebase authentication verification

## Fix (if known or applied)
- **Status:** 🚧 In Progress
- **Fix Description:** 
  1. Investigate backend API performance for the userlogins endpoint
  2. Consider increasing the timeout for critical authentication requests
  3. Add retry logic for authentication requests to handle transient network issues
  4. Implement graceful degradation to use cached role information if available
  5. Monitor backend server performance during user authentication
  
- **Testing:** Verify proper role loading by checking console logs and UI functionality

## Resolution Log
- **Commit/Branch:** `Issue-AuthenticationRolesNotLoaded`
- **PR:** (pending)
- **Deployed To:** (pending)
- **Verified By:** (pending)

---

> Note: This issue is critical as it affects all users' ability to access their proper roles and functionality. The system is correctly identifying that users are logged in (isLoggedIn: true) but failing to load their proper roles.