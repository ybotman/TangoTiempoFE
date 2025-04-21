# CLAUDE.md - Tango Tiempo Public Calendar (tangotiempo.com)

This file provides guidance to Claude Code (claude.ai/code) when working with the TangoTiempo public calendar frontend.

## Master Calendar System Architecture

This frontend application (tangotiempo.com) is part of a larger system with four interconnected applications:

1. **tangotiempo.com** (THIS APPLICATION) - Public calendar site
   - Event browsing and creation for end users
   - User authentication with Firebase
   - Regional/geographic filtering
   - React/Next.js with custom UI components
   - Runs on port 3001

2. **calendar-be** - Backend API server (port 3010)
   - Express.js REST API endpoints 
   - MongoDB data storage
   - Provides all data for this application
   - All API calls use base URL from process.env.NEXT_PUBLIC_BE_URL

3. **harmonyjunction.org** - Sister branded site (port 3002)
   - Nearly identical codebase to this one
   - Same functionality with different branding/theme
   - Shares the same backend API

4. **calendaradmin** - Admin dashboard (port 3008)
   - Administrative interface for user/data management
   - Not directly related to this application's functionality

## Build/Run Commands
- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production and generate sitemap
- `npm run eslint` - Run ESLint with auto-fix
- `npm run format` - Run Prettier formatter
- `npm test` - Run unit tests with Jest
- `npx cypress run` - Run Cypress tests
- `npx cypress open` - Open Cypress test runner

## API Integration

All backend API calls should use the axios library with this pattern:

```javascript
import axios from 'axios';

// GET request with params
const getEvents = async (params) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events`, {
      params,
      timeout: 15000 // 15 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// POST/PUT request with auth token
const createEvent = async (eventData, token) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BE_URL}/api/events/post`, 
      eventData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};
```

## Core Features & Implementation

1. **Authentication** - Managed through AuthContext
   - Firebase authentication for user login/signup
   - User roles and permissions from backend

2. **Event Filtering** - Unified approach with useEvents hook
   - Geographic filtering (region/division/city) for regular users
   - Role-based filtering (RegionalOrganizer role) shows user's own events

3. **Location System** - GeoLocationContext 
   - Manages user's selected location
   - Coordinates with Event filtering system
   - Controls sidebar location selector

## Code Style Guidelines
- Use ES Modules (import/export) with semicolons and single quotes
- Follow Next.js 13+ App Router conventions
- Prefix custom hooks with "use" (e.g., useGeoLocation)
- Use Context API for state management
- Error handling should use try/catch with appropriate feedback
- Log errors with console.error and appropriate user feedback
- Document complex logic with meaningful comments

## Project Structure
- `/app` - Next.js App Router pages and layouts
- `/contexts` - React Context providers
- `/hooks` - Custom React hooks
- `/components` - Reusable UI components
- `/utils` - Utility functions