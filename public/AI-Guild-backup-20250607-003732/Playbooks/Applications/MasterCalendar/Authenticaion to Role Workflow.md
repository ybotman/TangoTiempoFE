# TangoTiempo — Authentication & Role Workflow

## 1. Firebase Authentication  
- **Login:** Users sign in via Firebase Auth, receiving a unique **Firebase UID**.  
- **Firebase UID** serves as the primary key to link into our application data.

## 2. UserLogins Collection  
- One-to-one mapping: **Firebase UID ↔ UserLogin** document.  
- **UserLogin** fields:  
  - `_id` (UserLogin ID)  
  - `firebaseUid`  
  - `roles: string[]` (e.g. `NamedUser`, `RegionalOrganizer`, `RegionalAdmin`)  
  - `organizerId?: ObjectId` (populated when approved as an organizer)

## 3. Roles Collection  
- Defines all possible roles:  
  - `NamedUser` (read-only)  
  - `RegionalOrganizer` (event‐create/edit)  
  - `RegionalAdmin` (higher‐level management)  
- UserLogin’s `roles` array references these values.

## 4. Organizer Approval & Linking  
1. **Application:** A user requests to become an organizer.  
2. **CalOps Approval:** Admin reviews and, if approved:  
   - Creates an **Organizer** document (`_id = organizerId`)  
   - Updates the user’s UserLogin:  
     ```js
     userLogin.organizerId = organizerId;
     userLogin.roles.push("RegionalOrganizer");
     ```  
   - Copies `firebaseUid` into the Organizer record for traceability.

## 5. Role Switching at Runtime  
- **Default Role:** Upon login, users start as `NamedUser`.  
- **Switch Role:** A UI control lets the user toggle to `RegionalOrganizer` if they have that role.  
- **Permissions Change:**  
  - **NamedUser**:  
    - Browse all public events  
    - Favorite organizers  
    - Receive notifications (per tier)  
  - **RegionalOrganizer**:  
    - Filter to view *only* events they own  
    - Create / edit / cancel events under their `organizerId`  
    - Manage venues within their region

## 6. Event Creation Workflow  
1. **Login → Firebase UID → UserLogin** lookup  
2. **Role = RegionalOrganizer?**  
   - Yes → Load organizer’s events (`event.organizerId == userLogin.organizerId`)  
   - No → Read-only view  
3. **Create/Edit Event:**  
   - New event document is saved with `organizerId` = userLogin.organizerId  
   - Security rules enforce that only RegionalOrganizers may write events with their own organizerId

---
**Note:**  
- The one-to-one mapping of Firebase UID, UserLogin ID, and Organizer ID ensures secure, traceable role assignments.  
- Role arrays in UserLogin drive UI permissions and API access.  
- CalOps remains the source of truth for approving and managing organizer relationships.  