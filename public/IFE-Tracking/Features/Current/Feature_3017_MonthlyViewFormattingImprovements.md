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
**Last updated:** 2025-01-30 17:00

- Need to investigate monthly view event rendering in `renderEventContent` function
- Need to examine CategoryCircles component implementation
- Need to understand time formatting and title styling in monthly view
- Need to identify where AM/PM formatting is applied

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-01-30 17:00

- Awaiting scouting results to design formatting improvements

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-01-30 17:00

- Awaiting architecture decisions to begin implementation

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