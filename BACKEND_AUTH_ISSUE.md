# Backend Authentication API Performance Issue

## Overview
This document outlines findings related to a critical authentication issue where users are unable to access their assigned roles due to backend API timeouts.

## Issue Description
Users who have roles assigned in the backend (e.g., NamedUser, RegionalOrganizer, RegionalAdmin, SystemAdmin) are only seeing the fallback "AnonymousUser" role in the frontend application, preventing access to proper functionality.

### Symptoms
- Frontend console shows: `Error fetching combined user data: AxiosError {message: 'timeout of 10000ms exceeded'}`
- Users see limited functionality despite having proper roles assigned
- Role-based filtering shows only "AnonymousUser" role
- API requests to fetch user data are timing out consistently

## Technical Investigation

### Core Issue
The endpoint `/api/userlogins/firebase/{uid}` is consistently timing out after the 10-second timeout limit set in the frontend.

### Backend API Status
- Backend server is running and responding to basic health checks:
  - `/health` endpoint responds quickly and shows database connection is active
  - `/api/health` endpoint confirms server uptime and database connection
  - `/debug/db` endpoint shows MongoDB connection is functional with proper collections

### Critical API Endpoint Performance
- The specific endpoint `/api/userlogins/firebase/{firebaseId}` is timing out
- This is a critical endpoint used during authentication to fetch user roles and permissions
- Implemented in `routes/serverUserLogins.js` with Firebase token verification

### MongoDB Collections Status
The database appears to be functional with all required collections present:
- `roles` collection exists
- `userlogins` collection exists (note: case differences in collection names)
- All related collections are accessible

## Potential Causes

1. **Inefficient Database Queries**
   - The `userlogins` endpoint may be using inefficient MongoDB queries
   - Possible missing indexes on `firebaseUserId` field
   - `roleIds` population might be causing performance issues

2. **Firebase Authentication Overhead**
   - The middleware is performing Firebase token verification
   - Additional Firebase user fetching in the same endpoint adds overhead

3. **UserLogin Document Size**
   - The auditLog array in userLogin documents may be growing too large
   - The pre-save hook adds entries to auditLog on every save

4. **MongoDB Performance**
   - Database connection itself works, but specific queries may be slow
   - Potential for MongoDB to be under resource constraints

## Recommended Solutions

1. **Backend Optimization**
   - Review and optimize the `/api/userlogins/firebase/{uid}` endpoint
   - Add database indexes on frequently queried fields
   - Consider limiting populated fields to only those needed
   - Implement query timeouts within the backend code

2. **Frontend Resilience**
   - Increase the frontend timeout for critical auth endpoints from 10 seconds
   - Add retry logic with exponential backoff for authentication requests
   - Implement caching of user role information when available

3. **Monitoring and Diagnostics**
   - Add performance monitoring to the endpoint
   - Log query execution times
   - Monitor MongoDB performance metrics

## Verification Steps
To reproduce the issue:
1. Start the frontend application with `npm run dev`
2. Ensure backend is running at `http://localhost:3010`
3. Log in with a user that has roles assigned in the database
4. Observe the timeout error in the console and role fallback to AnonymousUser

## Next Steps
Submit this issue to the backend team for immediate investigation, as it's blocking proper authentication and role-based functionality for all users.