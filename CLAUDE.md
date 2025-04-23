# CLAUDE.md - Tango Tiempo Public Calendar (tangotiempo.com)

This file provides guidance to Claude Code (claude.ai/code) when working with the TangoTiempo public calendar frontend.


# On claude startup you must 
1) read your roles and responiblity in CLAUDE_ROLES.MD
2) Reply with your understanding and you current role.


## Master Calendar System Architecture

This front end TT.com application node is part of a larger system with four interconnected applications:

1. **tangotiempo.com** (THIS APPLICATION) - Public calendar site
   - Event browsing and creation for end users
   - User authentication with Firebase
   - Regional/geographic filtering
   - React/Next.js with custom UI components
   - Runs on port 3001

2. **calendar-be**  Backend API server (port 3010)
   - Express.js REST API endpoints 
   - MongoDB data storage
   - Provides all data for this application
   - All API calls use base URL from process.env.NEXT_PUBLIC_BE_URL

3. **harmonyjunction.org** - Sister branded site (port 3002)
   - Nearly identical codebase to this one
   - Same functionality with different branding/theme
   - Shares the same backend API

4. **calops** - Admin dashboard (port 3008)
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


### Prohibited Patterns


## 1 - Dont create Fallback patterns . 
 - Dont defer great code to later. Build in error patterns not failback.

## 2 - dont make mock data (unless told to).
 - mock data desires probably mean you need an api or clafiricagtions of the data



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