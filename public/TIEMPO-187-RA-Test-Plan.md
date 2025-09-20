# TIEMPO-187: Regional Admin Event Editing Test Plan

## Overview
This test plan validates that Regional Admins (RA) can only edit events within their assigned cities, preventing unauthorized access to events in other cities.

## Test Environment Setup

### Prerequisites
1. **Test Users Required:**
   - `ra-boston@test.com` - Regional Admin with access to Boston only
   - `ra-newyork@test.com` - Regional Admin with access to New York only
   - `ra-multi@test.com` - Regional Admin with access to Boston AND New York
   - `ro-test@test.com` - Regional Organizer (control group)

2. **Test Events Required:**
   - Event A: "Boston Milonga" - Located in Boston (masteredCityId: Boston)
   - Event B: "NYC Tango Night" - Located in New York (masteredCityId: New York)
   - Event C: "Philadelphia Workshop" - Located in Philadelphia (no RA has access)

3. **Browser Requirements:**
   - Chrome DevTools open for console monitoring
   - Network tab available for API call inspection

## Test Cases

### Test Case 1: RA Cannot See Edit Button for Out-of-City Events
**Objective:** Verify ViewEventDetailModal correctly hides Edit button for events outside RA's cities

**Steps:**
1. Login as `ra-boston@test.com`
2. Navigate to Calendar page
3. Click on "NYC Tango Night" event (New York event)
4. Observe ViewEventDetailModal

**Expected Results:**
- [ ] Edit button is NOT visible
- [ ] Delete button is NOT visible
- [ ] Console shows: `isRegionalAdmin: false` in RA Permission Debug
- [ ] Modal shows text: "New York - not in your assigned cities"

**Actual Results:** _________________

---

### Test Case 2: RA Can See Edit Button for In-City Events
**Objective:** Verify ViewEventDetailModal shows Edit button for events in RA's cities

**Steps:**
1. Login as `ra-boston@test.com`
2. Navigate to Calendar page
3. Click on "Boston Milonga" event
4. Observe ViewEventDetailModal

**Expected Results:**
- [ ] Edit button IS visible
- [ ] Delete button IS visible
- [ ] Console shows: `isRegionalAdmin: true` in RA Permission Debug
- [ ] Console shows: `eventVenueMasteredCityID` matches Boston's ID

**Actual Results:** _________________

---

### Test Case 3: Direct API Bypass Test - Edit Modal Security
**Objective:** Verify CreateEventDetailModal blocks editing even if accessed directly

**Steps:**
1. Login as `ra-boston@test.com`
2. Open Chrome DevTools Console
3. Get NYC event ID from a previous test
4. Execute in console:
   ```javascript
   // Attempt to directly open edit modal for NYC event
   window.dispatchEvent(new CustomEvent('openEditModal', { 
     detail: { eventId: 'NYC_EVENT_ID_HERE' } 
   }));
   ```
5. If modal opens, observe the UI

**Expected Results:**
- [ ] Error alert shows: "You do not have permission to edit events in this city"
- [ ] Form fields are cleared/reset
- [ ] Save button is disabled
- [ ] Console shows RA Edit Validation with `hasAccess: false`

**Actual Results:** _________________

---

### Test Case 4: Network Intercept Test - Backend Validation
**Objective:** Verify backend rejects unauthorized edit attempts

**Steps:**
1. Login as `ra-boston@test.com`
2. Open Network tab in DevTools
3. Attempt Test Case 3 (direct modal access)
4. If form loads, fill in data and click Save
5. Observe network request to `/api/events/ra/{eventId}`

**Expected Results:**
- [ ] API returns 403 Forbidden
- [ ] Response includes error: "Unauthorized: Event city not in your allowed cities"
- [ ] No database changes occur

**Actual Results:** _________________

---

### Test Case 5: Multi-City RA Access Test
**Objective:** Verify RA with multiple cities can edit events in all assigned cities

**Steps:**
1. Login as `ra-multi@test.com` (has Boston AND New York)
2. Test editing "Boston Milonga" - should succeed
3. Test editing "NYC Tango Night" - should succeed
4. Test editing "Philadelphia Workshop" - should fail

**Expected Results:**
- [ ] Boston event: Edit button visible, editing succeeds
- [ ] NYC event: Edit button visible, editing succeeds
- [ ] Philadelphia event: Edit button NOT visible, cannot edit

**Actual Results:** _________________

---

### Test Case 6: Race Condition Test
**Objective:** Test the scenario mentioned in the JIRA ticket

**Steps:**
1. Login as `ra-boston@test.com`
2. Open two browser tabs
3. Tab 1: Navigate to "Boston Milonga" (allowed)
4. Tab 2: Navigate to "NYC Tango Night" (not allowed)
5. Tab 1: Click Edit (modal should open)
6. Tab 2: Quickly click where Edit button would be (use DevTools to remove display:none if needed)

**Expected Results:**
- [ ] Tab 1: Edit modal opens successfully for Boston event
- [ ] Tab 2: Either no button click registers OR error message appears
- [ ] No cross-contamination between tabs

**Actual Results:** _________________

---

## Console Validation Points

During each test, monitor console for these key validation messages:

```javascript
// In ViewEventDetailModal
RA Permission Debug: {
  selectedRole: 'RegionalAdmin',
  raAllowedCities: ['CITY_ID_1', 'CITY_ID_2'],
  eventVenueMasteredCityID: 'EVENT_CITY_ID',
  isIncluded: true/false,
  isRegionalAdmin: true/false
}

// In CreateEventDetailModal
RA Edit Validation: {
  selectedRole: 'RegionalAdmin',
  raAllowedCities: [...],
  eventCityId: 'EXTRACTED_CITY_ID',
  hasAccess: true/false
}
```

## API Response Validation

Monitor these API endpoints:

1. **GET /api/events/id/{eventId}**
   - Should return full event data including masteredCityId

2. **PUT /api/events/ra/{eventId}**
   - Should validate allowedAdminMasteredCityIds
   - Should return 403 if city not in allowed list

## Regression Testing

After fix is implemented:
1. Re-run all test cases
2. Verify RO (Regional Organizer) functionality unchanged
3. Test event creation by RA (should only allow in their cities)
4. Test event deletion by RA (same city restrictions)

## Test Execution Log

| Test Case | Tester | Date | Pass/Fail | Notes |
|-----------|---------|------|-----------|-------|
| TC-1 | | | | |
| TC-2 | | | | |
| TC-3 | | | | |
| TC-4 | | | | |
| TC-5 | | | | |
| TC-6 | | | | |

## Known Issues to Watch For

1. **Field Name Inconsistency:** Backend may return city ID in different fields:
   - `masteredCityId`
   - `masteredCityId._id` (if populated)
   - `venueMasteredCityID`
   - `venueMasteredCityId`

2. **Timing Issues:** Validation in useEffect may have race conditions

3. **Token Expiry:** Ensure fresh auth tokens during testing

## Success Criteria

- [ ] All test cases pass
- [ ] No console errors during normal operation
- [ ] Backend properly validates all RA requests
- [ ] UI provides clear feedback for unauthorized attempts
- [ ] No regression in RO functionality