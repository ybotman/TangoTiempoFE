# FEATURE_3012_ListViewStartToday

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-05-26 16:15

- [ ] Investigate current FullCalendar list view implementation
- [ ] Identify where list view start date is configured
- [ ] Implement TODAY as default start date for list view only
- [ ] Test that monthly and weekly views remain unchanged
- [ ] Verify functionality across different calendar states

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-05-26 16:25

### Key Findings:
- **FullCalendar Location**: Main calendar implementation in `src/app/calendar/page.js`
- **Current List View**: Uses `listWeek` view which starts from beginning of week (Sunday)
- **View Configuration**: FullCalendar views configured in `views` object (lines 181-189)
- **Initial View Logic**: `getInitialView()` function chooses between dayGridMonth (desktop) and listWeek (mobile)
- **View Switching**: Manual view buttons at lines 159-161 switch to listWeek

### Technical Details:
- FullCalendar plugins: dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin
- List view configuration: `listWeek` with `dayMaxEvents: 'true'`
- No custom initialDate or validRange currently set
- Navigation handled by handleToday, handlePrev, handleNext functions

### Implementation Approach:
- Need to modify FullCalendar configuration to set initial date for listWeek view
- Can use `initialDate` property or modify view-specific settings
- Should only affect listWeek, not dayGridMonth or timeGridWeek

### Risks:
- Low risk - FullCalendar supports per-view configuration
- Need to ensure navigation (prev/next) still works correctly
- Should preserve existing mobile responsiveness

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-05-26 16:15

- Pending user clarification on scope and implementation approach

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-05-26 16:15

- Implementation pending completion of investigation phase

---

## Summary
Modify the calendar List view to start from TODAY's date by default instead of the current Sunday-based start. This change should only affect the List view mode, leaving Monthly and Weekly views unchanged.

## Motivation
Improve user experience by showing the most relevant events first when users switch to List view. Currently, the List view defaults to Sunday which may show past events or require scrolling to find current/upcoming events.

## Scope
- **In-Scope:** 
  - Modify List view default start date to TODAY
  - Preserve existing Monthly and Weekly view behavior
  - Maintain user's ability to navigate to other dates in List view
- **Out-of-Scope:** 
  - Changes to Monthly or Weekly view start dates
  - Persistent user preferences for start dates
  - Time zone handling (use existing system)

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | List view calendar starts from current date           |
| API        | No backend changes required                           |
| Backend    | No changes needed                                     |
| Integration | FullCalendar configuration modification               |

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Investigate current list view config|               |
| ⏳ Pending      | Locate FullCalendar initialization  |               |
| ⏳ Pending      | Implement TODAY start for list view |               |
| ⏳ Pending      | Test across all calendar view modes |               |
| ⏳ Pending      | Verify no regression in other views |               |

## Dependencies
- FullCalendar library configuration
- Existing calendar page implementation
- No external API dependencies

## Owner
AI Guild Development Team

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-05-26 |
| First Dev |            |
| Review    |            |
| Completed |            |