# TIEMPO-219: Automated Organizer Application Workflow

## Overview
This document tracks the implementation of the automated organizer application workflow with ROE acceptance and auto-approval functionality.

**Branch**: `feature/TIEMPO-219-organizer-workflow`  
**Backend API**: https://calendarbe-test-bpg5caaqg5chbndu.eastus-01.azurewebsites.net/api-docs

## Design Decisions

### 1. Data Architecture
- **Two Collections Strategy**: 
  - `userLogins`: Manages account-level settings (ROE approval, enabled status, allowed cities)
  - `organizers`: Manages public profile information (name, description, address, etc.)
  - Each tab in the Regional Organizer Settings modal is responsible for one collection only

### 2. Regional Organizer Application Flow
1. User clicks "Apply" button in YourStatusTab
2. ROE modal appears with Argentine Tango specific rules
3. Upon acceptance, user is auto-approved and organizer record is created
4. User is directed to complete their profile in Organizer Settings

### 3. Tab Organization in Regional Organizer Settings
- **Status Tab** (First/Default): Profile requirements checklist and enable toggle
- **Settings Tab**: Account settings and city selection
- **Name Tab**: Public profile information
- **Address Tab**: Location information
- **Types Tab**: Event type preferences
- **Delegated Tab**: Delegation management
- **Profile Images Tab**: Image management
- *Removed*: Images tab (redundant with Profile Images)

## Implementation Status

### ✅ Completed Features

#### Apply Button Fix (2025-01-05)
- Fixed useRoles hook to properly parse API response
- Changed from `response.data` to `response.data.roles || response.data || []`
- Resolved issue where Apply button was disabled for users who deleted records

#### ROE Modal Enhancement
- Updated with Argentine Tango specific rules
- Added auto-approval logic upon acceptance
- Creates organizer record automatically

#### Profile Status Tab
- Profile completeness checklist showing:
  - Rules of Engagement accepted
  - Organizer name (min 7 chars, not "New Organizer")
  - Short name (3-9 chars)
  - Description
  - At least one city selected
- Enable/disable toggle (only active when all requirements met)
- Moved from separate card to integrated in requirements section
- Shows app restart warning when enabling profile

#### Settings Tab
- **Private Information** (Read-only):
  - Email address
  - Firebase User ID
  - Organizer ID
  - Approval Date
- **System Status** (Read-only):
  - ROE Approved status
  - Account Active status
- **Editable Settings**:
  - City selection dropdown (multi-select, max 4 cities)
  - Saves to `userLogins.regionalOrganizerInfo.allowedMasteredCityIds`

#### City API Integration
- Fixed endpoint from `/api/mastered-cities` to `/api/masteredLocations/cities`
- Updated response parsing to handle correct data structure
- Cities determine which venues can be selected when creating events

### 🐛 Current Issues

#### City Dropdown Display Format
**Issue**: Cities showing as "- Boston, - Portland" instead of "MA - Boston, OR - Portland"  
**Root Cause**: Cities API doesn't include state abbreviations  
**Status**: Implementing hierarchical display solution  
**Fix Applied**: Updated API endpoint to correct `/api/masteredLocations/cities` (2025-01-05)  
**New Solution**: Display as "Country - Region - Division - City" with active/inactive filter (2025-01-05)

## Technical Implementation Details

### Key Components Modified
1. `UserSettingsApply.js` - Apply button and ROE flow
2. `RegionalOrganizersModal.js` - Tab organization and state management
3. `RegionalOrganizersStatus.js` - Profile status and requirements
4. `RegionalOrganizersSettings.js` - Account settings and city selection
5. `useRoles.js` - Fixed API response parsing
6. `useMasteredCities.js` - Custom hook for city data

### State Management Strategy
- Each tab maintains its own state
- Save operations are independent per tab
- No cross-tab state preservation (by design)
- Switching tabs without saving will lose changes

### API Endpoints Used
- `GET /api/roles` - Fetch user roles
- `GET /api/masteredLocations/cities` - Fetch available cities
- `PUT /api/userLogins/:id` - Update user account settings
- `PUT /api/organizers/:id` - Update organizer profile

## Testing Checklist
- [ ] New user can see enabled Apply button
- [ ] ROE modal appears and accepts terms
- [ ] Organizer record is created automatically
- [ ] Profile Status tab shows all requirements
- [ ] Enable toggle only activates when requirements met
- [ ] Settings tab saves city selections
- [ ] City dropdown shows proper "State - City" format
- [ ] App restart after enabling shows organizer features

## Next Steps
1. ~~Fix city dropdown state abbreviation display~~ Implemented hierarchical display
2. Reorganize tabs based on new requirements (2025-01-05)
3. Test complete workflow with fresh user account
4. Verify venue selection respects selected cities

### Tab Reorganization (Completed 2025-01-05)

#### ✅ Completed Changes
1. **Status Tab** - Now a read-only dashboard
   - ✅ Moved account information from Settings (email, Firebase ID, organizer ID, approval date)
   - ✅ Shows all mandatory requirements checklist
   - ✅ Keeps enable/disable toggle for organizer profile
   - ✅ Added optional status indicators section showing:
     - Delegated organizers count
     - Profile image status
     - Search engine visibility
     - Profile visibility
     - Address completeness

2. **Settings Tab** - Now control center for all editable items
   - ✅ Removed Private Information section (moved to Status)
   - ✅ Removed System Status section (moved to Status)
   - ✅ City selection with active/inactive toggle (existing)
   - ✅ Profile Visible toggle (controls organizers.isVisible)
   - ✅ Search Engine Visible toggle (controls organizers.wantRender)
   - ✅ Delegated organizers management (moved from Delegated tab)
     - View current delegates with remove option
     - Add new delegates from dropdown

3. **Apply Button Enhancement**
   - ✅ Set `regionalOrganizerInfo.isEnabled = true` (for future AI control)
   - ✅ Keeps existing `isApproved = true` logic

#### ✅ Additional Completed Changes
1. **Profile Tab** - Merged Name and Address tabs
   - ✅ Combined all name fields (full name, short name, description, URL)
   - ✅ Combined all address fields (phone, email, street, city, state, zip)
   - ✅ Removed crawlable toggle (already moved to Settings)
   - ✅ Organized into two sections: "Organizer Identity" and "Contact Information"
   - ✅ Single save button for all profile information

2. **Removed Tabs**
   - ✅ Delegated tab (functionality moved to Settings)
   - ✅ Name tab (merged into Profile)
   - ✅ Address tab (merged into Profile)

#### Final Tab Order
1. Status (read-only dashboard) ✅
2. Settings (all controls) ✅
3. Profile (merged Name & Address) ✅
4. Types ✅
5. Profile Images ✅

### City Display Hierarchical Solution (2025-01-05)

#### Design Decision
Instead of just showing "State - City", implement full hierarchical display:
- Format: `Country - Region - Division - City`
- Example: `US - Northeast - New England - Boston`
- Add active/inactive toggle to show all cities or just active ones

#### Implementation Plan
1. **Data Fetching**:
   - Fetch countries, regions, divisions, and cities in parallel
   - Build lookup maps for efficient hierarchy building
   - Support filtering by active status

2. **Display Enhancement**:
   - Transform city objects to include `displayName` with full hierarchy
   - Sort alphabetically by display name
   - Show in dropdown with proper formatting

3. **UI Updates**:
   - Add toggle switch: "Show inactive cities"
   - Pass active filter to API calls
   - Update dropdown to show hierarchical names

#### API Endpoints Used
- GET `/api/masteredLocations/countries?appId=1`
- GET `/api/masteredLocations/regions?appId=1`
- GET `/api/masteredLocations/divisions?appId=1`
- GET `/api/masteredLocations/cities?appId=1`

#### Benefits
- Better geographic context for users
- Clear organization hierarchy
- Ability to see inactive cities for future planning
- No backend changes required

## Notes
- JIRA integration is currently experiencing issues, using this document for tracking
- All changes are being made in `feature/TIEMPO-219-organizer-workflow` branch
- Backend is on TEST environment