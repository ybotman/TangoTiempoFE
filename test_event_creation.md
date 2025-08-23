# Event Creation Test Results

## Test Venues

### Active Venues (isActive=true)
1. **EPIC. Q-BALLROOM** - shortName: EPIC, isActive: true
2. **Allston Abbey** - shortName: ALLSTN-ABBY, isActive: true  
3. **Dance Union** - shortName: MISSING, isActive: true

### Inactive Venues (isActive=false)
1. **(Maine) Maine Ballroom Dance** - shortName: MISSING, isActive: false, isApproved: undefined
2. **(Maine) Metta Studio 40** - shortName: MISSING, isActive: false, isApproved: undefined
3. **(Maine) Portland New Church** - shortName: MISSING, isActive: false, isApproved: undefined

## Test Instructions
1. Open http://localhost:3001 in browser
2. Login as Regional Organizer
3. Open Create Event modal
4. Try creating events with each venue above
5. Monitor Network tab for POST /api/events requests
6. Record which succeed and which fail with 400 errors

## Results
(To be filled in during testing)

### Test 1: EPIC. Q-BALLROOM
- Status: 
- Payload sent:
- Error message (if any):

### Test 2: Dance Union (active but no shortName)
- Status:
- Payload sent:
- Error message (if any):

### Test 3: (Maine) Maine Ballroom Dance (inactive, no shortName)
- Status:
- Payload sent:
- Error message (if any):