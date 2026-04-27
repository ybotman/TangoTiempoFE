---
date: 2026-04-25
persona: sarah
type: implementation
state: in-progress
keywords: [spotlighter-role, role-rbac, spotlights]
feature: spotlighter-role
appid: 1
audience: developer
permanence: long-term
tags: [type/implementation, app/tangotiempo, product/jira]
jira: [TIEMPO-393, CALBEAF-91]
---
# Feature: Spotlighter Role (SL)

## 📋 Summary

The **Spotlighter** (code: `SL`) role lets a designated user attach **spotlight metadata** — DJ, Instructor, Performer, Orchestra/Band, Notes — to **ANY event** in the app, *without* the ability to edit core event data (title, time, venue) or delete events. It is a low-privilege contributor role meant to crowdsource real-time event color-of-night info from trusted community members who are not themselves event organizers.

The role is **partially implemented**: BE permission gate is live (CALBEAF-91), but FE role-switcher and CalOps grant/revoke UI have not landed. JIRA: [TIEMPO-393].

---

## 🎯 Why It Exists

Approved organizers (`RegionalOrganizer` / `RegionalAdmin`) can already manage spotlights, but only on events they own (RO) or all events in their region (RA). There's a gap: trusted community members (e.g. DJs, instructors who aren't organizers) often know who's playing/teaching at an event tonight that the organizer hasn't filled in. SL gives them write access to spotlights only — no risk of damaging event records.

---

## 🔐 Authorization Model

### Two-layer BE check

`hasSpotlighterRole(db, firebaseUID, appId)` in `calendar-be-af/src/functions/Events_Spotlights.js:42-74`:

1. `userlogins.roleIds` (populated against `roles` collection) contains a role document with `roleName === 'Spotlighter'` for this `appId`.
2. `userlogins.spotlighterInfo.isEnabled !== false` — admin can disable a granted role per-user *without* removing it from `roleIds`.

If either check fails, the role does not apply.

### Permission gate

In `Events_Spotlights.js:249-265`, the spotlight ADD/REMOVE endpoint authorizes the request if **either**:
- The caller is an approved organizer (`isApprovedOrganizer` returns approved=true), OR
- The caller has `Spotlighter` role and it's enabled.

Anything else → HTTP 403 with `'Must be an approved organizer or have Spotlighter role to modify spotlights'`.

### Audit trail

Every spotlight action records who made the change with `role: 'spotlighter'` (vs. `'organizer'`) and an `organizerName` string of `'Spotlighter'` placeholder when no organizer record exists. Stored on the event's spotlight entry (`addedBy`) and on a per-action log (`logEntry`). See `Events_Spotlights.js:275-305`.

### What an SL **can** do

| Surface | Allowed? |
|---|---|
| Add spotlight (dj / instructor / performer / band) to any event | ✅ |
| Remove spotlight from any event | ✅ |
| Add spotlight to a specific occurrence of a recurring event (via `instanceKey`) | ✅ |
| Edit event title, start/end time, venue, description | ❌ |
| Delete event | ❌ |
| Create new event | ❌ |

Per TIEMPO-393 spec: **Event Visibility** = ALL events in current geo (same as RA, **not** RO's "my events only"). **Context menu** = View Event + Add Spotlight only.

---

## 👥 Who Gets It / How It's Granted

**Currently:** nobody, in production. Role exists in the `roles` collection (TEST + PROD, same ObjectId per TIEMPO-393), and the BE gate is live, but no users have been granted it because:

- FE role-switcher does not yet render an enabled `Spotlighter` option (currently a `disabled` "(coming soon)" radio at `src/app/components/UI/SiteMenuBarUserDrawer.js:229-245`).
- CalOps has no UI to grant/revoke the role (TIEMPO-393 task list: "Add Spotlighter tab/section in user management").

**Planned grant flow** (per TIEMPO-393, recommendation: Option A): admin-only grant by RA/SA. No application flow. RA/SA goes into CalOps → user management → Spotlighter tab → grants role to a user, which:
1. Adds the SL role's `_id` to `userlogins.roleIds` for that user (this app only).
2. Optionally writes `spotlighterInfo: { isEnabled: true }` (default behavior is enabled).

**Revoke** = remove `_id` from `roleIds`, OR set `spotlighterInfo.isEnabled = false` (preserves history without active grant).

---

## 🗂️ Schema Summary

### `userlogins` document additions
```js
{
  // ... existing fields
  roleIds: [ObjectId, ...],          // contains Spotlighter role _id
  spotlighterInfo: {
    isEnabled: Boolean               // admin toggle, default true if unset
    // — future: regionIds[] for region-scoped SL (TIEMPO-393 open question)
  }
}
```

### `roles` document
Standard role doc, `roleName === 'Spotlighter'`, `appId === '1'` (per app). Same ObjectId in TEST and PROD per TIEMPO-393.

### `events` document — spotlight entries
Spotlights live in `events.spotlights[]` (canonical, post-TIEMPO-388 rename) or legacy `events.features[]`. Each entry made by an SL is tagged:

```js
{
  type: 'dj' | 'instructor' | 'performer' | 'band',
  name: '<spotlight name>',
  organizerId: null | ObjectId,
  addedBy: {
    firebaseUID: '<user>',
    organizerId: null,               // SL has no organizer
    organizerName: 'Spotlighter',    // placeholder
    email: '<user.email>',
    role: 'spotlighter'              // distinguishes from 'organizer'
  },
  addedAt: <Date>
}
```

For recurring events, single-occurrence spotlights go through `instanceOverrides[]` instead.

---

## 🚧 Implementation Status

| Layer                                                     | Status                                        | Reference                       |
| --------------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| `roles` collection entry                                  | ✅ Done (TEST + PROD)                          | TIEMPO-393                      |
| BE permission gate (`Events_Spotlights.js`)               | ✅ Done                                        | CALBEAF-91                      |
| BE cross-app role leak in `/api/userlogins` populate      | ✅ Fixed (TEST)                                | CALBEAF-143                     |
| FE defensive cross-app role filter                        | ✅ Shipped to TEST                             | TIEMPO-430                      |
| FE role-switcher (TT) shows SL when granted               | ✅ Shipped to TEST                             | TIEMPO-431                      |
| FE Add Spotlight button + spotlight-only modal (master)   | ✅ Shipped to TEST                             | TIEMPO-431                      |
| FE event-visibility logic for SL (all events, like RA)    | ✅ Default behavior — no special filter needed | TIEMPO-431                      |
| FE per-occurrence spotlights for recurring events         | ❌ Deferred to v2                              | —                               |
| CalOps grant/revoke UI                                    | ❌ Not started (queued behind Dash TEST val)   | TIEMPO-393 / Dash               |
| CalOps audit view (filterable timeline, aggregates)       | ❌ Filed as v2                                 | CALOPS-51                       |
| Notification to event owner when SL adds spotlight        | ❌ TODO in code (Events_Spotlights.js:115-125) | —                               |
| `forBeginnersOverride` style override for SL adds (audit) | ⚠️ Implicit via `addedBy.role` field          | —                               |

---

## ❓ Gaps / Open Questions

These aren't answered by code or TIEMPO-393:

1. **Eligibility criteria.** TIEMPO-393 recommends "Option A: admin-only grant (no application)". Who should an admin consider eligible? DJs registered as performers on past events? Verified instructors? People who've contributed via other channels? *No documented policy.*
2. **Conflict policy.** What happens if SL-A and Org-B both try to add a DJ to the same event minute apart? Code appears last-write-wins; no de-duplication beyond exact `type+name` match.
3. **Notification spec.** `sendSpotlightNotification` is a TODO comment (`Events_Spotlights.js:115-125`) — Firestore message envelope shape not defined.
4. **Region scoping.** Comment in TIEMPO-393 says "Future: spotlighterInfo.regionIds[] for regional filtering". Not in current schema.
5. **Audit retention.** SL actions stamp `addedBy` and append to a log entry array — no retention policy / size cap documented.
6. **CalOps audit view.** No documentation on whether CalOps will surface "all spotlights added by SL X this week" for trust review.
7. **Multi-app users.** A user could in principle hold SL in two apps (TT + HJ). The BE check is correctly appId-scoped, but no doc on whether a single CalOps grant action propagates across apps or stays scoped.

---

## 🛠️ What's Left (Sequenced)

Status snapshot 2026-04-25: role is **half-built and dormant**. BE will gate correctly, but no admin can grant SL through any UI, and even if a user had the role injected via DB, the FE radio is hardcoded disabled and would reject the selection.

The practical unblocker is the **CalOps grant UI** — without it, FE work has no testable user.

### Proposed sequence

1. **CalOps grant/revoke UI** (Dash, CALOPS) — *unblocker for everything else*
   - Spotlighter tab in user management
   - Grant: add SL role `_id` to `userlogins.roleIds`; default `spotlighterInfo: { isEnabled: true }`
   - Revoke: pull `_id` from `roleIds` OR set `spotlighterInfo.isEnabled = false`
   - List view of currently-granted users + last-action timestamp

2. **FE role-switcher visibility** (Sarah, TIEMPO)
   - Replace hardcoded disabled "(coming soon)" radio at `SiteMenuBarUserDrawer.js:229-245` with conditional render: show enabled SL option when `roles.includes('Spotlighter')`
   - Add `Spotlighter` to `listOfAllRoles` in `masterData.js`

3. **FE event-visibility + context-menu logic** (Sarah, TIEMPO)
   - When `selectedRole === 'Spotlighter'`: show ALL events in geo (same path as RA, NOT RO's "my events" filter at `usePostFilter.js:108-125`)
   - Context menu narrows to: View Event + Add Spotlight only
   - For recurring events: Edit This Date (spotlight-only) + See All Dates

4. **FE spotlight-only modal** (Sarah, TIEMPO)
   - Reuse `EditOccurrenceModal` with hidden tabs OR new `SpotlightOnlyModal`
   - Show only Spotlight tab (DJ/Instructor/Performer/Orchestra/Note)
   - Hide Image, Description, time/venue, all destructive controls

5. **Notification to event owner** (Fulton, CALBEAF)
   - Implement `sendSpotlightNotification` (currently TODO at `Events_Spotlights.js:115-125`)
   - Firestore message envelope shape — needs spec

### Parallelizable

- Step 1 (CalOps) is independent of FE work and unblocks steps 2-4
- Steps 2 → 3 → 4 are roughly sequential but small enough to land as a single FE PR if all three are done in one session
- Step 5 (notifications) is fully independent of FE/CalOps and can ship anytime

### Decisions made (2026-04-25, Toby)

- **CalOps is the ONLY place to grant SL.** No application flow, no self-service. Admin (RA/SA) grants via CalOps user management.
- **Future enhancement (not v1):** auto-apply SL to all `RegionalOrganizer` users — ROs are already trusted, so SL is a no-op privilege addition for them. Defer until v1 ships and we see real usage.
- **Eligibility (gap #1):** admin discretion via CalOps. No documented criteria — admins judge per user. Revisit after v1 feedback.
- **Conflict policy (gap #2): last-write-wins.** It's a DB update on the spotlights array. No locking, no merge logic. Whoever's request lands last (SL or Org) is the persisted state. Existing exact `type+name` de-dup at write time is sufficient.
- **CalOps audit view (gap #5): defer to v2 (CALOPS-51).** v1 ships with an inline "last 10 actions" mini-panel on the user-detail page in CalOps. Full audit view (filterable timeline, aggregate counts, bulk actions) is CALOPS-51 for v2. Rationale: v1's testable story is grant → spotlight → it shows up; full audit only matters at scale.
- **Multi-app grants (gap #6): app-scoped, no propagation.** CalOps grant button operates only in the current AppContext. SL role doc is per-app (`appId === '1'`), so TT and HJ are distinct grants — granting in HJ requires explicitly switching AppContext. Read-only badges "user holds SL in: [TT, HJ]" shown on the user detail panel for visibility. Rationale: matches the auth boundary; avoids re-introducing the exact cross-app leak CALBEAF-143 just fixed.

### Decisions still owed

Policy/spec gaps remaining for v1: **Audit retention (#4)**, **Notification spec (#7)**. Neither blocks CalOps grant UI or FE work. Notification spec blocks Fulton's notification implementation (#5 in sequencing) but that's the last work item.

**HOLD: Region scoping (#3)** — deferred indefinitely (Toby 2026-04-25). v1 SL has global write to all events in the app; no region narrowing. Concept = `spotlighterInfo.regionIds: [ObjectId, ...]` (empty = global, populated = narrowed). Revisit if/when trust-localization becomes a real ask. Not a v1 blocker.

---

## 🔗 Related Tickets

- **TIEMPO-393** — Design & Implement Spotlighter (SL) Role - FE + CalOps (Backlog, parent)
- **TIEMPO-431** — Spotlighter role enabled: role-switcher + spotlight-only modal (In Review, on TEST 2026-04-25)
- **CALBEAF-91** — BE Spotlighter role implementation (closed; gate in `Events_Spotlights.js`)
- **CALBEAF-143** — UserLogins.js populate cross-app role leak (Fulton, fixed in TEST 2026-04-25)
- **CALOPS-51** — CalOps audit view for SL activity (parked v2; v1 will inline last-10 actions in Dash's grant UI)
- **TIEMPO-388** — Spotlights schema (multi-spotlight, `features` → `spotlights` rename)
- **TIEMPO-430** — Cross-app role leak in `/api/userlogins` populate (FE-side defensive filter, shipped TEST)

## 📨 Lane confirmation (Dash, 2026-04-25)

Dash has confirmed CalOps lane ownership for SL grant/revoke + activity surface. v1 scope agreed:

1. **List view** — users holding SL in current AppContext, with `spotlighterInfo.isEnabled` state + last-action timestamp
2. **Grant** — add SL role `_id` to `userlogins.roleIds`, default `spotlighterInfo: { isEnabled: true }`
3. **Revoke** — two buttons: **Disable** (sets `isEnabled: false`, preserves grant + history), **Remove** (pulls `_id` from `roleIds`)
4. **App-scoped** to current AppContext (same pattern as every other role grant in calops)

Dash's two recommended defaults (awaiting Toby's call):

- **(A) Audit view in v1?** Recommend **defer to v2**. v1 inline = "last 10 actions" mini-panel on user-detail. Full audit view = CALOPS-51. Rationale: v1's testable story is grant → spotlight → it shows up; full audit only matters at scale.
- **(B) Multi-app propagation?** Recommend **app-scoped, no propagation**. SL role doc has `appId === '1'`, so TT and HJ have distinct role docs. Cross-app grant = explicitly switch AppContext + grant again. Read-only "this user holds SL in: [TT, HJ]" badges shown on user detail. Rationale: same boundary as auth, no surprise blast radius — also avoids re-introducing exactly the cross-app leak CALBEAF-143 just fixed.

---

## 🕒 Activity History (Automated)
```dataview
TABLE state, persona, date
FROM "_GHOST_HANDOFFS"
WHERE contains(keywords, "spotlighter-role")
SORT date desc
```
