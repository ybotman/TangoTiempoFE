# FEATURE_3016_ExpandableCategoryFilter

> **IFE Feature Document**  
> This document is the single source of truth for capturing all decisions, actions, and status updates related to this feature.  
> **Guild roles** must update this file directly, in their own sections, using their role icon and a datetime stamp.  
> All recommendations, decisions, and assignments must be recorded here by the responsible role.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-05-30 16:00

- [x] Scout current PostFilter component implementation
- [ ] Create Feature_3016 documentation
- [ ] Design expandable category interface
- [ ] Implement enhanced category filter UI
- [ ] Test multi-select functionality
- [ ] Verify POST filter integration
- [ ] Test responsiveness and user experience

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-05-30 16:00

**Current PostFilter Implementation Analysis:**

1. **Component Structure** (src/app/components/UI/PostFilter.js):
   - Currently shows first 4 categories inline with expand/collapse button
   - Expandable section shows remaining categories
   - Multi-select functionality already implemented
   - Uses existing category colors from categoryColors.js

2. **Category Management**:
   - **Ordered Categories**: Milonga, Practica, Festival, Workshop, DayWorkshop, Class, Trip, Virtual, Unknown
   - **Color Mapping**: Full color scheme defined in categoryColors.js
   - **Multi-select Logic**: Toggle behavior in usePostFilter hook

3. **Current Styling**:
   - Small buttons with 2px padding, 4px border radius
   - Background colors from categoryColors when active
   - Grey border when inactive, no border when active
   - Inline layout with ExpandMore/ExpandLess icons

4. **Integration Points**:
   - **SiteMenuBar.js**: PostFilter placed in center of menu bar (lines 72-77)
   - **usePostFilter.js**: Handles multi-select logic and filtering
   - **POST Filtering**: Client-side filtering without API calls

**Current Limitations:**
- Small button size may be hard to interact with on mobile
- Limited visual hierarchy (no "CATEGORIES" label)
- Cramped layout in menu bar
- Expand icon not clearly associated with categories

**Color Scheme Documentation:**
- **Milonga**: DodgerBlue
- **Practica**: Cyan  
- **Festival**: Red
- **Workshop**: HotPink
- **DayWorkshop**: PaleGreen
- **Class**: Yellow
- **Trip**: YellowGreen
- **Virtual**: Orange
- **Unknown**: LightGrey

## 🏛️ ARCHITECT (Required)
_User-approved decisions, technical recommendations, and rationale.  
Document all architectural notes and user approvals here._  
**Last updated:** 2025-05-30 16:00

**Enhanced Category Filter Design:**

1. **UI Transformation**:
   - Replace current inline buttons with "CATEGORIES" button
   - Expandable dropdown with card-style category items
   - Larger, more interactive elements with rounded backgrounds
   - Clear visual hierarchy and improved mobile experience

2. **Interaction Design**:
   - Single "CATEGORIES" button shows active filter count
   - Click to expand dropdown with all categories
   - Card-style elements with colored backgrounds
   - Multi-select with visual feedback for selected items
   - Click outside to collapse dropdown

3. **Technical Approach**:
   - Enhance existing PostFilter component
   - Maintain existing usePostFilter hook logic
   - Add dropdown positioning and animation
   - Improve responsive design for mobile
   - Preserve all existing color scheme and filtering

4. **Visual Design Elements**:
   - Card-style category items with rounded corners
   - Larger clickable areas for better mobile UX
   - Active state with full background color
   - Inactive state with border and transparent background
   - Smooth expand/collapse animations

## 🛠️ BUILDER (Required)
_Implementation details, blockers, and technical choices.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-05-30 16:00

- Pending implementation

---

## Summary
Transform the category filter in the menu bar from a cramped inline button layout to an expandable "CATEGORIES" dropdown with card-style, colored category selections for improved user experience and mobile interaction.

## Motivation
The current category filter has several UX limitations:
- Small buttons are difficult to interact with on mobile devices
- Cramped layout in menu bar reduces usability
- No clear label indicating these are category filters
- Limited visual hierarchy and discoverability

An expandable dropdown with card-style elements will:
- Improve mobile interaction with larger touch targets
- Provide clearer visual hierarchy with "CATEGORIES" label
- Maintain existing multi-select functionality
- Enhance overall user experience with better visual design

## Scope

**In-Scope:**
- Transform PostFilter component to expandable dropdown design
- Implement "CATEGORIES" button with active filter count
- Create card-style category elements with rounded backgrounds
- Maintain existing color scheme and multi-select functionality
- Preserve POST filtering logic (no API changes)
- Improve mobile responsiveness and touch targets
- Add smooth animations for expand/collapse

**Out-of-Scope:**
- Changes to underlying filtering logic or API calls
- New category types or color modifications
- Changes to usePostFilter hook logic
- Integration with other filter types (organizer, venue)

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | Expandable dropdown with "CATEGORIES" button and card-style selections |
| Interaction| Multi-select categories with visual feedback and active count display |
| Mobile     | Improved touch targets and responsive dropdown positioning |
| Filtering  | Maintains existing POST filter functionality with instant results |

## Tasks
| Status         | Task                                | Last Updated  |
|----------------|-------------------------------------|---------------|
| ✅ Complete   | Scout current PostFilter implementation | 2025-05-30 |
| ⏳ Pending    | Create Feature_3016 documentation  | |
| ⏳ Pending    | Design expandable dropdown interface | |
| ⏳ Pending    | Implement CATEGORIES button        | |
| ⏳ Pending    | Create card-style category elements | |
| ⏳ Pending    | Add dropdown positioning and animation | |
| ⏳ Pending    | Test mobile responsiveness          | |
| ⏳ Pending    | Verify filtering functionality      | |

## Rollback Plan
If issues arise:
- Revert to original PostFilter component
- Restore inline button layout  
- Remove dropdown positioning logic
- No data migration or API changes required

## Dependencies
- Existing PostFilter component and usePostFilter hook
- MUI components for dropdown and animations
- categoryColors.js for color scheme
- SiteMenuBar layout integration

## Linked Issues / Docs
- Related to overall TangoTiempo UX improvement initiative
- Mobile usability enhancement project

## Owner
AI Guild - Scout and Builder role implementation

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-05-30 |
| First Dev | TBD        |
| Review    | TBD        |
| Completed | TBD        |

---

## Git Integration

Feature branch: `feature/3016-expandable-category-filter`
- Transform PostFilter to expandable dropdown
- Implement card-style category selections
- Enhance mobile user experience
- Maintain existing filtering functionality