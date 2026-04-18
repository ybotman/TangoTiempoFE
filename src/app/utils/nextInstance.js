// TIEMPO-408 FTPNTD refinement: shared helper for recurring-master next-instance
// computation. Extracted from BeginnerOrganizerList so Explore can reuse it.
//
// Backend returns recurring masters regardless of date filter (Events.js L88 rule).
// Their base startDate is often historical. FE must expand via rrule.between()
// to find the NEXT instance within the visible window for display + sort + filter.

import { RRule } from 'rrule';
import dayjs from 'dayjs';

/**
 * Find the first instance of an event in [fromMs, toMs].
 * - Non-recurring: base startDate must fall in window.
 * - Recurring (isRepeating + recurrenceRule): parse rrule and find next.
 * - Recurring with malformed rrule: return null (drop).
 * - Recurring with valid rrule but no instance in window: return null (drop).
 *
 * @returns {Date|null}
 */
export function firstInstanceInWindow(e, fromMs, toMs) {
  const baseStart = new Date(e.startDate);
  if (!e.isRepeating || !e.recurrenceRule) {
    const t = baseStart.getTime();
    return t >= fromMs && t <= toMs ? baseStart : null;
  }
  try {
    const rruleStr = e.recurrenceRule.includes('DTSTART')
      ? e.recurrenceRule
      : `DTSTART:${dayjs(baseStart).utc().format('YYYYMMDDTHHmmss')}Z\nRRULE:${e.recurrenceRule.replace(/^RRULE:/, '')}`;
    const rule = RRule.fromString(rruleStr);
    const instances = rule.between(new Date(fromMs), new Date(toMs), true);
    return instances.length ? instances[0] : null;
  } catch {
    // Malformed RRULE — drop rather than show a ghost past-dated row.
    return null;
  }
}

/**
 * Expand a recurring event to a display-ready shape: replaces startDate/endDate
 * with the next-instance values preserving the original duration. Non-recurring
 * events pass through unchanged if they're in-window. Events outside the window
 * (or with expired/malformed recurrence) return null.
 *
 * Use this as the Explore / any timeline view's "materialize" step before
 * downstream filters and renderers.
 *
 * @returns {object|null} enriched event or null (drop)
 */
export function expandToNextInstance(e, fromMs, toMs) {
  const next = firstInstanceInWindow(e, fromMs, toMs);
  if (!next) return null;
  if (!e.isRepeating || !e.recurrenceRule) return e;
  const baseStart = new Date(e.startDate);
  const baseEnd = new Date(e.endDate);
  const durationMs = Math.max(0, baseEnd.getTime() - baseStart.getTime());
  return {
    ...e,
    _originalStartDate: e.startDate,
    _originalEndDate: e.endDate,
    startDate: next.toISOString(),
    endDate: new Date(next.getTime() + durationMs).toISOString(),
  };
}
