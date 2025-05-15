# FEATURE_3004_CalendarShowImages

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2024-05-15

- [ ] Create "Show Images" toggle component with MUI Switch
- [ ] Add toggle to calendar view controls
- [ ] Implement view-specific image display settings in localStorage
- [ ] Create hook for managing image display preferences
- [ ] Update event rendering to conditionally show images based on settings
- [ ] Implement image size optimization for different calendar views
- [ ] Add placeholders for missing event images
- [ ] Ensure responsive behavior across all devices

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2024-05-15

- The calendar currently doesn't show event images directly in the Month, Week, or Day views
- Images only appear in the event detail modal
- FullCalendar may support custom event rendering that can include images
- Need to determine optimal image size/resolution for different views
- Consider bandwidth and performance impacts of loading many images at once

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2024-05-15

- Recommend extending useCalendarPage hook to manage image display preferences
- Toggle preferences should be saved in localStorage for persistence
- Implement default settings: Month view (off), Week view (off), List view (on)
- Add image toggle button alongside existing view type controls
- Create custom event rendering components for each view type

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2024-05-15

- Not started

---

## Summary
This feature adds a "Show Images" toggle button to the calendar views, allowing users to control whether event images are displayed directly in the Month, Week, and List views. Each view remembers its own setting, with defaults of Off for Month and Week views, and On for List view.

## Motivation
- Enhance visual browsing of events with thumbnail images
- Allow users to customize their viewing experience based on preference
- Improve event recognition through visual cues
- Maintain performance by letting users disable images when needed

## Scope
- **In-Scope:**
  - Add "Show Images" toggle button to calendar control area
  - Implement view-specific image display settings (Month, Week, List)
  - Save user preferences in localStorage
  - Display optimized images in each calendar view
  - Create image placeholders for events without images
  
- **Out-of-Scope:**
  - Image upload or management features
  - Event card redesign beyond image addition
  - Advanced image processing or filtering
  - Gallery view of event images

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | New "Show Images" toggle button in calendar controls, optimized image display in events |
| Storage    | User preferences saved in localStorage by view type |
| Performance | Optimized image loading with appropriate thumbnails for each view |
| UX         | Default settings: Month (off), Week (off), List (on) |

## Design
- Add "Show Images" toggle with an icon next to the existing calendar view controls
- For Month view: Small thumbnails shown in corner of event cells when enabled
- For Week view: Thumbnails shown inline with event titles when enabled
- For List view: Larger thumbnails shown alongside event details when enabled
- Toggle state is visually indicated and matches current view's setting

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Add showImages state to useCalendarPage hook | 2024-05-15 |
| ⏳ Pending      | Create UI toggle component | 2024-05-15 |
| ⏳ Pending      | Implement localStorage persistence for preferences | 2024-05-15 |
| ⏳ Pending      | Update calendar rendering for Month view with images | 2024-05-15 |
| ⏳ Pending      | Update calendar rendering for Week view with images | 2024-05-15 |
| ⏳ Pending      | Update calendar rendering for List view with images | 2024-05-15 |
| ⏳ Pending      | Add image optimization and lazy loading | 2024-05-15 |
| ⏳ Pending      | Create fallback image handling | 2024-05-15 |
| ⏳ Pending      | Add comprehensive testing across devices | 2024-05-15 |

## Rollback Plan
- Remove image toggle button from UI
- Revert to standard event rendering without images
- Keep localStorage keys but ignore values

## Dependencies
- FullCalendar library's event rendering capabilities
- Existing event image handling in ViewEventDetailModal
- React state management in useCalendarPage hook

## Linked Issues / Docs
- ViewEventDetailModal implementation for reference on image handling
- FullCalendar documentation on custom event rendering

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