# ISSUE_1035_AnonymousUserSubmenuNotBypassed

> **IFE Issue Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this issue.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-01-07 08:45

- [x] Identify root cause of anonymous user submenu not being bypassed
- [ ] Fix role check logic in useCalendarPage.js
- [ ] Test with logged out users
- [ ] Verify no side effects on other roles

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-01-07 08:45

**Root Cause Identified:**
- Feature 3019 was implemented to bypass submenu for Anonymous and NamedUser roles
- NamedUser (Milongerx) role works correctly - clicking event opens ViewEventDetailModal directly
- Anonymous users still see submenu because of mismatched role value

**Technical Details:**
- When user is not logged in, AuthContext sets `selectedRole = ''` (empty string)
- Feature 3019 checks: `selectedRole === listOfAllRoles.ANONYMOUS` 
- But `listOfAllRoles.ANONYMOUS = 'Anonymous'` (string value)
- The check fails because `'' !== 'Anonymous'`

**Evidence:**
- `AuthContext.js:46`: `setSelectedRole(''); // Reset selectedRole on logout`
- `useCalendarPage.js:215`: `if (selectedRole === listOfAllRoles.NAMED_USER || selectedRole === listOfAllRoles.ANONYMOUS)`
- `masterData.js:9`: `ANONYMOUS: 'Anonymous'`

**Recommended Fix:**
Update the condition to also check for empty string:
```javascript
if (selectedRole === listOfAllRoles.NAMED_USER || selectedRole === '' || selectedRole === listOfAllRoles.ANONYMOUS)
```

## 🛠️ BUILDER / PATCH / TINKER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-01-07 09:00

**Implementation Completed:**

1. **Fixed role check in useCalendarPage.js**:
   - Added empty string check to both `handleDateClick` and `handleEventClick` functions
   - Updated conditions to: `selectedRole === listOfAllRoles.NAMED_USER || selectedRole === '' || selectedRole === listOfAllRoles.ANONYMOUS`
   - Added comment referencing Issue_1035 for traceability

2. **Changes made:**
   - **File**: src/app/hooks/useCalendarPage.js
   - **Line 193**: Updated date click handler condition
   - **Line 217**: Updated event click handler condition
   
3. **Technical approach:**
   - Maintained backward compatibility by keeping original checks
   - Added empty string check to handle AuthContext's anonymous user state
   - No changes to AuthContext to minimize impact
   - Solution is localized to the specific feature requirement

4. **No side effects expected:**
   - Other roles continue to function as before
   - No changes to role definitions or AuthContext behavior
   - Fix is purely additive (adds one more condition check)

---

## Summary
Anonymous users (not logged in) still see the calendar event submenu instead of directly opening ViewEventDetailModal, even though Feature 3019 was implemented to bypass the submenu for both Anonymous and NamedUser roles.

## Problem
When clicking on calendar events:
- NamedUser (Milongerx) correctly bypasses submenu ✅
- Anonymous users still see submenu ❌

## Expected Behavior
Both NamedUser and Anonymous users should:
- Click on event → Directly open ViewEventDetailModal
- No submenu should appear

## Actual Behavior
- NamedUser: Works correctly (no submenu)
- Anonymous: Still shows submenu

## Root Cause
Mismatch between AuthContext's selectedRole value for anonymous users (`''`) and the check in useCalendarPage.js (`listOfAllRoles.ANONYMOUS` which equals `'Anonymous'`).

## Risk Assessment
- **Low Risk**: Simple logic fix
- **No Breaking Changes**: Adding empty string check won't affect other roles
- **User Impact**: High - affects all non-logged-in users

## Testing Plan
1. Log out completely
2. Click on calendar event
3. Verify ViewEventDetailModal opens directly without submenu
4. Test other roles still show submenu appropriately

## Owner
AI Guild - TangoTiempo Development Team

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-01-07 |
| First Dev | TBD        |
| Review    | TBD        |
| Completed | TBD        |

---

## Git Integration

Issue branch: `issue/1035-anonymous-user-submenu-bypass`