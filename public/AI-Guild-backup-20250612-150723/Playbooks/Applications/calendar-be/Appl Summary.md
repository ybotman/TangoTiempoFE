

# Calendar Backend - README

## Overview

The **Calendar Backend** serves as the central data management hub for the **TangoTiempo** ecosystem, providing robust, reliable, and scalable backend services to multiple front-end applications. While several front-end interfaces interact with the backend, the role of the backend is to:

- **Manage Data**: Handle the creation, modification, and retrieval of calendar events, organizers, venues, and user roles.
- **Provide API Access**: Offer a set of RESTful API endpoints for querying and managing calendar-related data.
- **Ensure Security**: Implement Firebase authentication and authorization to manage user roles (e.g., NamedUser, RegionalOrganizer) and ensure that only authorized users can perform certain actions.
- **Support Event Management**: Facilitate event management for organizers, including event creation, editing, and deletion based on user roles.

## Short cut name is often just 
* BE or
* Cal-BE.com or
* Calendar-BE.com or
* C-BE


---

## Technology Stack

The Calendar Backend is built with the following technologies:

- **Node.js** (v20): Server-side JavaScript runtime for building scalable applications.
- **Express.js**: Web framework for Node.js used to build the RESTful API.
- **MongoDB**: NoSQL database to store calendar, event, venue, and user data.
- **Firebase**: Used for authentication and role-based access control.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB to manage the data flow.
- **JWT (JSON Web Tokens)**: For secure communication between the backend and front-end applications.

## User Experience

The **Calendar Backend** provides seamless functionality for the front-end applications, offering the following user experiences:

- **User Authentication**: Users can sign in with Firebase Authentication, and their roles (e.g., NamedUser, RegionalOrganizer) will define the actions they can perform within the calendar system.
- **Event Access**: Users can access events based on their role. RegionalOrganizers can create and manage their own events, while NamedUsers can only view events and set favorites.
- **Event Filtering**: Users can filter events by various parameters like region, organizer, and category.
- **Role Management**: Users who are authorized as organizers can manage their own events and venues, while admins have the ability to approve and manage organizers.

## Key Features

- **Event Management**: Organizers can create, edit, and delete events associated with their account.
- **Geolocation Filtering**: Events can be filtered by proximity to a specific geolocation.
- **Categorization**: Events are categorized into different types, making it easier to search and filter them.
- **Role-Based Permissions**: The backend uses Firebase to manage user roles and permissions, ensuring that each user can only access or modify data they are authorized to.

## API Documentation

The backend exposes several RESTful endpoints for interacting with the calendar data. Refer to the `/api` documentation for specific API routes and usage.