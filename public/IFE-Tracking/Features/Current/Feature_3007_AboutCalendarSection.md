# FEATURE_3007_AboutCalendarSection

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2024-05-15

- [ ] Design UI for About Calendar section/modal
- [ ] Create About Calendar modal component
- [ ] Implement version history display from versions.json
- [ ] Add completed feature/issue history from IFE-Tracking
- [ ] Implement user identification display (Firebase ID, User ID, Organizer ID)
- [ ] Add geolocation information display
- [ ] Implement credits and acknowledgments section
- [ ] Add support information and contact details
- [ ] Create link to About Calendar in hamburger menu

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2024-05-15

- Version history is tracked in public/versions.json
- commitVersions.js handles updating the version history
- Need to determine how to best structure the component for displaying version history
- Consider privacy implications of displaying user identifiers

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2024-05-15

- Create a dedicated modal component for About Calendar information
- Add an entry in the hamburger menu under the "Information" section
- Organize content in tabs for better usability
- Implement secure display of user identifiers with appropriate masking

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2024-05-15

- Not started

---

## Summary
This feature adds an "About Calendar" section accessible from the hamburger menu, providing users with information about the application's version, recent updates, credits, and technical details. It also displays user-specific information such as Firebase ID, User ID, and Organizer ID, along with geolocation information, to aid in troubleshooting and support.

## Motivation
- Provide transparency about application versions and updates
- Help users understand recent changes and bug fixes
- Assist with troubleshooting by showing technical information
- Acknowledge contributors and provide support information
- Create a centralized location for system information and history

## Scope
- **In-Scope:**
  - About Calendar modal accessible from hamburger menu
  - Version history display from versions.json
  - Completed features and fixed issues from IFE-Tracking
  - User identifier display (Firebase ID, User ID, Organizer ID)
  - Geolocation information display
  - Credits and acknowledgments
  - Support information and contact details
  
- **Out-of-Scope:**
  - Complex visualization of development timeline
  - User-editable information
  - Feature request submission
  - Detailed technical logs or diagnostics

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Modal with tabbed interface for different information categories |
| Data       | Version history from versions.json, feature/issue info from IFE-Tracking |
| Privacy    | Masked display of sensitive user identifiers with option to copy full values |
| UX         | Organized, readable display of technical information for troubleshooting |

## Design
- Add "About Calendar" item to hamburger menu under "Information" section
- Modal with tabs for different categories:
  - Overview: Basic app info, version, and description
  - Version History: Timeline of updates from versions.json
  - Features & Fixes: List of completed features and fixed issues
  - Technical Info: User IDs and geolocation data
  - Credits & Support: Team acknowledgments and contact info

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Create AboutCalendarModal component | 2024-05-15 |
| ⏳ Pending      | Add menu entry in SidebarDrawer.js | 2024-05-15 |
| ⏳ Pending      | Implement version history display | 2024-05-15 |
| ⏳ Pending      | Create feature/issue history component | 2024-05-15 |
| ⏳ Pending      | Implement user identifier display | 2024-05-15 |
| ⏳ Pending      | Add geolocation information section | 2024-05-15 |
| ⏳ Pending      | Create credits and support section | 2024-05-15 |
| ⏳ Pending      | Test with various user states and roles | 2024-05-15 |

## Rollback Plan
- Remove the About Calendar menu item
- Delete the AboutCalendarModal component
- No database changes required

## Dependencies
- versions.json for version history
- IFE-Tracking structure for feature/issue information
- AuthContext for user identification
- GeoLocationContext for location information

## Linked Issues / Docs
- commitVersions.js for version history management
- AuthContext.js for user identification
- GeoLocationContext.js for location information

## Owner
Tango Tiempo Dev Team

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2024-05-15 |
| First Dev | TBD        |
| Review    | TBD        |
| Completed | TBD        |

---

## Best Practices
- This document is the **authoritative record** for all feature-related actions and decisions.
- Each Guild role must update its own section, using its icon and a datetime stamp.
- Keep features self-contained and verifiable
- Avoid scope creep — create a new FEATURE doc if needed
- Write in Markdown
- Store all supporting assets in same folder as feature
- Update task statuses frequently
- Finalize by moving to `/public/IFE-Tracking/Features/Completed` when live