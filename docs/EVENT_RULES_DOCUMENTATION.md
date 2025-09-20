# Event Rules Validation System
## TangoTiempo Event Creation Guidelines

*Version 1.0 - TIEMPO-165 Implementation*

---

## 🎯 Overview

The Event Rules Validation System ensures data quality and prevents scheduling conflicts by enforcing business rules during event creation and updates. All events must pass validation before being saved to the database.

---

## 📝 Required Fields (Must Have ALL)

Every event MUST have these fields completed:

| Field | Description | Requirements |
|-------|-------------|--------------|
| **Start Date/Time** | When event begins | Valid date/time |
| **End Date/Time** | When event ends | Must be after start date |
| **Primary Organizer** | Who's hosting | Must be selected from list |
| **Primary Category** | Event type | At least one category required |
| **Venue** | Where it happens | Must select from venue list |
| **Description** | Event details | Cannot be empty |
| **Full Title** | Complete event name | Required text |
| **Short Title** | Display name | Maximum 15 characters |

---

## ⏱️ Duration Rules

### Universal Rule
**ALL events must be at least 30 minutes long**

### Short Events (Under 1 Day)

| Category | Minimum | Maximum |
|----------|---------|---------|
| **MILONGA** | 30 minutes | 5 hours |
| **PRACTICA** | 30 minutes | 5 hours |
| **CLASS** | 30 minutes | 5 hours |

### Long Events (Multi-Day)

| Category | Minimum | Maximum |
|----------|---------|---------|
| **FESTIVAL** | 24 hours (1 day) | 9 days |
| **MARATHON** | 24 hours (1 day) | 9 days |
| **ENCUENTRO** | 24 hours (1 day) | 9 days |
| **WORKSHOP** | 24 hours (1 day) | 9 days |
| **RETREAT** | 24 hours (1 day) | 9 days |

---

## 🚦 Category Combination Rules

### ✅ ALLOWED Combinations

#### Short Events (Single Category Only)
- **MILONGA** alone ✅
- **PRACTICA** alone ✅
- **CLASS** alone ✅
- **CLASS** + any other category ✅ (Classes can combine with anything)

#### Long Events (MUST be Primary + Optional Sub-events)
- **FESTIVAL** (primary) + **MILONGA** (secondary) ✅
- **FESTIVAL** (primary) + **PRACTICA** (secondary) ✅
- **FESTIVAL** (primary) + **CLASS** (secondary) ✅
- **MARATHON** (primary) + **MILONGA** (secondary) ✅
- **MARATHON** (primary) + **CLASS** (secondary) ✅
- *(Same pattern for ENCUENTRO, WORKSHOP, RETREAT)*

**⚠️ IMPORTANT**: Festival, Marathon, Encuentro, Workshop, and Retreat can ONLY be the PRIMARY category. They are NEVER allowed as secondary or tertiary categories.

### ❌ FORBIDDEN Combinations

#### Long Events in Wrong Position
- **MILONGA** (primary) + **FESTIVAL** (secondary) ❌ (Festival must be primary)
- **CLASS** (primary) + **MARATHON** (secondary) ❌ (Marathon must be primary)
- Any long event type as secondary/tertiary ❌

#### Cannot Mix in Same Event
- **MILONGA** + **PRACTICA** ❌ (Cannot be in same event)
- **FESTIVAL** + **MARATHON** ❌ (Cannot have two long event types)
- **ENCUENTRO** + **WORKSHOP** ❌ (Pick ONE long event type only)

#### Invalid Duration
- **MILONGA** lasting 8 hours ❌ (Exceeds 5-hour maximum)
- **FESTIVAL** lasting 6 hours ❌ (Must be at least 24 hours)
- Any event under 30 minutes ❌

---

## 🔄 Overlap Rules (Single Organizer)

### For a SINGLE organizer (same primary organizer):

| Scenario | Allowed? | Rule |
|----------|----------|------|
| Two **MILONGAS** at same time | ❌ NO | Cannot run overlapping milongas |
| Two **PRACTICAS** at same time | ❌ NO | Cannot run overlapping practicas |
| **MILONGA** + **PRACTICA** overlapping | ❌ NO | Cannot overlap these two types |
| **MILONGA** + **CLASS** overlapping | ✅ YES | Classes can overlap anything |
| **PRACTICA** + **CLASS** overlapping | ✅ YES | Classes can overlap anything |
| Two **CLASSES** at same time | ✅ YES | Multiple classes allowed |

### Different organizers:
- Can have any overlapping events (no restrictions between different organizers)

---

## 📊 Visual Examples

### ✅ VALID Event Configurations

```
Example 1: Simple Milonga
┌─────────────────────┐
│ MILONGA (3 hours)   │
│ 8:00 PM - 11:00 PM  │
│ Single Category     │
└─────────────────────┘

Example 2: Weekend Festival with Sub-events
┌─────────────────────────────────────┐
│ FESTIVAL (3 days)                   │
│ Friday 6pm - Sunday 11pm            │
│ Secondary: MILONGA                  │
│ (Festival includes evening milongas)│
└─────────────────────────────────────┘

Example 3: Overlapping Class and Milonga (Same Organizer)
     8:00 PM          9:00 PM          10:00 PM         11:00 PM
        │               │                │                │
CLASS   ├───────────────┤                │                │
        │               │                │                │
MILONGA │               ├────────────────┴────────────────┤
        │               │                                  │
        ✅ ALLOWED - Classes can overlap with anything
```

### ❌ INVALID Event Configurations

```
Example 1: Milonga + Practica in Same Event
┌─────────────────────┐
│ Primary: MILONGA    │
│ Secondary: PRACTICA │ ❌ Cannot combine these
└─────────────────────┘

Example 2: Short Event Too Long
┌─────────────────────────┐
│ PRACTICA (7 hours)      │ ❌ Exceeds 5-hour maximum
│ 6:00 PM - 1:00 AM       │
└─────────────────────────┘

Example 3: Overlapping Milonga and Practica (Same Organizer)
     8:00 PM          9:00 PM          10:00 PM         11:00 PM
        │               │                │                │
MILONGA ├───────────────┴────────────────┤                │
        │                                 │                │
PRACTICA│               ├─────────────────┴────────────────┤
        │               │                                   │
        ❌ FORBIDDEN - Same organizer cannot overlap Milonga & Practica

Example 4: Multiple Long Event Types
┌─────────────────────┐
│ Primary: FESTIVAL   │
│ Secondary: MARATHON │ ❌ Can only have ONE long event type
└─────────────────────┘
```

---

## 🔍 Validation Process Flow

```
Event Submission
      ↓
1. Required Fields Check
      ↓ (All present?)
2. Duration Validation
      ↓ (30min minimum, category limits)
3. Category Rules Check
      ↓ (Valid combinations?)
4. Overlap Detection
      ↓ (Check same organizer conflicts)
5. Save Event ✅
   OR
   Return Errors ❌
```

---

## 💬 Error Messages Users Will See

### Required Field Errors
- ❌ "Venue is required"
- ❌ "Short title is required (max 15 characters)"
- ❌ "At least one category must be selected"

### Duration Errors
- ❌ "All events must be at least 30 minutes long"
- ❌ "MILONGA events cannot exceed 5 hours"
- ❌ "FESTIVAL events must be at least 1 day long"

### Category Combination Errors
- ❌ "Cannot combine Milonga and Practica in the same event"
- ❌ "FESTIVAL must be the ONLY category (no secondary/tertiary)"
- ❌ "Cannot combine multiple long event types (Festival, Marathon, etc.)"

### Overlap Errors
- ❌ "Conflicts with existing [Event Name]: Milonga and Practica cannot overlap"
- ℹ️ "Overlaps with [Event Name] (Classes can overlap)" - Informational only

---

## 🎯 Quick Reference Decision Tree

```
Is your event less than 1 day?
├─ YES → Short Event Rules
│   ├─ Is it a MILONGA?
│   │   ├─ Keep under 5 hours
│   │   └─ Don't add PRACTICA
│   ├─ Is it a PRACTICA?
│   │   ├─ Keep under 5 hours
│   │   └─ Don't add MILONGA
│   └─ Is it a CLASS?
│       └─ Can combine with anything!
│
└─ NO → Long Event Rules (1+ days)
    ├─ Pick ONE: Festival, Marathon, Encuentro, Workshop, or Retreat
    ├─ Can add CLASS, MILONGA, or PRACTICA as sub-events
    └─ But MILONGA and PRACTICA still can't be together
```

---

## 🚀 Implementation Status

- ✅ Required fields validation
- ✅ Duration rules (30 min - 5 hours for short, 1+ day for long)
- ✅ Category combination rules
- ✅ Overlap detection for same organizer
- 🔄 Frontend "Verify Rules" button (in development)
- 🔄 Auto-correction suggestions (planned)

---

## 📞 Questions?

Contact the development team or refer to JIRA ticket **TIEMPO-165** for technical details.

*Last Updated: January 2024*