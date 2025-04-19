# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production and generate sitemap
- `npm run eslint` - Run ESLint with auto-fix
- `npm run format` - Run Prettier formatter
- `npm test` - Run unit tests with Jest
- `npx cypress run` - Run Cypress tests
- `npx cypress open` - Open Cypress test runner

## Code Style Guidelines
- Use single quotes for strings
- Add semicolons at end of statements
- 2-space indentation
- Maximum line length: 120 characters
- Follow React functional component patterns
- Use named exports for components and hooks
- Prefix custom hooks with "use" (e.g., useGeoLocation)
- Use context API for state management
- Handle errors with try/catch blocks and provide user feedback
- Proper error logging with LocationLogger
- Validate form inputs before submission
- Follow Firebase authentication best practices
- Document complex logic with meaningful comments