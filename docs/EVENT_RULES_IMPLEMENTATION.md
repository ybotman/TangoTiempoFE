# Event Rules Implementation Design
## Two-Step Validation Architecture

---

## STEP 1: Client-Side Validation (Immediate)
*Implemented in CreateEventDetailsBasic.js and event forms*

### What Can Be Validated Immediately:

#### 1. Required Fields
```javascript
// Check on form submit
const requiredFields = {
  startDate: 'Start date is required',
  endDate: 'End date is required',
  ownerOrganizerID: 'Organizer is required',
  categoryFirst: 'At least one category is required',
  venueId: 'Venue is required',
  description: 'Description is required',
  title: 'Title is required',
  shortTitle: 'Short title is required'
};
```

#### 2. Category Exclusivity (Dynamic Dropdowns)
```javascript
// When user selects primary category
onCategoryFirstChange(category) {
  const longEvents = ['FESTIVAL', 'MARATHON', 'ENCUENTRO', 'WORKSHOP', 'RETREAT'];
  const shortEvents = ['MILONGA', 'PRACTICA', 'CLASS'];
  
  if (category === 'MILONGA') {
    // Disable PRACTICA in secondary/tertiary
    secondaryOptions = secondaryOptions.filter(c => c !== 'PRACTICA');
  }
  
  if (category === 'PRACTICA') {
    // Disable MILONGA in secondary/tertiary
    secondaryOptions = secondaryOptions.filter(c => c !== 'MILONGA');
  }
  
  if (longEvents.includes(category)) {
    // Only allow CLASS, MILONGA, PRACTICA as secondary
    // No long events allowed in secondary/tertiary
    secondaryOptions = ['CLASS', 'MILONGA', 'PRACTICA'];
    // BUT still respect Milonga/Practica exclusivity
    if (secondaryCategory === 'MILONGA') {
      tertiaryOptions = ['CLASS']; // No PRACTICA
    }
  }
}
```

#### 3. Duration Validation (Real-time)
```javascript
// When dates change
onDateChange() {
  const duration = endDate - startDate;
  const category = categoryFirst;
  
  // Minimum 30 minutes
  if (duration < 30 * MINUTES) {
    showError('Events must be at least 30 minutes');
    disableSave();
  }
  
  // Short events max 5 hours
  if (['MILONGA', 'PRACTICA', 'CLASS'].includes(category)) {
    if (duration > 5 * HOURS) {
      showError(`${category} cannot exceed 5 hours`);
      disableSave();
    }
  }
  
  // Long events 1-9 days
  if (['FESTIVAL', 'MARATHON', etc].includes(category)) {
    if (duration < 1 * DAY) {
      showError(`${category} must be at least 1 day`);
      disableSave();
    }
    if (duration > 9 * DAYS) {
      showError(`${category} cannot exceed 9 days`);
      disableSave();
    }
  }
}
```

#### 4. UI Behavior Changes
```javascript
// Smart dropdown filtering
const getCategoryOptions = (position) => {
  const longEvents = ['FESTIVAL', 'MARATHON', 'ENCUENTRO', 'WORKSHOP', 'RETREAT'];
  
  if (position === 'secondary' || position === 'tertiary') {
    // Long events NEVER allowed in secondary/tertiary
    return options.filter(opt => !longEvents.includes(opt));
  }
  
  // Apply exclusivity rules
  if (categoryFirst === 'MILONGA' || categorySecond === 'MILONGA') {
    return options.filter(opt => opt !== 'PRACTICA');
  }
  
  if (categoryFirst === 'PRACTICA' || categorySecond === 'PRACTICA') {
    return options.filter(opt => opt !== 'MILONGA');
  }
  
  return options;
};
```

---

## STEP 2: Server-Side Validation (On POST/PUT)
*Implemented in API endpoints - requires database check*

### What Must Be Checked Server-Side:

#### 1. Overlap Detection
```javascript
async function validateOverlaps(eventData) {
  // Get organizer's existing events in date range
  const existingEvents = await Event.find({
    ownerOrganizerID: eventData.ownerOrganizerID,
    _id: { $ne: eventData._id }, // Exclude self if updating
    $or: [
      {
        startDate: {
          $lt: eventData.endDate,
          $gte: eventData.startDate
        }
      },
      {
        endDate: {
          $gt: eventData.startDate,
          $lte: eventData.endDate
        }
      },
      {
        startDate: { $lte: eventData.startDate },
        endDate: { $gte: eventData.endDate }
      }
    ]
  });
  
  for (const existing of existingEvents) {
    // Check for Milonga overlaps
    if (hasCategory(eventData, 'MILONGA') && hasCategory(existing, 'MILONGA')) {
      throw new ValidationError('Cannot have overlapping Milongas');
    }
    
    // Check for Practica overlaps
    if (hasCategory(eventData, 'PRACTICA') && hasCategory(existing, 'PRACTICA')) {
      throw new ValidationError('Cannot have overlapping Practicas');
    }
    
    // Check for Milonga-Practica conflict
    if ((hasCategory(eventData, 'MILONGA') && hasCategory(existing, 'PRACTICA')) ||
        (hasCategory(eventData, 'PRACTICA') && hasCategory(existing, 'MILONGA'))) {
      throw new ValidationError('Cannot have overlapping Milonga and Practica');
    }
    
    // Classes can overlap - just log for info
    if (hasCategory(eventData, 'CLASS') || hasCategory(existing, 'CLASS')) {
      console.log(`Info: Class overlap with ${existing.title} (allowed)`);
    }
  }
}
```

#### 2. Complete Validation Pipeline
```javascript
// POST /api/events
async function createEvent(req, res) {
  const eventData = req.body;
  
  try {
    // Step 1: Basic validation (could also be done client-side)
    validateRequiredFields(eventData);
    validateDuration(eventData);
    validateCategories(eventData);
    
    // Step 2: Database-dependent validation
    await validateOverlaps(eventData);
    
    // Step 3: Save if all valid
    const event = await Event.create(eventData);
    
    res.json({
      success: true,
      event
    });
    
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
        field: error.field
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
}
```

#### 3. PUT (Update) Considerations
```javascript
// PUT /api/events/:id
async function updateEvent(req, res) {
  const eventId = req.params.id;
  const updates = req.body;
  
  // IMPORTANT: Exclude self from overlap check
  const existingEvents = await Event.find({
    ownerOrganizerID: updates.ownerOrganizerID,
    _id: { $ne: eventId }, // Exclude the event being updated
    // ... date overlap query
  });
  
  // Validate and update
}
```

---

## Implementation Priority

### Phase 1: Client-Side (Immediate Impact)
1. ✅ Required fields validation
2. ✅ Duration min/max based on category
3. ✅ Smart category dropdowns (exclusivity)
4. ✅ Real-time validation feedback
5. ✅ "Verify Rules" button

### Phase 2: Server-Side (Data Integrity)
1. ✅ Overlap detection for same organizer
2. ✅ Milonga/Practica conflict check
3. ✅ Comprehensive validation on POST
4. ✅ Proper handling for PUT (updates)
5. ✅ Clear error messages back to client

---

## Error Response Format
```javascript
{
  "success": false,
  "errors": [
    {
      "field": "categories",
      "rule": "OVERLAP_MILONGA",
      "message": "You have another Milonga at this time (Afternoon Milonga)",
      "severity": "BLOCK"
    }
  ]
}
```

---

## Testing Scenarios

### Client-Side Tests:
- Select MILONGA → PRACTICA should disappear from options
- Select FESTIVAL as primary → Secondary shouldn't show long events
- Set duration to 20 minutes → Should show error
- Set MILONGA to 6 hours → Should show error

### Server-Side Tests:
- Create MILONGA 8-11pm, try to create another 9-10pm → Should fail
- Create PRACTICA 3-5pm, try to create MILONGA 4-6pm → Should fail
- Create CLASS 7-8pm, create MILONGA 7-10pm → Should succeed
- Update existing event to overlap → Should fail

---

*This design separates concerns: immediate UX feedback on client, data integrity on server*