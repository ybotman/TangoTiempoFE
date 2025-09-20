# Event Rules Visual Guide
## Quick Reference for Valid/Invalid Event Configurations

---

## ✅ VALID EVENT EXAMPLES

### Short Events (Under 5 Hours)

```
✅ VALID: Solo Milonga (3 hours)
┌──────────────────────────────┐
│ Category: MILONGA            │
│ Duration: 3 hours            │
│ Time: 8:00 PM - 11:00 PM     │
└──────────────────────────────┘

✅ VALID: Afternoon Practica (2.5 hours)
┌──────────────────────────────┐
│ Category: PRACTICA           │
│ Duration: 2.5 hours          │
│ Time: 3:00 PM - 5:30 PM      │
└──────────────────────────────┘

✅ VALID: Morning Class (1.5 hours)
┌──────────────────────────────┐
│ Category: CLASS              │
│ Duration: 1.5 hours          │
│ Time: 10:00 AM - 11:30 AM    │
└──────────────────────────────┘

✅ VALID: Class with Milonga (Classes can combine)
┌──────────────────────────────┐
│ Primary: CLASS               │
│ Secondary: MILONGA           │
│ Duration: 4 hours            │
│ Note: Classes exempt from    │
│       exclusivity rules      │
└──────────────────────────────┘
```

### Long Events (1+ Days)

```
✅ VALID: Weekend Festival with Milongas
┌─────────────────────────────────────────┐
│ Primary Category: FESTIVAL              │
│ Secondary Category: MILONGA             │
│ Duration: 3 days                        │
│ Friday 6pm - Sunday 11pm                │
│                                         │
│ Interpretation: A festival that        │
│ includes evening milongas              │
└─────────────────────────────────────────┘

✅ VALID: Marathon with Classes
┌─────────────────────────────────────────┐
│ Primary Category: MARATHON              │
│ Secondary Category: CLASS               │
│ Duration: 2 days                        │
│ Saturday 10am - Sunday 10pm             │
│                                         │
│ Interpretation: Marathon that includes  │
│ workshop classes                        │
└─────────────────────────────────────────┘

✅ VALID: Pure Encuentro
┌─────────────────────────────────────────┐
│ Primary Category: ENCUENTRO             │
│ Secondary Category: (none)              │
│ Tertiary Category: (none)               │
│ Duration: 2.5 days                      │
│                                         │
│ Note: Long events don't require        │
│       secondary categories              │
└─────────────────────────────────────────┘
```

### Valid Overlaps (Same Organizer)

```
✅ VALID: Class overlapping with Milonga
Time:  7:00 PM    8:00 PM    9:00 PM    10:00 PM   11:00 PM
       │          │          │          │          │
CLASS  ├──────────┤          │          │          │
       │          │          │          │          │
MILONGA│          ├──────────┴──────────┴──────────┤
       │          │                                 │
       └─ Classes can overlap with any event type ─┘

✅ VALID: Multiple Classes at same time
Time:  10:00 AM        11:00 AM        12:00 PM
       │               │               │
CLASS1 ├───────────────┤               │
       │               │               │
CLASS2 ├───────────────┴───────────────┤
       │                               │
       └─ Multiple classes allowed ────┘

❌ INVALID: Two Practicas at same time (Same Organizer)
Time:  3:00 PM         5:00 PM         7:00 PM
       │               │               │
PRACTICA1├─────────────┴───────────────┤
       │                               │
PRACTICA2├─────────────┴───────────────┤
       │                               │
       └─ FORBIDDEN: Cannot run ───────┘
          overlapping practicas
```

---

## ❌ INVALID EVENT EXAMPLES

### Invalid Category Combinations

```
❌ INVALID: Milonga + Practica Together
┌──────────────────────────────┐
│ Primary: MILONGA             │
│ Secondary: PRACTICA          │ ← FORBIDDEN
│                              │   These cannot
│ ERROR: Cannot combine        │   be together
│ Milonga and Practica         │
└──────────────────────────────┘

❌ INVALID: Long Event in Wrong Position
┌──────────────────────────────┐
│ Primary: MILONGA             │
│ Secondary: FESTIVAL          │ ← FORBIDDEN
│                              │   Festival MUST
│ ERROR: FESTIVAL must be      │   be primary
│ the PRIMARY category         │
└──────────────────────────────┘

❌ INVALID: Marathon as Secondary
┌──────────────────────────────┐
│ Primary: CLASS               │
│ Secondary: MARATHON          │ ← FORBIDDEN
│                              │   Marathon MUST
│ ERROR: MARATHON must be      │   be primary
│ the PRIMARY category         │
└──────────────────────────────┘

❌ INVALID: Multiple Long Event Types
┌──────────────────────────────┐
│ Primary: FESTIVAL            │
│ Secondary: MARATHON          │ ← FORBIDDEN
│                              │   Both are long
│ ERROR: Cannot have multiple  │   event types
│ long event types             │
└──────────────────────────────┘

❌ INVALID: Workshop Not Primary
┌──────────────────────────────┐
│ Primary: CLASS               │
│ Secondary: WORKSHOP          │ ← FORBIDDEN
│ Tertiary: MILONGA            │   Workshop MUST
│                              │   be primary
│ ERROR: WORKSHOP must be      │
│ the PRIMARY category         │
└──────────────────────────────┘
```

### Invalid Durations

```
❌ INVALID: Event Too Short
┌──────────────────────────────┐
│ Category: MILONGA            │
│ Duration: 20 minutes         │ ← TOO SHORT
│                              │   Min: 30 minutes
│ ERROR: All events must be    │
│ at least 30 minutes long     │
└──────────────────────────────┘

❌ INVALID: Short Event Too Long
┌──────────────────────────────┐
│ Category: PRACTICA           │
│ Duration: 7 hours            │ ← TOO LONG
│ Time: 6:00 PM - 1:00 AM      │   Max: 5 hours
│                              │
│ ERROR: PRACTICA cannot       │
│ exceed 5 hours               │
└──────────────────────────────┘

❌ INVALID: Long Event Too Short
┌──────────────────────────────┐
│ Category: FESTIVAL           │
│ Duration: 6 hours            │ ← TOO SHORT
│                              │   Min: 24 hours
│ ERROR: FESTIVAL must be      │
│ at least 1 day long          │
└──────────────────────────────┘

❌ INVALID: Long Event Too Long
┌──────────────────────────────┐
│ Category: RETREAT            │
│ Duration: 10 days            │ ← TOO LONG
│                              │   Max: 9 days
│ ERROR: RETREAT cannot        │
│ exceed 9 days                │
└──────────────────────────────┘
```

### Invalid Overlaps (Same Organizer)

```
❌ INVALID: Milonga overlapping with Practica
Time:  8:00 PM    9:00 PM    10:00 PM   11:00 PM   12:00 AM
       │          │          │          │          │
MILONGA├──────────┴──────────┤          │          │
       │                     │          │          │
PRACTICA          ├──────────┴──────────┴──────────┤
       │          │                                 │
       └─ FORBIDDEN: Same organizer cannot ────────┘
          have overlapping Milonga & Practica

❌ INVALID: Two Milongas at same time (Same Organizer)
Time:  8:00 PM         10:00 PM        12:00 AM
       │               │               │
MILONGA1├──────────────┴───────────────┤
       │                               │
MILONGA2├──────────────┴───────────────┤
       │                               │
       └─ FORBIDDEN: Cannot run ───────┘
          overlapping milongas
```

### Missing Required Fields

```
❌ INVALID: Missing Required Information
┌──────────────────────────────┐
│ Category: MILONGA            │
│ Duration: 3 hours            │
│ Venue: (not selected)        │ ← MISSING
│ Short Title: (empty)         │ ← MISSING
│                              │
│ ERRORS:                      │
│ - Venue is required          │
│ - Short title is required    │
└──────────────────────────────┘
```

---

## 🎨 Color-Coded Rule Summary

### 🟢 GREEN ZONE (Always Allowed)
- ✅ CLASS + anything
- ✅ Events 30 minutes or longer
- ✅ Single category short events
- ✅ Long events with sub-events (CLASS/MILONGA/PRACTICA)

### 🟡 YELLOW ZONE (Conditional)
- ⚠️ Short events 4-5 hours (valid but unusual)
- ⚠️ Long events approaching 9 day maximum
- ⚠️ Overlapping events (check organizer rules)

### 🔴 RED ZONE (Never Allowed)
- ❌ MILONGA + PRACTICA in same event
- ❌ Multiple long event types (FESTIVAL + MARATHON)
- ❌ Events under 30 minutes
- ❌ Short events over 5 hours
- ❌ Long events under 24 hours
- ❌ Same organizer: overlapping MILONGA + PRACTICA

---

## 📱 Mobile-Friendly Quick Check

```
Event Duration?
├─ Under 30 min → ❌ TOO SHORT
├─ 30 min - 5 hrs → Check Categories
│   ├─ MILONGA alone → ✅
│   ├─ PRACTICA alone → ✅
│   ├─ CLASS + anything → ✅
│   └─ MILONGA + PRACTICA → ❌
└─ Over 24 hours → Long Event
    ├─ ONE type only → ✅
    └─ Multiple types → ❌
```

---

*Use this visual guide when creating or reviewing events in the TangoTiempo system*