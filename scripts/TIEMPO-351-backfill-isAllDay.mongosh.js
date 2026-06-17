// TIEMPO-351 data backfill — set isAllDay: true for existing multi-day LONG events
//
// Purpose: existing events in MongoDB created before TIEMPO-351 fix have isAllDay=false
// (or missing). The FE now sets isAllDay=true on save for multi-day events (>24hr
// duration), but historical multi-day LONG events remain incorrectly rendered as
// per-day tiles instead of spanning bars.
//
// Strategy: match events where the duration is >24 hours (isMultiDayEvent === true
// in the FE) and set isAllDay=true. Categories most affected per TIEMPO-351 are
// Festival, Marathon, Encuentro, Workshop — but the canonical signal is duration,
// not category, so the patch keys on duration to align with FE write-side logic.
//
// Usage (TEST):
//   mongosh "<TEST_MONGO_URI>" scripts/TIEMPO-351-backfill-isAllDay.mongosh.js
//
// Usage (PROD — requires DEPLOY-PROD authorization per PROD-DEPLOY-PROTECTION.md):
//   mongosh "<PROD_MONGO_URI>" scripts/TIEMPO-351-backfill-isAllDay.mongosh.js
//
// Safety:
//   - Idempotent: re-running has no effect on already-patched events.
//   - Targeted: only updates events with duration >24hr AND isAllDay !== true.
//   - Reports counts before + after for verification.
//   - Does NOT delete or otherwise modify any other field.

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Use the events collection in current DB (mongosh connects to a specific db)
const events = db.events;

// Pre-patch report
const totalEvents = events.countDocuments({});
const multiDayEvents = events.countDocuments({
  $expr: {
    $gt: [
      { $subtract: ['$endDate', '$startDate'] },
      TWENTY_FOUR_HOURS_MS
    ]
  }
});
const alreadyPatched = events.countDocuments({
  $expr: {
    $gt: [
      { $subtract: ['$endDate', '$startDate'] },
      TWENTY_FOUR_HOURS_MS
    ]
  },
  isAllDay: true
});
const needsPatch = multiDayEvents - alreadyPatched;

print('=== TIEMPO-351 backfill — pre-patch report ===');
print(`Total events: ${totalEvents}`);
print(`Multi-day events (>24hr duration): ${multiDayEvents}`);
print(`  - Already patched (isAllDay=true): ${alreadyPatched}`);
print(`  - Needs patch (isAllDay !== true): ${needsPatch}`);
print('');

if (needsPatch === 0) {
  print('No-op: all multi-day events already have isAllDay=true. Exiting.');
  quit(0);
}

// Apply patch
print('Applying patch...');
const result = events.updateMany(
  {
    $expr: {
      $gt: [
        { $subtract: ['$endDate', '$startDate'] },
        TWENTY_FOUR_HOURS_MS
      ]
    },
    isAllDay: { $ne: true }
  },
  { $set: { isAllDay: true } }
);

print(`Matched: ${result.matchedCount}`);
print(`Modified: ${result.modifiedCount}`);
print('');

// Post-patch report
const verifyPatched = events.countDocuments({
  $expr: {
    $gt: [
      { $subtract: ['$endDate', '$startDate'] },
      TWENTY_FOUR_HOURS_MS
    ]
  },
  isAllDay: true
});

print('=== TIEMPO-351 backfill — post-patch report ===');
print(`Multi-day events with isAllDay=true: ${verifyPatched}`);
print(`Expected: ${multiDayEvents}`);
print(verifyPatched === multiDayEvents ? 'OK — patch complete.' : `WARN — mismatch: ${multiDayEvents - verifyPatched} unpatched.`);
