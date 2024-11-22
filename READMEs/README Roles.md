TangoTiempo appliction : User Roles and Permissions

Tango Tiempo supports a robust role-based access control system, allowing for different levels of access and functionality based on user roles. Below are the available roles and their respective permissions:

Roles Overview

1. Anonymous User

   • Access: Public access with no need for login.
   • Permissions:
   • View events and details.
   • Use basic filters (e.g., region and category).
   • Limited to read-only access.

2. User

   • Access: Requires login via Firebase authentication.
   • Permissions:
   • All permissions of an Anonymous User.
   • Ability to save favorite events.
   • Personalized event filtering and notifications.
   • Can participate in community features (commenting, liking).

3. Region Organizer

   • Access: Requires login with specific permissions granted.
   • Permissions:
   • All permissions of a User.
   • Ability to create, edit, and manage events within their assigned region.
   • Moderate comments and interactions on events in their region.
   • Manage the regional event calendar.

4. Region Admin

   • Access: Requires login with elevated permissions for regional management.
   • Permissions:
   • All permissions of a Region Organizer.
   • Ability to manage other Region Organizers in their region.
   • Full control over the regional event calendar, including the approval or removal of events.
   • Manage regional user access and permissions.

5. System Admin

   • Access: Requires login with the highest level of permissions.
   • Permissions:
   • All permissions of a Region Admin.
   • Ability to manage the entire platform, including all regions.
   • Global user management, including creating and assigning roles.
   • Full access to system settings, configurations, and security controls.
   • Oversee the overall operation and integrity of the platform.

Permissions Summary

| Role                  | View Events   | Save Favorites   | Manage Events   | Moderate Comments   | Manage Users   | Manage Regions   | System Settings   |
| --------------------- | ------------- | ---------------- | --------------- | ------------------- | -------------- | ---------------- | ----------------- |
| **Anonymous User**    | ✓             |                  |                 |                     |                |                  |                   |
| **User**              | ✓             | ✓                |                 |                     |                |                  |                   |
| **Region Organizer**  | ✓             | ✓                | ✓               | ✓                   |                |                  |                   |
| **Region Admin**      | ✓             | ✓                | ✓               | ✓                   | ✓              | ✓                |                   |
| **System Admin**      | ✓             | ✓                | ✓               | ✓                   | ✓              | ✓                | ✓                 |
| --------------------- | ------------- | ---------------- | --------------- | ------------------- | -------------- | ---------------- | ----------------- |

Here’s the table representation with bullet points for the submenu actions based on roles and interactions:

Role Interaction Action SubMenu
Anonymous DateClick View Details - None
ClickEvent View Event - None
Named User DateClick View Details - View Details- Add Comments
ClickEvent View Event - View Details- Add Comments
Regional Organizer DateClick Change Date, Add Events - Change Date- Add Single Event- Add Repeating Event
ClickEvent Manage Event - View Details- Edit Event- Delete Event- Add Comments
Regional Admin DateClick Change Date, Add Events, Manage Organizers - Change Date- Add Single Event- Add Repeating Event- Add Organizers
ClickEvent Manage Event, Organizers - View Details- Edit Event- Delete Event- Add Comments- Manage Organizers
System Admin DateClick Change Date, Add Events, Manage Organizers, Manage Locations - Change Date- Add Single Event- Add Repeating Event- Add Organizers- Manage Locations
ClickEvent Full Event Control - View Details- Edit Event- Delete Event- Add Comments- Manage Organizers- Manage Locations

This structure outlines the role-based actions and submenus for both DateClick and ClickEvent interactions.

## Role: Everyone

**Hamburger Menu:**

- About
- Help
- Information

**Calendar Navigation:**

- Full

**Event Click:**

- View event details (read-only for Anonymous, view-only for others)

**Date Click:**

- Navigate to day view

**Event Details:**

- View only (Anonymous, others see read-only)

## Role: Anonymous User

**Hamburger Menu:**

- Login/Sign Up
- Message

**Calendar Navigation:**

- Full

**Event Click:**

- View event details (read-only)

**Date Click:**

- Navigate to day view

**Event Details:**

- View only

## Role: Named User

**Hamburger Menu:**

- User Settings
- Request to Regional Organizer (if not already a Regional Organizer)
- Message
- Logout

**Calendar Navigation:**

- Full

**Event Click:**

- View event details (with Add Comment/Photo option)

**Date Click:**

- Navigate to day view

**Event Details:**

- Can add comments or photos

## Role: Regional Organizer

**Hamburger Menu:**

- Manage Events
- Location Management
- Ads Management
- Contact Regional Admin
- Contact Other Regional Organizer
- Logout

**Calendar Navigation:**

- Full

**Event Click:**

- Hover Menu (Edit, Delete, View); Click leads to Edit Event

**Date Click:**

- Hover menu: Add Event or Cancel

**Event Details:**

- Can edit, delete, or view events

## Role: Regional Admin

**Hamburger Menu:**

- All Organizer Management
- Merge Locations
- Regional Event Management
- Logout

**Calendar Navigation:**

- Full

**Event Click:**

- View event details

**Date Click:**

- Navigate to day view

**Event Details:**

- View only

## Role: System Owner

**Hamburger Menu:**

- System Settings
- Region Management
- Full Event Management
- User Management​⬤
