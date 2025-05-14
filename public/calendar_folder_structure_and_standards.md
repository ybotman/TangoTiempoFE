# Calendar App Folder Structure and Coding Standards Guide

## Overview
This document describes the folder structure and organization of the calendar application under `src/app`, with guidance for maintaining consistency and best practices. It also notes the placement of services and provides recommendations for future development.

---

## Folder Structure

- **src/app/**
  - Main application logic, React components, hooks, pages, and utilities.

### Key Subfolders

- **components/**
  - Contains reusable React UI components (e.g., modals, forms, UI widgets).
  - Example: `Modals/`, `UI/`, etc.
  - **Guideline:** Components should be small, focused, and reusable. Group related components in subfolders.

- **hooks/**
  - Custom React hooks for data fetching, filtering, and state management.
  - Example: `useEvents.js`, `useCategories.js`, `usePostFilter.js`.
  - **Guideline:** Hooks should encapsulate logic and side effects, and be named with the `use` prefix.

- **modals/**
  - Contains modal dialog components for user interactions (e.g., event creation, user settings).
  - **Guideline:** Modals should be self-contained and only import what they need.

- **calendar/**
  - Calendar-specific pages and layout logic.
  - **Guideline:** Keep calendar rendering and navigation logic here; delegate data and UI to hooks/components.

- **contexts/**
  - React context providers for global state (e.g., authentication, geolocation).
  - **Guideline:** Use contexts for cross-cutting concerns and global app state.

- **utils/**
  - Utility functions for data transformation, color mapping, etc.
  - Example: `transformEvents.js`, `categoryColors.js`.
  - **Guideline:** Utilities should be pure functions and not depend on React state.

- **services/** (in `src/` above `app/`)
  - Contains API abstraction and data service files (e.g., `venueService.js`).
  - **Guideline:** Services should handle all API calls and data operations, keeping components and hooks clean.

---

## Coding Standards & Recommendations

1. **Separation of Concerns:**
   - Keep UI, data fetching, and business logic in separate files/folders (components, hooks, services).

2. **Naming Conventions:**
   - Use clear, descriptive names. Hooks: `useXyz.js`, Components: `XyzComponent.js`, Services: `xyzService.js`.

3. **Reusability:**
   - Build small, composable components and hooks. Avoid duplicating logic.

4. **Context Usage:**
   - Use React Context for global/shared state only. Prefer props and hooks for local state.

5. **API Layer:**
   - Centralize all API calls in the `services/` folder. Do not call APIs directly from components.

6. **Testing:**
   - Place unit tests alongside components/hooks or in a `__tests__` subfolder. Use Jest and React Testing Library for unit/integration tests; Cypress for E2E.

7. **Documentation:**
   - Document all public functions, hooks, and components with JSDoc comments. Keep this guide updated as the structure evolves.

8. **Future Recommendations:**
   - Consider moving all services into a dedicated `src/app/services/` folder for consistency.
   - Use TypeScript for type safety if the project grows.
   - Maintain a clear boundary between UI, logic, and data layers.

---

By following this structure and these standards, the codebase will remain maintainable, scalable, and easy for new contributors to understand.
