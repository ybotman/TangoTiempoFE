# Guild Scaffold System Overview

## Introduction

This README provides a high-level overview of the **Guild Scaffold System**, summarizing the various systems and applications within the ecosystem. It serves as a reference for understanding the entire structure, offering insights into the directory setup, major components, and their interconnections. This document will be maintained over time to ensure clarity as the system evolves.

### Directory Structure Overview

The directory structure is organized into two major systems: **Calendar System** and **Static Sites System**. Each of these systems contains multiple applications that serve distinct roles in the overall architecture.

### Directory Layout:

```
ls -R ./
Tango       calendar    readme.md   staticSites

./Tango:

./calendar:
calendar-be      harmony-junction howto.md         tango-tiempo

./calendar/calendar-be:
API Summary.md                    Geolocation System and Events.md  readme.md
Authenticaion to Role Workflow.md backend models.md

./calendar/harmony-junction:

./calendar/tango-tiempo:

./staticSites:
hdtsllc.com     howto.md        tobybalsley.com tobytango.com   ybotman.com

./staticSites/hdtsllc.com:

./staticSites/tobybalsley.com:

./staticSites/tobytango.com:

./staticSites/ybotman.com:
```

---

## 1. **Calendar System**

The **Calendar System** is a comprehensive event management solution, primarily focused on managing tango-related events, venues, and user roles. It consists of a backend service and several frontend applications, which provide distinct features for users, organizers, and administrators.

### Components of the Calendar System:

#### **1.1 Calendar Backend (calendar-be)**

- **Role**: The backend is the core of the calendar system, responsible for handling data management and serving as the API hub for all calendar-related data.
- **Technologies**: 
  - **Node.js** (v20) for the server-side runtime.
  - **Express.js** for API routing.
  - **MongoDB** for data storage (events, venues, users).
  - **Firebase** for authentication and role-based access control.
  - **JWT** for secure token-based communication between frontend and backend.

- **Main Features**:
  - **User Authentication**: Managed via Firebase, with role-based access (e.g., NamedUser, RegionalOrganizer).
  - **Event Management**: Allows organizers to create, modify, and delete events.
  - **API Endpoints**: Exposes RESTful API routes to interact with events, users, and venues.
  - **Geolocation Services**: Events can be filtered by location using geographic coordinates.
  - **Role Management**: Enforces user roles and permissions across the system.

#### **1.2 Tango Tiempo (tango-tiempo)**

- **Role**: The **Tango Tiempo** frontend is a public-facing React app that allows users to browse, favorite, and receive notifications for tango events.
- **Technologies**: 
  - **React 18+**, **Next.js 14+** for building a modern, server-side rendered (SSR) frontend.
  - **Material-UI (MUI)** for responsive, accessible, and visually appealing components.

- **Main Features**:
  - **Event Browsing**: Users can view events, filter by date, region, or category.
  - **User Interaction**: Users can favorite events and receive notifications based on preferences.
  - **Mobile-Responsive**: Optimized for mobile devices, ensuring a smooth user experience.

#### **1.3 Harmony Junction (harmony-junction)**

- **Role**: **Harmony Junction** is another frontend that provides a calendar of events, likely focused on different aspects or regions of tango events.
- **Technologies**: Built similarly to **Tango Tiempo** with **React 18+** and **Next.js 14+**.

- **Main Features**:
  - **Event Listings**: Shows a curated list of tango events.
  - **User Engagement**: Allows users to interact with the event listings and potentially organize or favorite events.

#### **1.4 Calendar Operations (calOps)**

- **Role**: **Calendar Operations (CalOps)** is the admin-facing application for managing and approving events and organizers.
- **Technologies**: Uses similar frontend technologies (React, Next.js) with admin-specific functionality.

- **Main Features**:
  - **Event Approval**: Allows administrators to approve or modify events and venue data.
  - **Organizer Management**: Manages organizers, granting or revoking permissions.
  - **User Roles**: Enforces admin roles for advanced management of events and user access.

---

## 2. **Static Sites System**

The **Static Sites System** consists of multiple static websites, each serving a different purpose related to branding, personal sites, or marketing.

### Components of the Static Sites System:

#### **2.1 hdtsllc.com**

- **Role**: This static site represents the **HDTS LLC** brand, showcasing AI integration services and offering consulting.
- **Technologies**: Built using static site generators or traditional frontend technologies (HTML, CSS, JavaScript).

#### **2.2 tobybalsley.com**

- **Role**: **Toby Balsley’s personal website**, likely containing information about the developer’s projects, experience, and achievements.
- **Technologies**: Static site with potential integration of JavaScript for interactive features.

#### **2.3 tobytango.com**

- **Role**: A static site focused on **Tango**, likely showcasing content related to Argentine tango events, history, or education.
- **Technologies**: Static site setup with tailored content for tango enthusiasts.

#### **2.4 ybotman.com**

- **Role**: Personal brand or portfolio site for **Ybot**, showcasing projects, AI development work, or professional content.
- **Technologies**: Similar static site setup, potentially with interactive elements or blog posts related to AI.

---

## 3. **How to Contribute and Maintain**

### 3.1 **Adding New Features**

- When adding new features to any of the systems (Calendar or Static Sites), start by reviewing the corresponding **Playbook** or **Scaffold** for guidelines.
- Create a new feature or issue ticket (using JIRA or another system) for tracking.
- Implement the feature in the appropriate system (backend, frontend, or static site) and ensure thorough testing and documentation.

### 3.2 **Maintaining Code Quality**

- **Linting**: Ensure all code passes linting checks (`npm run lint`).
- **Testing**: Write and run unit and integration tests.
- **Version Control**: Use Git for version control, following the **Git Workflow**.

### 3.3 **Updating Documentation**

- Always update the documentation (README files) when new features are added or changes are made to the system.
- Keep the documentation in sync with the actual implementation to ensure accuracy for new developers or contributors.

---

## Conclusion

This system is designed to be modular, scalable, and easy to extend over time. It separates the concerns of event management (Calendar System) and static content (Static Sites) while ensuring that both are integrated into the broader **AI-Guild Scaffolds**. By following the guidelines and structure provided in this README, developers and contributors can easily navigate and contribute to the system.
