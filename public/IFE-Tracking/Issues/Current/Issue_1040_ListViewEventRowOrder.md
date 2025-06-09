# Issue 1040: List View Event Row Order

## Summary
Swap order of organizer short name and event title in List View first row

## Details
- **Current Order**: TimeBlock, CircleColorBlock, ShortTitle, OwnerOrganizerShortName
- **Required Order**: TimeBlock, CircleColorBlock, OwnerOrganizerShortName, ShortTitle
- **Scope**: List view event display rows

## Status
✅ **Fixed**

---

### 📋 Kanban
**Task**: Reorder event row elements in List View

### 🔍 Scout
**Location**: List view event row component/template

### 🏗️ Builder
**Implementation**: Swapped the order of organizerShort and eventShortTitle elements:
- Moved organizerShort block before eventShortTitle
- Location: src/app/calendar/page.js:228-253
- Maintains same styling for each element

---

## SNR
- **Summary**: Created Issue 1040 for List View event row reordering
- **Next Steps**: Update component layout order
- **Role**: Builder Mode