# FEATURE_3003_RemoveWeeklyCalendarView

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-01-30 10:00

- [x] Create Feature_3003_RemoveWeeklyCalendarView.md document
- [ ] Scout calendar component to understand current view implementation
- [ ] Architect solution for removing weekly view while preserving monthly and list
- [ ] Build the changes to remove weekly view
- [ ] Test changes and verify monthly/list views still work

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-01-30 10:30

**Calendar Implementation Found:**
- Main calendar in `/src/app/calendar/page.js` uses FullCalendar with plugins: dayGridPlugin, timeGridPlugin, listPlugin
- Three view buttons currently available:
  - Monthly: `dayGridMonth` (CalendarMonthIcon)
  - Weekly: `timeGridWeek` (ViewWeekIcon) - **TO BE REMOVED**
  - List: `listWeek` (ListIcon)

**Key Components to Modify:**
- Line 8: `timeGridPlugin` import - can be removed
- Line 16: `ViewWeekIcon` import - can be removed  
- Lines 153-155: Weekly view button - needs removal
- Lines 73, 82: References to `listWeek` in responsive logic - should change to `listMonth`
- Line 164: `timeGridPlugin` in plugins array - can be removed

**No Other Weekly References Found:**
- Checked codebase for `timeGridWeek`, `ViewWeek`, `weekly` patterns
- Only found unrelated "weekly" in recurring events modal (not calendar view)
- No other components depend on weekly calendar view

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-01-30 10:35

**Removal Strategy:**
1. **Clean Removal Approach**: Remove all weekly view components and dependencies without affecting monthly/list functionality

**Changes Required:**
1. **Remove Imports** (calendar/page.js):
   - Remove `timeGridPlugin` from FullCalendar imports (line 8)
   - Remove `ViewWeekIcon` from MUI imports (line 16)

2. **Remove Weekly View Button** (lines 153-155):
   - Delete the IconButton for weekly view from ButtonGroup

3. **Update FullCalendar Configuration**:
   - Remove `timeGridPlugin` from plugins array (line 164)

4. **Fix Responsive Logic** (lines 73, 82):
   - Change `listWeek` to `listMonth` for mobile responsive behavior
   - This ensures list view shows monthly data instead of weekly data

**Benefits:**
- Simplifies UI with only 2 view options (Monthly/List)
- Reduces bundle size by removing timeGridPlugin
- Maintains all existing functionality for remaining views
- No database or API changes required

**Risk Mitigation:**
- No breaking changes to data flow
- Monthly and List views use different plugins (dayGridPlugin, listPlugin)
- Responsive behavior preserved with listMonth instead of listWeek

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-01-30 10:40

**Changes Implemented in `/src/app/calendar/page.js`:**

1. **Removed Imports:**
   - Removed `import timeGridPlugin from '@fullcalendar/timegrid';`
   - Removed `import ViewWeekIcon from '@mui/icons-material/ViewWeek';`

2. **Updated Responsive Logic:**
   - Changed `getInitialView()` to use `listMonth` instead of `listWeek`
   - Updated window resize handler to use `listMonth` instead of `listWeek`

3. **Removed Weekly View Button:**
   - Deleted the IconButton for weekly view (timeGridWeek) from ButtonGroup
   - Weekly view button with ViewWeekIcon completely removed

4. **Updated FullCalendar Configuration:**
   - Removed `timeGridPlugin` from plugins array
   - Changed `listWeek` to `listMonth` in views configuration
   - Updated list view onClick handler to use `listMonth`

**Technical Notes:**
- All changes maintain existing functionality for Monthly and List views
- Bundle size reduced by removing unused timeGridPlugin
- Mobile responsive behavior now uses monthly list view instead of weekly
- No breaking changes to event data or API calls

**Testing Results:**
- ✅ Build test passed successfully (`npm run build`)
- ✅ No compilation errors introduced
- ✅ Calendar page still renders with 2 view buttons (Monthly/List)
- ✅ Responsive logic updated to use listMonth for mobile devices
- ✅ All changes committed to feature branch

---

## Summary
Remove the weekly view option from the TangoTiempo calendar, leaving only monthly and list views available to users.

## Motivation
User request to simplify calendar interface by removing the weekly view option, keeping only monthly and list views for better user experience.

## Scope
**In-Scope:**
- Remove weekly view button/option from calendar interface
- Ensure monthly and list views continue to function properly
- Update any view-switching logic to handle only 2 views
- Remove any weekly-specific styling or components

**Out-of-Scope:**
- Modifying monthly or list view functionality
- Adding new calendar views
- Changing calendar data fetching logic

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Calendar view switcher will show only Monthly and List options |
| API        | No changes required - same event data used by remaining views |
| Backend    | No changes required |
| Integration | Remove weekly view from FullCalendar configuration |

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ✅ Complete    | Create feature document             | 2025-01-30    |
| ✅ Complete    | Scout calendar implementation       | 2025-01-30    |
| ✅ Complete    | Design removal approach             | 2025-01-30    |
| ✅ Complete    | Remove weekly view from UI          | 2025-01-30    |
| ✅ Complete    | Update view switching logic         | 2025-01-30    |
| ✅ Complete    | Test remaining views work properly  | 2025-01-30    |

## Dependencies
- Understanding of current FullCalendar implementation
- Calendar page component structure
- View switching mechanism

## Owner
AI Guild - TangoTiempo Development

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-01-30 |
| First Dev | 2025-01-30 |
| Review    | Ready      |
| Completed | Ready      |