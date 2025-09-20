# TIEMPO-219: Attribute Mapping Between Collections

## Overview
This document clarifies the dual-collection architecture and the role of each attribute in the Regional Organizer system.

## Collection Structure

### 1. userLogins Collection
**Purpose**: Account-level permissions and administrative control

#### regionalOrganizerInfo Attributes:
- **organizerId**: Reference to the organizer record
- **isApproved**: `true` = User has accepted Rules of Engagement (ROE)
  - Set to `true` when user accepts ROE in Apply modal
  - This is the "gate" to access organizer features
  - NOT about approving the organizer's events
- **isEnabled**: Currently not used (always `false`)
  - Originally intended for admin control
  - Functionality moved to organizers collection
- **isActive**: Currently not used (always `true`)
  - Reserved for future admin suspension capability
- **ApprovalDate**: Timestamp when ROE was accepted
- **allowedMasteredCityIds**: Cities where organizer can create venues/events
- **allowedMasteredDivisionIds**: Divisions for future geographic expansion

### 2. organizers Collection  
**Purpose**: Public profile and event management settings

#### Key Attributes:
- **isEnabled**: `true` = Organizer can create/manage events
  - User-controlled via Status tab
  - Requires all profile requirements met
  - This is what actually enables event creation
- **isActive**: Backend admin control (not user-editable)
  - Can be used to suspend organizers
- **wantRender**: `true` = Profile appears in search results
  - User-controlled via Name tab
- **isRendered**: Backend tracking (auto-managed)
- **isVisible**: Display control (default `true`)

## Current Implementation Flow

1. **User Applies** → ROE Modal appears
2. **Accept ROE** → Sets `userLogins.regionalOrganizerInfo.isApproved = true`
3. **Create Organizer** → New organizer record with `isEnabled = false`
4. **Complete Profile** → Fill in name, description, cities in Settings tabs
5. **Enable Profile** → Sets `organizers.isEnabled = true` in Status tab
6. **Create Events** → Now allowed because `organizers.isEnabled = true`

## Key Mappings in UI

### Status Tab (RegionalOrganizersStatus.js)
- **"Rules of Engagement Accepted"** → Reads from `userLogins.regionalOrganizerInfo.isApproved`
- **Enable Switch** → Controls `organizers.isEnabled`
- **City count** → From `userLogins.regionalOrganizerInfo.allowedMasteredCityIds`

### Settings Tab (RegionalOrganizersSettings.js)
- **ROE Approved** → Displays `userLogins.regionalOrganizerInfo.isApproved` (read-only)
- **Account Active** → Displays `userLogins.regionalOrganizerInfo.isActive` (read-only)
- **City Selection** → Manages `userLogins.regionalOrganizerInfo.allowedMasteredCityIds`

### Name Tab
- **Searchable toggle** → Controls `organizers.wantRender`

## Summary of Confusion Points

1. **Duplicate Fields**: Both collections have `isEnabled`, `isActive`, `isApproved`
   - Only `userLogins.regionalOrganizerInfo.isApproved` is actively used
   - Only `organizers.isEnabled` controls event creation
   - `isActive` reserved for future admin features

2. **Current Logic**:
   - ROE acceptance = `userLogins.regionalOrganizerInfo.isApproved = true`
   - Event creation ability = `organizers.isEnabled = true`
   - Search visibility = `organizers.wantRender = true`

3. **Unused Fields** (kept for future features):
   - `userLogins.regionalOrganizerInfo.isEnabled`
   - `userLogins.regionalOrganizerInfo.isActive`
   - `organizers.isActive` (admin-only)
   - `organizers.isApproved` (not in schema)

## Recommendations

1. **Keep Current Implementation**: The separation makes sense
   - userLogins = administrative/permission layer
   - organizers = public profile/feature layer

2. **Future Cleanup**: Consider removing unused fields in next major version

3. **Documentation**: This mapping should be added to code comments

## Tab Reorganization Implementation Plan (2025-01-05)

### Status Tab (Read-Only Dashboard)
**Purpose**: Complete overview of organizer status

**Sections**:
1. **Account Information** (moved from Settings)
   - Email, Firebase ID, Organizer ID
   - Approval Date
   - ROE Approved status
   - Account Active status

2. **Mandatory Requirements** (existing)
   - ROE Accepted
   - Name, Short Name, Description
   - At least one city selected

3. **Profile Enable Toggle** (existing)
   - Only enabled when all mandatory met

4. **Optional Status Indicators** (new)
   - Delegated Organizers: X delegates / None
   - Profile Image: Uploaded / Not uploaded
   - Crawlable: Yes / No
   - Visible: Yes / No
   - Address: Complete / Incomplete

### Settings Tab (All Controls)
**Purpose**: Central control for all editable settings

**Controls**:
1. **City Selection** (existing)
   - Multi-select dropdown
   - Active/inactive toggle

2. **Visibility Controls** (moved from other tabs)
   - Visible toggle (from organizers.isVisible)
   - Crawlable toggle (from organizers.wantRender)

3. **Delegated Organizers** (moved from Delegated tab)
   - Add/remove delegates
   - Search organizers functionality

### Name & Address Tab (Merged)
**Purpose**: Profile information in one place

**Fields**:
1. **Name Section**
   - Full Name
   - Short Name  
   - Description
   - URL

2. **Address Section**
   - Street 1 & 2
   - City, State, Zip
   - Phone, Email

### Removed/Modified
- **Delegated Tab**: Removed (moved to Settings)
- **Crawlable toggle**: Removed from Name tab (moved to Settings)

### Apply Button Update
Add to UserSettingsApply.js when creating organizer:
```javascript
regionalOrganizerInfo: {
  isApproved: true,  // ROE accepted
  isEnabled: true,   // NEW: For future AI control
  isActive: true,
  // ... rest
}
```