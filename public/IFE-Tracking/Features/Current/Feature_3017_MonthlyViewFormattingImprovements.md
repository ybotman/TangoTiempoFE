# FEATURE_3017_MonthlyViewFormattingImprovements

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-01-30 17:00

- [x] Create Feature_3017_MonthlyViewFormattingImprovements.md document
- [ ] Scout current monthly view implementation and CategoryCircles component
- [ ] Architect solution for moving category dots, formatting time, and removing bold titles
- [ ] Build the formatting improvements
- [ ] Test changes in monthly view

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-01-30 17:15

**Current Implementation Found:**
- Monthly view uses `renderEventContent` function in `/src/app/calendar/page.js` (lines 77-103)
- CategoryCircles component in `/src/app/components/UI/CategoryCircles.js` shows 3 circles horizontally
- Current layout: Categories on left, title on right (flexbox with gap: '4px')
- Title styling: `fontWeight: 'bold'`, `fontSize: '0.75rem'`
- CategoryCircles has 8px primary circle, 6px secondary circles, 2px gaps

**Key Findings:**
- FullCalendar automatically displays event times - not controlled by renderEventContent
- Event title and categories are custom rendered through renderEventContent function
- Categories currently inline with title using flexbox layout
- No custom time formatting is currently applied - FullCalendar default includes AM/PM

**Architecture Needed:**
- Modify renderEventContent to show vertical layout (time at top, categories below)
- Add custom time formatting function to remove AM/PM
- Change title fontWeight from 'bold' to 'normal'
- Detect if view is monthly vs list to apply different layouts

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-01-30 17:20

**Solution Architecture:**

**1. Monthly View Detection:**
- Add view type detection in renderEventContent: `eventInfo.view.type === 'dayGridMonth'`
- Apply different layouts for monthly vs list views

**2. Time Display Customization:**
- Custom time formatting function to remove AM/PM and format end time smaller
- Add time display at top of event content (currently FullCalendar handles this)
- Format: "9:00-11:30" instead of "9:00 AM - 11:30 PM"

**3. Layout Changes for Monthly View:**
```
Current: [●●●] Event Title
New:     9:00-11:30
         Event Title  
         [●●●]
```

**4. Implementation Plan:**
- Modify renderEventContent function to have monthly-specific layout
- Add custom time formatting utility function
- Move CategoryCircles below title in monthly view
- Change title fontWeight from 'bold' to 'normal'
- Keep existing layout for list view unchanged

**Benefits:**
- Better space utilization in monthly view
- Cleaner, less cluttered appearance
- Smaller end time saves horizontal space
- Categories below don't compete with title for space

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-05-30 19:15

**Implementation Completed:**

1. **Added Time Formatting Function:**
   - Created `formatTimeForMonthly()` function that removes AM/PM indicators
   - Formats time as "9:00" instead of "9:00 AM"
   - Returns both start and end times in clean format

2. **Modified renderEventContent Function:**
   - Added view type detection: `eventInfo.view.type === 'dayGridMonth'`
   - Created separate layouts for monthly vs list views
   - Monthly view uses vertical flexbox layout

3. **Monthly View Layout Implementation:**
   ```
   Time: 9:00-11:30 (smaller end time)
   Title: Event Title (non-bold)
   Circles: [●●●] (below content)
   ```

4. **Styling Changes:**
   - Time display: fontSize '0.65rem', end time '0.55rem' 
   - Title: fontSize '0.75rem', fontWeight 'normal' (changed from 'bold')
   - CategoryCircles moved below title using flexDirection 'column'
   - List view maintains existing horizontal layout unchanged

5. **Build Test:**
   - Build completed successfully with no errors
   - All formatting improvements implemented as architected
   - No breaking changes to existing list view functionality

**Technical Choices:**
- Used conditional rendering based on view type rather than CSS classes for clarity
- Kept existing horizontal layout for list view to maintain consistency
- Used smaller margins (1px) for compact vertical spacing in monthly view

---

## Summary
Improve the formatting and layout of events in the monthly calendar view for better space utilization and readability.

## Motivation
User feedback requesting better formatting in monthly view:
1. Category colored dots take up horizontal space - move them below time
2. End time formatting takes too much space - make smaller and remove AM/PM
3. Event titles are too bold - change to regular font weight

## Scope
**In-Scope:**
- Move category circles below start/end time in monthly view
- Format end time as smaller and remove AM/PM indicators
- Change event titles from bold to regular font weight
- Maintain existing functionality for list view (no changes)

**Out-of-Scope:**
- Changes to list view formatting
- Changes to event data or API
- Changes to category circle colors or logic

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Monthly view events show: Time on top, circles below, regular titles |
| API        | No changes required - same event data |
| Backend    | No changes required |
| Integration | Update renderEventContent function for monthly view specific layout |

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ✅ Complete    | Create feature document             | 2025-01-30    |
| ⏳ Pending      | Scout monthly view implementation   | -             |
| ⏳ Pending      | Design formatting improvements      | -             |
| ⏳ Pending      | Move category circles below time    | -             |
| ⏳ Pending      | Format time display (smaller end time, no AM/PM) | -             |
| ⏳ Pending      | Remove bold from event titles       | -             |
| ⏳ Pending      | Test monthly view formatting        | -             |

## Dependencies
- Understanding of current renderEventContent function
- CategoryCircles component structure
- Monthly view specific styling

## Owner
AI Guild - TangoTiempo Development

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-01-30 |
| First Dev | TBD        |
| Review    | TBD        |
| Completed | TBD        |