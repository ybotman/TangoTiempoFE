# FEATURE_3018_EnhancedUserInfoDisplay

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-05-31 14:30

- [x] Create Feature tracking document
- [ ] Scout current SiteMenuBarUserDrawer implementation
- [ ] Analyze userLogins data structure and API endpoints
- [ ] Design component layout for new user info display
- [ ] Implement enhanced user info display component
- [ ] Add conditional messaging logic
- [ ] Test feature implementation

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-05-31 15:00

✅ **Current Implementation Analysis:**
- SiteMenuBarUserDrawer: 300px width, right-positioned drawer
- User data access via AuthContext.user.backendInfo contains full userLogins model
- Clear data structure: localUserInfo, regionalOrganizerInfo, localAdminInfo with isApproved/isEnabled flags
- Firebase UID available as user.uid
- Role display uses mapping (NamedUser → Milongerx)

✅ **Data Access Pattern:**
- `user.uid` - Firebase UID 
- `user.backendInfo.localUserInfo.{isApproved, isEnabled}`
- `user.backendInfo.regionalOrganizerInfo.{isApproved, isEnabled}`
- `user.backendInfo.localAdminInfo.{isApproved, isEnabled}`

✅ **Risk Assessment:** Low risk - no backend changes needed, existing data structures sufficient

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-05-31 15:00

✅ **User approved feature requirements for enhanced user info display in side drawer**

✅ **Technical Design Decisions:**

**Component Layout Design:**
```
[User Avatar] [User Name]
              Firebase ID: abc123... (small gray text)
              
Role Status Display:
• NU : Approved ✓ Enabled ✓
• RO : Approved ✗ Enabled ✗  
• Admin : Approved ✗ Enabled ✗

[Role Selection Radio Buttons] (existing)

[LOGOUT Button] (existing)

Conditional Messages:
- "Update your Organizer Settings to enable your organizer role." (if RO approved=true, enabled=false)
- "You can apply to add events for free" (if RO approved=false)
```

**Implementation Approach:**
1. **Data Access Strategy**: Use existing user.backendInfo structure, no additional API calls needed
2. **Status Display Logic**: Create helper function to format status indicators (✓/✗)
3. **Conditional Rendering**: Implement conditional message logic based on RO approval states
4. **Styling Strategy**: Use MUI Typography with consistent spacing, small text for Firebase UID
5. **Placement Strategy**: Insert new content between user name and role selection, messages after logout

**Technical Specifications:**
- Helper function: `getRoleStatusDisplay(roleInfo)` → returns formatted status string
- Helper function: `getConditionalMessage(roInfo)` → returns appropriate message or null
- Typography variants: body2 for Firebase UID, body1 for role status, caption for messages
- Color scheme: success.main for ✓, error.main for ✗, text.secondary for Firebase UID

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-05-31 14:30

- Implementation pending

---

## Summary
Enhance the user management side drawer to display comprehensive user role and status information including Firebase UID, approval states, and contextual messaging for Regional Organizer functionality.

## Motivation
Provide users with clear visibility into their account status, role permissions, and available actions to improve user experience and reduce support inquiries about role capabilities.

## Scope
**In-Scope:**
- Firebase UID display under user name
- Named User info display (isApproved, isEnabled)
- Regional Organizer info display (isApproved, isEnabled) 
- Local Admin info display
- Conditional messaging for RO status
- Integration with existing user drawer component

**Out-of-Scope:**
- Role modification functionality
- New user registration flow
- Backend user data structure changes

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | SiteMenuBarUserDrawer component enhanced with role status display |
| API        | Utilize existing userLogins endpoints for role data |
| Backend    | No changes required - use existing userLogins model |
| Integration | Integrate with AuthContext for user data |

## Design
Enhanced user drawer will display:
1. User name (existing)
2. Firebase UID (small text, new)
3. Role status indicators:
   - NU : Approved ✓/✗ Enabled ✓/✗
   - RO : Approved ✓/✗ Enabled ✓/✗
   - Admin : Approved ✓/✗ Enabled ✓/✗
4. Conditional messages below LOGOUT button:
   - If RO approved=true, enabled=false: "Update your Organizer Settings to enable your organizer role."
   - If RO approved=false: "You can apply to add events for free"

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ✅ Complete    | Create Feature tracking document     | 2025-05-31    |
| 🚧 In Progress | Scout current implementation         | 2025-05-31    |
| ⏳ Pending      | Analyze userLogins data structure    |               |
| ⏳ Pending      | Design component layout              |               |
| ⏳ Pending      | Implement enhanced display           |               |
| ⏳ Pending      | Add conditional messaging            |               |
| ⏳ Pending      | Test implementation                  |               |

## Rollback Plan
If rollback is required:
- Revert changes to SiteMenuBarUserDrawer component
- Remove any new API calls or data fetching logic
- Restore original user drawer functionality

## Dependencies
- AuthContext for current user data
- UserLogins model structure from backend
- Existing SiteMenuBarUserDrawer component
- Role management system

## Linked Issues / Docs
- Related to authentication and role workflow system
- Part of user experience improvements

## Owner
AI Guild Builder

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-05-31 |
| First Dev | 2025-05-31 |
| Review    | TBD        |
| Completed | TBD        |

---