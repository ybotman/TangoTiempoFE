# FEATURE_3009_RegionalOrganizerPhotoApproval

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2024-05-15

- [ ] Design photo review and approval workflow
- [ ] Extend database schema for photo approval status
- [ ] Create backend API for photo approval
- [ ] Implement approval notification system
- [ ] Create photo review dashboard for Regional Organizers
- [ ] Add auto-approval option for trusted users
- [ ] Implement photo moderation rules
- [ ] Add approval status indicators for event images
- [ ] Create user feedback for pending/approved photos

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2024-05-15

- Current image upload process is handled in uploadEventImages.js
- Photos are stored in Azure storage
- No existing approval workflow for uploaded images
- Need to define appropriate moderation criteria for photos

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2024-05-15

- Create an approval workflow with statuses: pending, approved, rejected
- Extend the event image schema to include approval status
- Design a dashboard for Regional Organizers to review pending photos
- Implement email notifications for approval/rejection
- Add auto-approval for trusted users based on history

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2024-05-15

- Not started

---

## Summary
This feature adds a photo approval system that allows Regional Organizers to review and approve user-submitted photos for events. It includes a review dashboard, approval workflow, notification system, and the option for auto-approval of trusted users' submissions. This enhances content quality while maintaining appropriate oversight.

## Motivation
- Ensure appropriate and high-quality images for events
- Give Regional Organizers control over event visual content
- Prevent inappropriate or irrelevant images
- Create a streamlined process for reviewing and approving photos
- Allow trusted users to have faster photo approval

## Scope
- **In-Scope:**
  - Regional Organizer dashboard for photo review
  - Approval workflow (pending, approved, rejected)
  - Auto-approval option for trusted users
  - Notification system for approval status
  - Photo moderation guidelines
  - Appropriate status indicators for photos
  
- **Out-of-Scope:**
  - Advanced image recognition or AI moderation
  - Photo editing or enhancement tools
  - Public photo galleries or social sharing
  - Comment system for photos
  - User reputation system

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Dashboard for Regional Organizers to review photos, status indicators for users |
| Backend    | Extended schema for approval status, API for approval actions |
| Workflow   | Submission → Review → Approval/Rejection with appropriate notifications |
| Trust      | Auto-approval for users with good submission history |

## Design
- **Photo Review Dashboard:** 
  - Grid view of pending photos with event details
  - Quick approve/reject actions
  - Batch operations for efficiency
  - Filter by event, user, date

- **User Experience:**
  - Status indicators for submitted photos (pending, approved, rejected)
  - Notifications when photo status changes
  - Clear feedback for rejected photos

- **Auto-Approval:**
  - Regional Organizers can set trusted users for auto-approval
  - System tracks approval history to suggest trusted status

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Extend database schema for photo approval | 2024-05-15 |
| ⏳ Pending      | Create backend API endpoints for approval actions | 2024-05-15 |
| ⏳ Pending      | Implement photo review dashboard | 2024-05-15 |
| ⏳ Pending      | Add approval status display to event images | 2024-05-15 |
| ⏳ Pending      | Implement notification system | 2024-05-15 |
| ⏳ Pending      | Create auto-approval functionality | 2024-05-15 |
| ⏳ Pending      | Add photo moderation guidelines | 2024-05-15 |
| ⏳ Pending      | Create user feedback for rejected photos | 2024-05-15 |

## Rollback Plan
- Disable approval workflow and default all images to approved status
- Remove approval UI elements
- Retain schema changes for future implementation

## Dependencies
- Existing image upload system in uploadEventImages.js
- Regional Organizer role permissions
- Notification system
- Event image display components

## Linked Issues / Docs
- uploadEventImages.js for current image upload implementation
- Regional Organizer authentication and permissions

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