# Spotlight Architecture Research
## TangoTiempo (appId=1) — Full Matrix

**Date**: 2026-03-25
**Researcher**: Sarah
**Ticket**: TIEMPO-388

---

## 1. Spotlight Types

| Type | Label | Max Length | Color | Available In |
|------|-------|------------|-------|--------------|
| `dj` | DJ | 19 chars | Primary (blue) | Event + Occurrence |
| `instructor` | Instructor | 19 chars | Secondary (orange) | Event + Occurrence |
| `performer` | Performer | 19 chars | Info (purple) | Event + Occurrence |
| `orchestra` | Orchestra | 19 chars | Success (green) | Occurrence ONLY |
| `note` | Special Note | 19 chars | Default (grey) | Occurrence ONLY |
| `description` | Tonight's Description | 200 chars | Default (grey) | Occurrence ONLY |
| `canceled` | Tonight: Canceled | 19 chars (reason) | Error (red) | Occurrence ONLY ⚠️ |

**⚠️ GAP**: `canceled` is ONLY available for recurring event occurrences. Single events have NO UI to mark as canceled.

---

## 2. Where Spotlights Can Be SET

### Grid A: Modal → Spotlight Type Availability

| Modal | DJ | Inst | Perf | Orch | Note | Desc | Cancel |
|-------|:--:|:----:|:----:|:----:|:----:|:----:|:------:|
| **Create Event** (Spotlights Tab) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Event** (Spotlights Tab) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit This Date** (Recurring Only) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Files:
- **CreateEventDetailsSpotlights.js** — Event-level spotlights (DJ, Instructor, Performer only)
- **EditOccurrenceModal.js** — Per-occurrence overrides (all 7 types)
- **CreateEventDetailModal.js** — Contains Spotlights tab, uses CreateEventDetailsSpotlights

---

## 3. Where Spotlights DISPLAY

### Grid B: View → Spotlight Type Display

| View | DJ | Inst | Perf | Orch | Note | Desc | Cancel |
|------|:--:|:----:|:----:|:----:|:----:|:----:|:------:|
| **Monthly Calendar** | ⚙️ | ⚙️ | ⚙️ | ⚙️* | ❌ | ❌ | ✅ |
| **List Calendar** | ⚙️ | ⚙️ | ⚙️ | ⚙️* | ❌ | ❌ | ✅ |
| **Boston Monthly** | ⚙️ | ⚙️ | ⚙️ | ⚙️* | ❌ | ❌ | ✅ |
| **Boston List** | ⚙️ | ⚙️ | ⚙️ | ⚙️* | ❌ | ❌ | ✅ |
| **Event Detail Modal** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Event Page** (/event/[id]) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Legend**:
- ✅ = Always displayed
- ⚙️ = Conditional by category (see Grid C)
- ⚙️* = Special "LIVE! Orch:" row format
- ❌ = Not displayed in this view

### Files:
- `/calendar/page.js` — Main calendar (Monthly + List)
- `/calendar/boston/page.js` — Boston calendar (Monthly + List)
- `ViewEventDetailsBasic.js` — Modal content display
- `/event/[id]/page.js` — Deep link page

---

## 4. Category-Based Visibility Rules

### Grid C: Calendar Display Rules by Category

| Category | DJ | Inst | Perf | Orchestra | Canceled |
|----------|:--:|:----:|:----:|:---------:|:--------:|
| **Milonga** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Festival** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Special** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Marathon** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Weekend** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi-day (>2 days)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Practica** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Class** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Other** | ❌ | ❌ | ❌ | ❌ | ✅ |

**Logic** (from `calendar/page.js` lines 580-604):
```javascript
const isFestivalOrSpecial = ['Festival', 'Special', 'Marathon', 'Weekend'].some(
  cat => categoryFirst.toLowerCase().includes(cat.toLowerCase())
);
const isPracticaOrClass = ['Practica', 'Class', 'Other'].some(
  cat => categoryFirst.toLowerCase().includes(cat.toLowerCase())
);
const showAllSpotlights = isMultiDay || isFestivalOrSpecial;
const hideSpotlights = isPracticaOrClass && !showAllSpotlights;
```

**Note**: Canceled badge ALWAYS shows, regardless of category.

---

## 5. Repeating vs Single Event Differences

### Grid D: Feature Availability by Event Type

| Feature | Repeating Series | Repeating Occurrence | Single Event |
|---------|:----------------:|:--------------------:|:------------:|
| **Set DJ** | ✅ (series-wide) | ✅ (override) | ✅ |
| **Set Instructor** | ✅ (series-wide) | ✅ (override) | ✅ |
| **Set Performer** | ✅ (series-wide) | ✅ (override) | ✅ |
| **Set Orchestra** | ❌ | ✅ (override only) | ❌ |
| **Set Note** | ❌ | ✅ (override only) | ❌ |
| **Set Description** | ❌ | ✅ (override only) | ❌ |
| **Set Canceled** | ❌ | ✅ (override only) | ❌ ⚠️ GAP |
| **Override Image** | ❌ | ✅ | N/A |
| **Exclude Date** | N/A | ✅ (via Edit Series) | N/A |

### Override Priority Rules (ViewEventDetailsBasic.js):
1. Override spotlight of same type **WINS** over series spotlight
2. Series spotlights show if no override exists for that type
3. Both are merged for display

---

## 6. Display Formatting

### Calendar Row Structure:

**Row 1**: Time (or ⚠️ if canceled) | Categories | ShortTitle | Organizer

**Row 2**:
- If canceled: `[TODAY Canceled {reason}]` badge only (no title, no strikethrough)
- Otherwise: `[DJ: Name]` `[Inst: Name]` `[Perf: Name]` + Title
- If orchestra: Separate row with inverted style: `LIVE! Orch: {name}`

### Badge Styles:

| Spotlight | Calendar Badge | Modal Badge |
|-----------|----------------|-------------|
| DJ | `DJ: {name}` (blue bg) | `DJ: {name}` (blue) |
| Instructor | `Inst: {name}` (orange bg) | `Instructor: {name}` (orange) |
| Performer | `Perf: {name}` (purple bg) | `Performer: {name}` (purple) |
| Orchestra | `LIVE! Orch: {name}` (green, inverted row) | `Orchestra: {name}` (green) |
| Note | Not on calendar | `📝 {text}` (grey) |
| Description | Not on calendar | Tonight's Description box |
| Canceled | `TODAY Canceled {reason}` (red, inverted) | ❌ TONIGHT: CANCELED banner |

---

## 7. Data Flow

### Event Creation/Edit:
```
CreateEventDetailModal (Spotlights Tab)
    └── CreateEventDetailsSpotlights.js
        └── Updates eventData.spotlights[]
            └── Saved as event.spotlights in MongoDB
```

### Occurrence Override:
```
ViewEventDetailModal → "Edit This Date" button
    └── EditOccurrenceModal.js
        └── Creates patch with features[]
            └── Saved as instanceOverrides[] in MongoDB
```

### Calendar Display:
```
transformEvents.js
    └── Maps event.spotlights → extendedProps.features/spotlights
        └── calendar/page.js getFeatureData()
            └── Checks instanceOverrides for date match
            └── OR checks direct event.features for single events
                └── Applies category visibility rules
                    └── Renders badges
```

### Modal Display:
```
ViewEventDetailModal
    └── ViewEventDetailsBasic.js
        └── Merges series features + override features
            └── Override wins for same type
                └── Displays all as badges/banners
```

---

## 8. Known Gaps & Issues

### GAP 1: No Cancel for Single Events ⚠️
- **Problem**: Single (non-repeating) events cannot be marked as canceled
- **Schema exists**: `isCanceled` field is in CreateEventDetailModal.js (line 104)
- **Display works**: Calendar views handle `isCanceled` for single events (line 421)
- **Missing**: No UI toggle in CreateEventDetailsSpotlights.js
- **Solution**: Add "Canceled" option to CreateEventDetailsSpotlights for non-repeating events

### GAP 2: No Orchestra/Note/Description for Single Events
- **By Design**: These are occurrence-specific overrides
- **Rationale**: Series have default spotlights, occurrences can override
- **Question**: Should single events have Note/Description? (Maybe not needed)

### GAP 3: Live Spotlight Inconsistency
- **EditOccurrenceModal**: Has `live` type with 🎵 emoji
- **CreateEventDetailsSpotlights**: Does NOT have `live` type
- **Question**: Is LIVE only for per-occurrence use? (Probably intentional)

---

## 9. Schema Reference

### Event Schema (MongoDB):
```javascript
{
  spotlights: [{ type: String, name: String }],  // or 'features'
  features: [{ type: String, name: String }],    // legacy/alias
  isCanceled: Boolean,  // EXISTS but no UI for single events
  cancelReason: String,
  instanceOverrides: [{
    instanceKey: String,  // "YYYY-MM-DD"
    overrideType: "modify" | "cancel",
    patch: {
      features: [{ type: String, name: String }],
      isCanceled: Boolean,
      cancelReason: String,
      overrideImage: String,
      tonightsDescription: String,
      specialNote: String
    }
  }]
}
```

---

## 10. Recommendations

### Priority 1: Fix Cancel Gap
Add "Canceled" option to `CreateEventDetailsSpotlights.js` for **non-repeating events only**:
- Only show when `isRepeating === false`
- When selected, set `isCanceled: true` + optional `cancelReason`
- Field already exists in schema, just needs UI

### Priority 2: Documentation Sync
Ensure all 4 calendar views maintain identical spotlight logic:
- `/calendar/page.js` (Monthly + List)
- `/calendar/boston/page.js` (Monthly + List)

### Priority 3: Consider Note/Description for Single Events
- Evaluate if single events need Note/Description capability
- Currently by-design limitation

---

*Research completed by Sarah, TangoTiempo Frontend Agent*
