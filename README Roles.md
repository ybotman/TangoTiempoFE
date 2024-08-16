User Roles and Permissions

Tango Tiempo supports a robust role-based access control system, allowing for different levels of access and functionality based on user roles. Below are the available roles and their respective permissions:

Roles Overview

1. Anonymous User

	•	Access: Public access with no need for login.
	•	Permissions:
	•	View events and details.
	•	Use basic filters (e.g., region and category).
	•	Limited to read-only access.

2. User

	•	Access: Requires login via Firebase authentication.
	•	Permissions:
	•	All permissions of an Anonymous User.
	•	Ability to save favorite events.
	•	Personalized event filtering and notifications.
	•	Can participate in community features (commenting, liking).

3. Region Organizer

	•	Access: Requires login with specific permissions granted.
	•	Permissions:
	•	All permissions of a User.
	•	Ability to create, edit, and manage events within their assigned region.
	•	Moderate comments and interactions on events in their region.
	•	Manage the regional event calendar.

4. Region Admin

	•	Access: Requires login with elevated permissions for regional management.
	•	Permissions:
	•	All permissions of a Region Organizer.
	•	Ability to manage other Region Organizers in their region.
	•	Full control over the regional event calendar, including the approval or removal of events.
	•	Manage regional user access and permissions.

5. System Admin

	•	Access: Requires login with the highest level of permissions.
	•	Permissions:
	•	All permissions of a Region Admin.
	•	Ability to manage the entire platform, including all regions.
	•	Global user management, including creating and assigning roles.
	•	Full access to system settings, configurations, and security controls.
	•	Oversee the overall operation and integrity of the platform.

Permissions Summary

| Role                | View Events | Save Favorites | Manage Events | Moderate Comments | Manage Users | Manage Regions | System Settings |
|---------------------|-------------|----------------|---------------|-------------------|--------------|----------------|-----------------|
| **Anonymous User**  | ✓           |                |               |                   |              |                |                 |
| **User**            | ✓           | ✓              |               |                   |              |                |                 |
| **Region Organizer**| ✓           | ✓              | ✓             | ✓                 |              |                |                 |
| **Region Admin**    | ✓           | ✓              | ✓             | ✓                 | ✓            | ✓              |                 |
| **System Admin**    | ✓           | ✓              | ✓             | ✓                 | ✓            | ✓              | ✓               |
|---------------------|-------------|----------------|---------------|-------------------|--------------|----------------|-----------------|


