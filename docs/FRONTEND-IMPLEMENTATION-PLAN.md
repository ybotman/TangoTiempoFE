# Frontend Implementation Plan (REVISED)
**Date:** September 23, 2025
**Purpose:** Fix organizer profile validation + Handle unique shortName requirements

---

## FINAL ALIGNED BACKEND REQUIREMENTS:
1. **shortName remains REQUIRED in schema** - Not made optional
2. **shortName must be GLOBALLY UNIQUE** - Across all 5,000-10,000 organizers
3. **Partial updates still work** - PUT with `$set` only validates changed fields
4. **Backend returns 409 Conflict** if shortName already exists
5. **"CHANGE" is reserved** - Cannot be used as shortName
6. **New endpoint available**: `GET /api/organizers/check-shortname/:shortName`

## KEY INSIGHT:
- `required: true` in Mongoose schema doesn't break partial updates
- PUT requests using `$set` only validate fields being changed
- Frontend doesn't need to send shortName for other field updates

---

## 1. IMMEDIATE FIX - CreateEventDetailModal.js

### Location: `src/app/components/Modals/CreateEvents/CreateEventDetailModal.js`

### Current Broken Code (Lines 512-535):
```javascript
const orgInfo = user.backendInfo.regionalOrganizerInfo;

// BROKEN - Expects fields that don't exist
const hasCompletedProfile = orgInfo.shortName &&
                           orgInfo.shortName.trim() !== '' &&
                           orgInfo.description &&
                           orgInfo.description.trim() !== '' &&
                           orgInfo.isEnabled === true;
```

### New Implementation - Option 2 (Fetch Organizer):
```javascript
// Add to imports
import { useOrganizers } from '@/hooks/useOrganizers';

// Inside component
const { fetchOrganizerById } = useOrganizers();

// Replace validation logic (Lines 512-535)
const orgInfo = user.backendInfo.regionalOrganizerInfo;

// Fetch actual organizer data for validation
let hasCompletedProfile = false;
let missingFields = [];

if (orgInfo?.organizerId) {
  try {
    const organizer = await fetchOrganizerById(orgInfo.organizerId);

    // Check profile completion
    const hasValidShortName = organizer?.shortName &&
                             organizer.shortName.trim() !== '' &&
                             organizer.shortName !== 'CHANGE';
    const hasValidDescription = organizer?.description &&
                               organizer.description.trim() !== '';

    hasCompletedProfile = orgInfo.isEnabled &&
                         hasValidShortName &&
                         hasValidDescription;

    if (!hasCompletedProfile) {
      // Build specific error messages
      if (!orgInfo.isEnabled) {
        missingFields.push('Profile not enabled by admin');
      }
      if (!hasValidShortName) {
        missingFields.push('Short Name (or still set to "CHANGE")');
      }
      if (!hasValidDescription) {
        missingFields.push('Description');
      }
    }
  } catch (error) {
    console.error('Failed to fetch organizer profile:', error);
    throw new Error('Unable to verify organizer profile. Please try again.');
  }
} else {
  throw new Error('No organizer profile found. Please contact an administrator.');
}

if (!hasCompletedProfile) {
  throw new Error(`Your organizer profile is incomplete. Please complete the following in Event Organizer Settings: ${missingFields.join(', ')}`);
}
```

---

## 2. ENHANCED VALIDATION RULES

### Profile Completion Requirements:
1. **shortName**:
   - Must exist
   - Must not be empty string
   - Must not be "CHANGE" (default value)
   - Length: 3-9 characters
   - No "TANGO" in name

2. **description**:
   - Must exist
   - Must not be empty string
   - Minimum length: 10 characters (reasonable description)

3. **isEnabled**:
   - Must be true (admin approved)

---

## 3. PERFORMANCE OPTIMIZATION

### Add Caching (Optional Enhancement):
```javascript
// Store fetched organizer in state to avoid refetch
const [cachedOrganizer, setCachedOrganizer] = useState(null);

// Check cache first
if (cachedOrganizer?._id === orgInfo.organizerId) {
  // Use cached data
} else {
  // Fetch and cache
  const organizer = await fetchOrganizerById(orgInfo.organizerId);
  setCachedOrganizer(organizer);
}
```

---

## 4. USER EXPERIENCE IMPROVEMENTS

### Add Loading State:
```javascript
const [isValidatingProfile, setIsValidatingProfile] = useState(false);

// During validation
setIsValidatingProfile(true);
try {
  // ... validation logic
} finally {
  setIsValidatingProfile(false);
}

// Show loading indicator
{isValidatingProfile && <CircularProgress size={20} />}
```

### Better Error Messages:
```javascript
// Provide actionable guidance
if (organizer?.shortName === 'CHANGE') {
  throw new Error(
    'Your profile still has the default "CHANGE" name. ' +
    'Please go to Event Organizer Settings > Profile tab and set your Short Name.'
  );
}
```

---

## 5. TESTING SCENARIOS

### Test Cases:
1. **User with complete profile** (Tango Affair)
   - shortName: "AFFAIR" ✓
   - description: Present ✓
   - isEnabled: true ✓
   - Should: Allow event creation/editing

2. **User with default shortName**
   - shortName: "CHANGE" ✗
   - Should: Show specific error about default name

3. **User with missing description**
   - shortName: Valid ✓
   - description: Empty ✗
   - Should: Show specific error about missing description

4. **User not enabled by admin**
   - isEnabled: false ✗
   - Should: Show admin approval needed message

---

## 6. COORDINATION WITH BACKEND

### Dependencies:
1. Backend makes `shortName` optional in schema ✓
2. Backend keeps validation logic for profile updates
3. No new endpoints needed (using existing `fetchOrganizerById`)

### API Calls:
```javascript
// Existing endpoint we'll use
GET /api/organizers/:organizerId
Response: {
  _id: "...",
  shortName: "AFFAIR",
  description: "Full description...",
  fullName: "...",
  isEnabled: true,
  ...
}
```

---

## 7. ROLLBACK PLAN

If issues arise, quick rollback to Option 3 (compound check):
```javascript
// Emergency fallback - just check all flags
const hasCompletedProfile =
  orgInfo.isEnabled === true &&
  orgInfo.isApproved === true &&
  orgInfo.isActive === true;
```

---

## 8. HANDLE UNIQUENESS IN RegionalOrganizersProfile.js

### Add Uniqueness Validation:
```javascript
// In RegionalOrganizersProfile.js handleSave function

const handleSave = async () => {
  try {
    // Validate shortName before saving
    if (shortName === 'CHANGE') {
      setErrorMessage('Cannot use "CHANGE" as Short Name - please choose another');
      return;
    }

    // Attempt to save
    const result = await updateOrganizer(organizerId, {
      shortName,
      description,
      fullName
    });

    setShowSuccessMessage(true);
  } catch (error) {
    // Handle 409 Conflict for duplicate shortName
    if (error.response?.status === 409) {
      setErrorMessage(
        `The Short Name "${shortName}" is already taken by another organizer. ` +
        `Please choose a unique name (will be used globally across 10,000+ organizers).`
      );
    } else {
      setErrorMessage(error.message || 'Failed to update profile');
    }
  }
};
```

### Add Real-time Availability Check (Enhancement):
```javascript
// Debounced check as user types
const checkShortNameAvailability = debounce(async (name) => {
  if (name && name !== currentShortName && name !== 'CHANGE') {
    try {
      const response = await axios.get(
        `/api/organizers/check-shortname/${name}`
      );
      if (!response.data.available) {
        setShortNameError('This name is already taken');
      }
    } catch (error) {
      console.error('Failed to check name availability');
    }
  }
}, 500);
```

---

## 9. DEPLOYMENT STEPS

1. **Test in Development**
   - Apply fix to CreateEventDetailModal.js
   - Test with various user profiles
   - Verify error messages are clear

2. **Deploy to TEST Branch**
   - Merge fix to TEST
   - Have Tango Affair user test

3. **Production Deployment**
   - After successful TEST validation
   - Monitor for any validation errors

---

## 9. FUTURE ENHANCEMENTS

1. **Add Profile Completeness Indicator**
   - Show progress bar in RegionalOrganizersModal
   - Visual feedback on what's missing

2. **Pre-fetch Optimization**
   - Load organizer data with user login
   - Cache in AuthContext

3. **Automated Profile Completion**
   - Guide users through missing fields
   - Wizard-style interface

---

## FINAL AGREEMENT CHECKLIST

### Frontend Responsibilities:
- [x] Fetch organizer data for validation in CreateEventDetailModal
- [x] Check shortName !== 'CHANGE'
- [x] Validate description exists
- [x] Keep isEnabled check for admin approval
- [x] Handle 409 Conflict errors for duplicate shortNames
- [x] Provide clear, actionable error messages
- [x] Optional: Add real-time availability checking

### Backend Commitments:
- [x] shortName stays REQUIRED + adds UNIQUE constraint
- [x] Partial updates work (PUT with $set)
- [x] Return 409 on duplicate shortName attempts
- [x] Provide check-shortname endpoint
- [x] Auto-generate unique names for existing "CHANGE" entries
- [x] No data migration to userLogins needed

### Architecture Principles Maintained:
- [x] Single source of truth (organizers collection)
- [x] Clean separation (admin flags vs user data)
- [x] No data duplication
- [x] Scalable to 10,000+ organizers