# FEATURE_3005_ThreeCategoryCircles

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2024-05-15

- [ ] Design UI for displaying three category circles in event listings
- [ ] Create new component for rendering category circles
- [ ] Update FullCalendar event rendering to include all three categories
- [ ] Implement color coding for each category circle
- [ ] Add tooltip or hover information displaying category names
- [ ] Update list view to show all three categories
- [ ] Update month view to show multiple categories where space allows
- [ ] Test visual appearance across all calendar views

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2024-05-15

- Currently only the primary category (categoryFirst) is displayed visually
- Event data already includes all three categories (First, Second, Third)
- Category colors are defined in categoryColors.js
- Need to determine best UI approach for displaying multiple circles

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2024-05-15

- Recommend displaying three small circles in a row for each event
- Circle size should adjust based on available space in each view
- Empty categories should show a transparent or gray circle
- Circles should have a tooltip showing the category name on hover
- Consider accessibility implications with color-only indicators

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2024-05-15

- Not started

---

## Summary
This feature enhances event listings in the calendar by displaying all three category indicators (Primary, Secondary, and Tertiary) as colored circles for each event. This provides users with more detailed visual information about events at a glance, improving event categorization and filtering capabilities.

## Motivation
- Improve at-a-glance event classification with visual indicators
- Provide more detailed category information without requiring users to open event details
- Enable users to quickly identify events with specific category combinations
- Enhance the calendar's visual information density in a clean, intuitive way

## Scope
- **In-Scope:**
  - Display all three category circles for each event in all calendar views
  - Implement appropriate sizing and spacing for different calendar views
  - Add tooltips showing category names on hover
  - Handle empty category slots with appropriate visual indicators
  - Ensure responsive behavior across different screen sizes
  
- **Out-of-Scope:**
  - Changing the category assignment process for events
  - Redesigning the category selection UI in event creation/editing
  - Adding new categories or changing category colors
  - Major restructuring of event cards beyond adding the category circles

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Three colored circles indicating event categories displayed with each event |
| Visuals    | Circle colors match the established category color scheme |
| Interaction | Tooltips on hover showing the category name |
| Responsiveness | Appropriate sizing and visibility across different views and screen sizes |

## Design
- Three small circles displayed horizontally for each event
- Primary category (first) circle slightly larger or more prominent
- Secondary and tertiary category circles slightly smaller
- Empty category slots shown as transparent or gray circles
- Tooltips on hover reveal the full category name
- Circles positioned to not interfere with event title readability

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ⏳ Pending      | Create CategoryCircles component | 2024-05-15 |
| ⏳ Pending      | Update FullCalendar event rendering | 2024-05-15 |
| ⏳ Pending      | Implement tooltip functionality | 2024-05-15 |
| ⏳ Pending      | Style circles for Month view | 2024-05-15 |
| ⏳ Pending      | Style circles for Week view | 2024-05-15 |
| ⏳ Pending      | Style circles for List view | 2024-05-15 |
| ⏳ Pending      | Handle empty category slots | 2024-05-15 |
| ⏳ Pending      | Test across different devices and screen sizes | 2024-05-15 |

## Rollback Plan
- Revert to single category display in event rendering
- Keep component files but disable their use in the calendar views

## Dependencies
- Existing category data structure in event objects
- FullCalendar custom event rendering capabilities
- Category color definitions in categoryColors.js

## Linked Issues / Docs
- transformEvents.js for event data structure
- categoryColors.js for color definitions

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