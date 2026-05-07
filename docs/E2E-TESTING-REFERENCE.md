# TangoTiempo (TT) Frontend — E2E Testing Reference

**Audience:** Gauge sub-agent / Quinn-as-relay / E2E spawn authors. NOT for end users.
**Authored by:** Sarah (TT FE persona).
**Living doc:** update as features land or selectors shift. Source files cited with `path:line` for deep dives.
**App context:** `tangotiempo.com` / `appId="1"` (PROD) or `appId="99"` (test partition Pattern A).
**Companion docs:**
- `e2e-calendar-framework/usecases/intake/UC-*.md` — UC intakes
- `calendar-be-af-test-mutators/baseline/manifest.json` (manifest v1.1, commit `b14afdc`) — partition seed
- `calendar-be-af-test-mutators/baseline/e2euser-spec.md` — Pattern A user shape
- `calendar-be-af-test-mutators/baseline/role-elevation-matrix.md` — role transition contract

---

## 0. Selector Quick Reference (READ FIRST)

**Audience:** Gauge (and any spawn-author) before authoring or healing a UC. 30-second scan before writing the first selector. Full context for each row is in the section cited.

### 0.1 Known selector traps (do NOT use these on TT)

| You might try… | Why it fails on TT | Use instead | Ref |
|---|---|---|---|
| `.fc-toolbar-title` | TT uses **custom views** (`dayGrid8Week` / `list21Days`); no FullCalendar toolbar title rendered | `[data-date="YYYY-MM-DD"]` on `.fc-daygrid-day` cells; or scan visible event rows | §3.5 |
| `[data-testid="calendar-title"]` | Doesn't exist | same as above | §3.5 |
| Standard FullCalendar prev/next buttons (`.fc-prev-button` / `.fc-next-button`) | TT uses custom `ModeToggle` + `CalendarSubMenu` for nav, not FC default toolbar | Drive `ModeToggle.js` / `CalendarSubMenu.js` selectors (TBD — file Sarah-update if you hit this) | §3.3 |
| `getByPlaceholder("Email")` on auth form | Field uses `<TextField label="Email Address">` — placeholder is empty | `getByLabel("Email Address")` or `input[name="email"]` | §4.1 |
| `text=Apply` to find apply button | "Apply" appears as tab label AND button label; ambiguous | `getByRole('button', { name: 'Apply for Event Organizer' })` | §6.3 |
| Querying for `selectedRole === 'Organizer/Artist'` | That's the **display map** (`Milonger@`, `Organizer/Artist`, etc.) — internal state uses `roleName` strings | Use canonical `roleName` (`RegionalOrganizer`, `NamedUser`, …) for state assertions; use display string only for visible-text lookups | §2.1 |
| `data-testid="user-settings-modal"` | Doesn't exist on the modal root | Open via avatar → drawer "User Settings"; tab via `button[role="tab"]:has-text("Apply")` | §5, §6.5 |
| Filling Description and expecting auto-seed | Description has **NO auto-seed** (TIEMPO-442 stopgap requires explicit fill ≥10 chars) | Always fill Description manually | §6.2 |
| Expecting submit-disable on shortName `available: null` | `null` and `true` both allow submit; only `false` blocks | Wait for `text=Available` after blur, OR proceed if no error message | §6.4 |

### 0.2 Selector cheat-sheet by surface

| Surface | Open path | Root selector | Key inner selectors | Section |
|---|---|---|---|---|
| **MapCenterModal** (cold-nav blocker) | Auto-opens on cold-nav | `[data-testid="map-center-modal"]` | `[data-testid="map-center-city-search"]`, `[data-testid="city-option-{kebab}"]`, `[data-testid="map-center-save"]`, `[data-testid="map-center-close"]` | §3.2 |
| **Signup page** | `/auth/signup` | `[data-testid="signup-page"]` | `[data-testid="email-signup-button"]`, `[data-testid="google-signup-button"]` | §4.1 |
| **EmailAuthForm** (signup/login) | After `email-signup-button` click, or `/auth/login` | `[data-testid="email-auth-form"]` | `getByLabel("First Name" / "Last Name" / "Email Address" / "Password" / "Confirm Password")`, `button[type="submit"]` | §4.1 |
| **Calendar (desktop)** | `/calendar` after MapCenter dismissal | `.fc-view-harness` | `.fc-daygrid-day[data-date="YYYY-MM-DD"]`, `.fc-daygrid-event` | §3.5 |
| **Calendar (mobile <768px)** | same | `.fc-list` | `.fc-list-day` (header), `.fc-list-event` (rows) | §3.5 |
| **Top nav** | always rendered | `SiteHeader` / `SiteMenuBar` | `CityPill` (re-opens MapCenter), `ModeToggle`, `CalendarSubMenu`, avatar (right) | §3.3 |
| **User drawer** | click avatar | (no testid; drawer opens right) | "Sign In" / "Create Account" (logged-out) ; "User Settings" / "Logout" / role selector / "Messages" (logged-in) | §3.4 |
| **UserSettingsModal** | drawer → "User Settings" | (no testid on root) | `button[role="tab"]:has-text("Name" / "Bookmarks" / "Apply" / …)` | §5 |
| **Apply tab (UserSettingsApply)** | UserSettings → Apply | tab content area | `getByLabel("Organizer Name" / "Short Name" / "Description")`, `getByRole('button', { name: 'Apply for Event Organizer' })` | §6 |
| **CreateEventDetailModal** | RO/RA "+" or menu "Create Event" | `[data-testid="create-event-modal"]` | tabs `basic` / `repeating` / `image` / `spotlights` / `overrideImages` / `grants` / `other`; Save = `disabled={!isFormValid()}` | §7 |
| **ViewEventDetailModal** | click event in calendar (RO/RA/NU) | `[data-testid="event-modal"]` | `[data-testid="event-modal-content"]`; tabs Basic / Venue / Organizer / Images | §8 |
| **SpotlightOnlyModal** | Spotlighter clicks event (TIEMPO-433) | (separate modal; no testid) | stripped-down view; image controls hidden | §8 |
| **EditOccurrenceModal** | edit single occurrence of recurring event | (no testid) | role-aware; Spotlighter mode hides image tab (TIEMPO-438) | §8 |
| **RegionalOrganizersModal** (admin) | RA/SA org-management menu | (no testid on root) | `<Tab label="Profile" / "Settings" / "Status">`; `handleSaveAll` save | §9 |

### 0.3 Pattern A vs Pattern B selector differences

Pattern A (persistent E2EUSER at `appId="99"`) and Pattern B (ephemeral aliased Gmail at `appId="1"` with markers) hit the **same FE selectors** — divergence is at the data/test-mutator layer, not the DOM layer. See §16 for setup/cleanup; selectors above apply to both patterns.

**Cross-reference:** Pattern A vs B partition asymmetry memory at `~/.claude/projects/.../memory/project_e2e_pattern_a_vs_b_partition_asymmetry.md`.

### 0.4 Modal-bypass standard pattern (REQUIRED)

Two rules that any modal-bypass helper (MapCenterModal, future similar) MUST follow. Both rules are field-tested via UC-0009 self-heal v1 (landed GREEN; the gemini-CLI-authored `bypassModal()` failed on first run by violating rule 1).

**Rule 1 — pre-wait BEFORE visibility check:**
```typescript
// REQUIRED: pre-wait
await page.waitForSelector('[data-testid="<modal-testid>"]', { timeout: 5000 });
// only THEN check visibility
const isOpen = await page.locator('[data-testid="<modal-testid>"]').isVisible();
```
Why: async modals open after Next.js hydration completes. `isVisible()` / `toBeVisible()` against a not-yet-mounted node silently returns `false` and the helper proceeds as if no modal needs dismissal — but the modal then renders mid-test and blocks downstream interaction. The 5s pre-wait closes the race.

**Rule 2 — post-bypass hidden assertion (REQUIRED end-of-bypass):**
```typescript
// after dismissal click(s) complete:
await expect(page.locator('[data-testid="<modal-testid>"]')).toBeHidden();
```
Why: catches "bypass silently no-op'd" on first run. Without this assertion, a bypass helper that fails to actually dismiss the modal (wrong selector, wrong click target, race) appears successful — defect surfaces later as a confusing downstream selector failure. The post-assert makes bypass success/failure binary and obvious.

**Application:** The §3.2 5-step MapCenterModal dismissal recipe is the canonical worked example of these rules — step 1 is the pre-wait, step 5 is the post-assert. Any new modal-bypass helper inherits the same shape: pre-wait → interact → post-assert-hidden.

**Field-test evidence:** UC-0009 spawn 1 RED on first run because gemini-CLI-authored `bypassModal()` had `isVisible()` race (omitted pre-wait). Self-heal v1 added the pre-wait (1-retry); landed GREEN. Twice-proven pattern (UC-0008 §0.1 traps + UC-0009 §0.4 modal-bypass).

---

## 1. Glossary

| Term | Meaning |
|---|---|
| **NU** | NamedUser — default post-signup role; lowest tier |
| **SL** | Spotlighter — between NU and RO; bundled into RO via TIEMPO-443 invariant |
| **RO** | RegionalOrganizer — content tier; can create/manage own events |
| **RA** | RegionalAdmin — admin tier scoped to region/division/city |
| **SA** | SystemAdmin — system-wide admin |
| **SO** | SystemOwner — top-tier (TT taxonomy; rarely used in tests) |
| **Pattern A** | Persistent test user `tango.tiempo.test@gmail.com` at `appId="99"`; partition isolation; reset-test-user resets MongoDB |
| **Pattern B** | Ephemeral per-correlation test user via Gmail aliasing `tango.tiempo.test+{correlationId}@gmail.com` at `appId="1"`; markers `isE2ETestUser` + `_testCorrelationId` carry test-membership; cleanup via `delete-test-user-by-correlation` |
| **`appId="99"`** | Test partition (Pattern A); `reset-orphans` sweeps |
| **`appId="1"`** | Real-app TT production data partition; Pattern B writes here with markers |
| **`_testFixtureKey`** | Stable resolve-by-key field for Pattern A fixtures (`E2EORG`, `E2EUSER`, `ROLE_NU`, etc.) |
| **`_testCorrelationId`** | Per-spawn marker for Pattern B; `${UC_ID}-${ts}-${rand4hex}` format per ADR-0004 |

---

## 2. Role Taxonomy

### 2.1 Role canonical names + codes

Confirmed via Fulton mongosh 2026-05-06 against `roles` collection:

| Role | `roleName` | `roleNameCode` | Tier |
|---|---|---|---|
| NamedUser | `"NamedUser"` | `"NU"` | content (default) |
| Spotlighter | `"Spotlighter"` | `"SL"` | content (between NU/RO) |
| RegionalOrganizer | `"RegionalOrganizer"` | `"RO"` | content |
| RegionalAdmin | `"RegionalAdmin"` | `"RA"` | admin |
| SystemAdmin | `"SystemAdmin"` | `"SA"` | system |
| SystemOwner | `"SystemOwner"` | `"SO"` | system |

**ROLE_DISPLAY_ORDER** (`SiteMenuBarUserDrawer.js:38`):
```js
['NamedUser', 'Spotlighter', 'RegionalOrganizer', 'RegionalAdmin', 'SystemAdmin', 'SystemOwner']
```

**Display map** (`SiteMenuBarUserDrawer.js:54-61`):
```js
{
  'NamedUser': 'Milonger@',
  'Spotlighter': 'Spotlighter',
  'RegionalOrganizer': 'Organizer/Artist',
  'RegionalAdmin': 'RegionalAdmin',
  'SystemAdmin': 'SystemAdmin',
  'SystemOwner': 'SystemOwner'
}
```

Note: `NamedUser` displays as **"Milonger@"** in TT FE UI — so testing `getByText("Milonger@")` works for NU display assertion.

**CalOps frontend gotcha:** CalOps `useRoles.js:226-229` hardcodes legacy codes `SYA / RGA / RGO` — these are dead code per Fulton mongosh (no DB doc matches). Use `roleName` full canonical for resolve-by-name; both schemes work at DB layer.

### 2.2 Role-bundling invariants

**TIEMPO-443 invariant (`UserSettingsApply.js:78,230-232`):**
- Apply-as-organizer flow PUTs `roleIds: [NU._id, SL._id, RO._id]` (full array, SET semantics — REPLACES `roleIds[]`)
- "NU + Spotlighter + RO so applying never orphans the user to RO-only"
- Real-flow apply ALWAYS bundles SL with RO; test-mutator `elevate-test-user-role` MUST honor

**RA invariants (Dash CalOps grep + Sarah confirm):**
- NU→RA does NOT bundle SL (RA is admin-tier, orthogonal to content-tier Spotlighter)
- RA stands alone with NU: `roleIds: [NU._id, RA._id]`
- RO→RA preserves `regionalOrganizerInfo`: `roleIds: [NU._id, SL._id, RO._id, RA._id]`

### 2.3 Sidecar info structure

**`regionalOrganizerInfo` (RO state):**
- `organizerId` — link to organizer doc
- `isActive: true` (TIEMPO-442 stopgap activates at apply time when minimums met)
- `isApproved: true` (set by CalOps admin OR atomic createOrganizer)
- `isEnabled: true` (set by CalOps admin OR atomic createOrganizer; TT FE does NOT write this in apply flow)
- `allowedMasteredRegionIds[]` — region scope (CalOps `createOrganizer` sets)

**`localAdminInfo` (RA state) — backend canonical name; CalOps UI alias = `regionalAdminInfo`:**
- `isActive` / `isApproved` / `isEnabled` triumvirate (ALL 3 must be true for permission gate)
- `allowedAdminMasteredRegionIds[]` — region admin scope
- `allowedAdminMasteredDivisionIds[]` — division admin scope
- `allowedAdminMasteredCityIds[]` — city admin scope
- Permission check is OR across 3 arrays; minimum 1 ObjectId in ≥1 array required for effective access

**FE/BE field-name asymmetry (CRITICAL):** backend stores `localAdminInfo`; CalOps UI presents as `regionalAdminInfo` via `useUsers.js:85+473-474` UI↔BE rename. Test-mutator MUST write `localAdminInfo`. AuthContext.js:170-178 reads via `regionalAdminInfo` (FE-side rename happens in BE GET handler).

### 2.4 Role-aware UI surfaces

**Spotlighter-specific UI:**
- TIEMPO-433: SpotlightOnlyModal for event clicks (stripped-down view; image controls hidden)
- TIEMPO-436: Spotlighter mirrors RO menu structure but limited capabilities
- TIEMPO-438: EditOccurrenceModal hides image tab when `role === 'Spotlighter'`

**RO event-creation surface:**
- `CreateEventDetailModal.js:934,938` — multi-day-event toggle requires `selectedRole === 'RegionalOrganizer' || selectedRole === 'RegionalAdmin'`
- "Apply for Event Organizer" button (UserSettingsApply) — only visible/enabled for users without RO role yet

**RA admin-only surfaces:**
- `RegionalOrganizersModal.js` — admin can edit other users' organizer records (Profile / Settings / Status tabs)
- `permissions.js:canManageEventsInLocation:215-237` — OR-permission across allowedAdmin* arrays

---

## 3. Navigation Flow

### 3.1 Cold-nav entry sequence

**Initial page load (cold-nav, no localStorage / sessionStorage / cookies):**

1. `GET /` (or `GET /calendar`) → Next.js renders SSR shell
2. Client-side hydration → AuthContext initializes
3. `onAuthStateChanged` fires → user is `null` (cold-nav has no Firebase session)
4. **MapCenterModal** opens automatically if user has no saved geolocation OR is anonymous → user picks city

**Post-login cold-nav:** MapCenterModal still opens if no `userDefaults.region` set on userLogins doc.

### 3.2 MapCenterModal (`src/app/components/Modals/misc/MapCenterModal.js`)

**Selectors:**
- Modal root: `[data-testid="map-center-modal"]` (line 829)
- Close button: `[data-testid="map-center-close"]` (line 848)
- City search input: `[data-testid="map-center-city-search"]` (line 1011)
- City option: `[data-testid="city-option-{cityname-kebab}"]` (line 1028; e.g., `city-option-boston`)
- Save button: `[data-testid="map-center-save"]` (line 908; disabled until centerLat/Lng set)
- "Use my location" button: `[data-testid="map-center-use-my-location"]` (line 981)

**Submit-disabled logic (line 906):**
```js
disabled={loading || !centerLat || !centerLng}
```

**Common dismissal pattern in tests:**
1. Wait for `[data-testid="map-center-modal"]` to render
2. Click `[data-testid="map-center-city-search"]` and type "Boston" (or test default city)
3. Click `[data-testid="city-option-boston"]`
4. Click `[data-testid="map-center-save"]`
5. Modal closes; calendar view renders

**Onboarding variant:** `MapCenterOnboardingModal.js` — shown once per session for first-time geolocation setup.

### 3.3 Top nav (`src/app/components/UI/SiteMenuBar.js` + `SiteHeader.js`)

Top bar contains:
- Brand mark (left)
- Region/city pill (`CityPill.js` + `RegionMenu.js`) — click to re-open MapCenterModal
- Mode toggle (`ModeToggle.js`) — switch between calendar views
- Calendar submenu (`CalendarSubMenu.js`) — view options
- User avatar (right) — opens user drawer

### 3.4 User drawer (`SiteMenuBarUserDrawer.js`)

Opens via avatar click on top bar. Drawer contents (lines 156-396):

**For NOT logged-in users:**
- "Sign In" button → `/auth/login`
- "Create Account" button → `/auth/signup`

**For logged-in users:**
- Avatar + display name
- Role selector (radio/dropdown) — switch between user's `roleIds` (sorted via ROLE_DISPLAY_ORDER)
- Menu items (vary by role):
  - **All:** "User Settings" (opens UserSettingsModal)
  - **All:** "Logout"
  - **Messages tab:** unread count badge; clicks open MessageModal
  - **RO/RA:** organizer-management items (link to RegionalOrganizersModal)
  - **SA/SO:** system admin items

### 3.5 Calendar views (custom FullCalendar)

Per memory `project_tt_custom_calendar_views.md`:

| View | When | Selectors |
|---|---|---|
| `dayGrid8Week` | Desktop (≥768px); custom 8-week grid | `.fc-daygrid-day[data-date="YYYY-MM-DD"]`; events render in `.fc-daygrid-event` |
| `list21Days` | Mobile (<768px); custom 21-day list | `.fc-list-day` headers; `.fc-list-event` rows |
| `dayGridMonth` | Available; not default | Standard FullCalendar month grid |
| `listMonth` | Available; not default | Standard FullCalendar list view |

**For date-nav UCs:** use `[data-date="YYYY-MM-DD"]` attributes on `.fc-daygrid-day` cells. Do NOT use `.fc-toolbar-title` or `calendar-title` testid — those don't exist in TT custom views.

---

## 4. Authentication Forms

### 4.1 Signup form (`/auth/signup` → `EmailAuthForm.js mode="signup"`)

**Page structure (`signup/page.js`):**
- `[data-testid="signup-page"]` — page header
- `[data-testid="google-signup-button"]` — Google OAuth path
- `[data-testid="email-signup-button"]` — opens EmailAuthForm
- Apple signup button (no testid; `<AppleIcon>` text)
- Facebook signup: disabled ("Coming Soon")

**EmailAuthForm structure (`src/app/components/EmailAuthForm.js`):**
- Form root: `[data-testid="email-auth-form"]` (line 104)
- Fields (use `getByLabel` since no `name=` testids):
  | Field | Selector | Required (signup) | Min length / format |
  |---|---|---|---|
  | First Name | `getByLabel("First Name")` / `input[name="firstName"]` | YES | non-empty |
  | Last Name | `getByLabel("Last Name")` / `input[name="lastName"]` | YES | non-empty |
  | Email | `getByLabel("Email Address")` / `input[name="email"]` | YES | regex `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
  | Password | `getByLabel("Password")` / `input[name="password"]` | YES | regex `/^(?=.*[A-Za-z])(?=.*\d).{8,}$/` (≥8 chars, ≥1 letter, ≥1 number) |
  | Confirm Password | `getByLabel("Confirm Password")` / `input[name="confirmPassword"]` | **YES** (signup-only via `{isSignUp && (...)}` conditional, line 191) | MUST equal password value |

- Submit button: `button[type="submit"]` (line 219); text "Sign Up" / "Signing Up..."

**Validation order (`handleSubmit` lines 46-101; first match returns):**
1. Email + password missing → "Email and password are required"
2. Email regex fail → "Please enter a valid email address"
3. firstName + lastName missing (signup) → "First name and last name are required"
4. password ≠ confirmPassword (signup) → "Passwords do not match"
5. password regex fail (signup) → "Password must be at least 8 characters long and contain at least one letter and one number"

**No CAPTCHA**. Confirmed via grep — zero `captcha`/`reCAPTCHA` references. Clean E2E surface.

**Side-effects on signup completion (`AuthContext.js:548-616`):**
1. Firebase `createUserWithEmailAndPassword`
2. `updateProfile(firebaseUser, { displayName })` — derived from firstName + lastName
3. **`sendEmailVerification(firebaseUser)`** ← fires automatically; rate-limited to aliased Gmail (Pattern B Gotcha 1: inbox pollution at scale)
4. `handleBackendUser(firebaseUser)` → POST `/api/userlogins/` (creates userLogins doc; BE assigns NU role)
5. `setUserData(firebaseUser)` → fetches userLogins via GET `/api/userlogins/firebase/{uid}?appId=1` + populates user context
6. Redirect → `/calendar` (`signup/page.js:39`)

**Post-redirect state:** user is `NamedUser` (NU); `roleIds: [<NU._id>]`; no `regionalOrganizerInfo` populated.

**Bootstrap self-heal (TIEMPO-453, landed 2026-05-06 commit `64c243d9`):** if `setUserData` GET returns 404 (BE userLogins doc missing — happens on `onAuthStateChanged` auto-restore for sessions without backing record), self-heal calls `handleBackendUser` POST + re-GET. Pre-fix: `userData` stayed null → "Apply" button disabled forever.

### 4.2 Login form (`/auth/login` → `EmailAuthForm.js mode="login"`)

Same EmailAuthForm component, mode-toggled. Confirm Password field hidden in login mode.

### 4.3 Password reset flow

`auth/action/page.js` handles Firebase action codes (mode `verifyEmail` / `resetPassword`). Out of scope for current Phase B UCs.

---

## 5. UserSettings Modal (`src/app/components/Modals/UserSettings/UserSettingsModal.js`)

**Open via:** user drawer → "User Settings" menu item.

**Tabs (lines 78-110):**
- `Name` — profile editing (UserSettingsName.js)
- `Bookmarks` — saved events/organizers
- **`Apply`** — apply-as-organizer (THE form covered in §6)
- `GeoLocation` — re-open MapCenterModal logic
- `LocationPreferences`
- `Notifications` — notification settings
- `Organizers` — list user's organizer memberships
- `Favorites` — favorite organizers/events

Each tab is a separate component (e.g., `UserSettingsApply.js`, `UserSettingsName.js`).

---

## 6. Apply-as-Organizer Form (`UserSettingsApply.js`)

**THE deepest form Gauge spawns interact with.** Critical for UC-0003 + future RO-elevation UCs.

### 6.1 Modal location

Lives inside UserSettingsModal as the `Apply` tab. Open sequence:
1. Click user avatar in top bar → user drawer opens
2. Click "User Settings" menu item → UserSettingsModal opens
3. Click `Apply` tab → UserSettingsApply renders

### 6.2 Form fields

| Field | Label | Selector | Min length | Auto-seeded? |
|---|---|---|---|---|
| Organizer Name | "Organizer Name" | `getByLabel("Organizer Name")` | ≥7 chars trimmed | YES — auto-seeds from `localUserInfo.firstName + " " + lastName` (`useEffect` line 118-123); only fires if `!hasOrganizerId && userData && !organizerName`; race condition possible |
| Short Name | "Short Name" | `getByLabel("Short Name")` | ≥3 chars | YES — auto-probes unique candidate via `probeShortNameUnique()` (line 129-134); `validateShortName()` rules + availability check |
| Description | "Description" | `getByLabel("Description")` | **≥10 chars trimmed** | **NO — must fill explicitly** (TIEMPO-442 stopgap requirement) |

### 6.3 Submit-disabled logic (verbatim lines 470-478)

```js
disabled={
  isLoading ||                              // userDataLoading || rolesLoading || applicationStatus === 'loading'
  !userData ||                              // userData fetched
  !regionalOrganizerRole ||                 // RegionalOrganizer doc found in roles fetch
  organizerName.trim().length < 7 ||
  shortName.trim().length < 3 ||
  shortNameStatus.available === false ||   // NOT explicitly false (null OR true OK)
  description.trim().length < 10
}
```

**Submit button:** "Apply for Event Organizer" → `getByRole('button', { name: 'Apply for Event Organizer' })` (line 482); changes to "Applying..." while loading.

### 6.4 Async validators

**Short Name async probe (`handleShortNameBlur` lines 146-178):**
- Triggers on blur of Short Name field
- Client-side `validateShortName()` rules first (TIEMPO-455):
  - Length 3-12 chars (max bumped from 9 to 12 per TIEMPO-455)
  - Letter-first 3 chars (no leading digits/hyphens)
  - Hyphen rules (no leading/trailing/consecutive)
  - Reserved words: `CHANGE` (BE-side per `validateShortName`), `TANGO` (FE-stricter overlay, line 160-163)
- If client validation passes, GET `/api/organizers/shortname-check?appId=1&candidate=<name>` (line 167)
- 4 status states: `{ checking, available, message }`
  - Initial `available: null` (not blurred yet)
  - During probe `checking: true`, `message: 'Checking…'`
  - On 200 + available: `available: true`, `message: 'Available'`
  - On 200 + taken: `available: false`, `message: 'Already taken — try a variation'`
  - On rule-fail: `available: false`, `message: <ruleCheck.message>`
  - On network error: `available: null`, `message: ''` (POST will surface 409 on actual collision)

**Submit button is disabled ONLY when `available === false`. `null` and `true` both allow submit.**

### 6.5 Click-order to submit (defensive POM recipe)

```typescript
// 1. Open path: avatar → User Settings → Apply tab
await page.click('[avatar selector]');                  // top-bar avatar
await page.click('text=User Settings');                 // user drawer item
await page.click('button[role="tab"]:has-text("Apply")'); // tab in modal

// 2. Wait for form to render + auto-seeds to fire
await page.waitForSelector('label:has-text("Organizer Name")');

// 3. Verify auto-seed populated organizerName (defensive — fill if not)
const orgNameVal = await page.getByLabel('Organizer Name').inputValue();
if (!orgNameVal || orgNameVal.trim().length < 7) {
  await page.getByLabel('Organizer Name').fill('E2E Test Organizer');  // ≥7 chars fallback
}

// 4. Verify shortName has value + Available status
const shortNameVal = await page.getByLabel('Short Name').inputValue();
if (!shortNameVal) {
  await page.getByLabel('Short Name').fill('E2EORG' + String(Math.floor(Math.random()*1000)));
  await page.getByLabel('Short Name').blur();  // triggers handleShortNameBlur
}
await page.waitForSelector('text=Available', { timeout: 5000 });

// 5. Fill description (≥10 chars; no auto-seed)
await page.getByLabel('Description').fill('E2E test organizer for automated testing');

// 6. Click Apply
await page.getByRole('button', { name: 'Apply for Event Organizer' }).click();

// 7. Wait for either success or error state
//    Success: applicationStatus → 'success' shows alert
//    Error: errorMessage state populates Alert
```

### 6.6 Race conditions to watch for

**organizerName auto-seed race** (root cause of UC-0003 spawn 1 partial pass):
- Effect at line 118-123 fires only when `userData` populated AND `organizerName` empty
- If modal opens BEFORE `useUsers` hook completes first fetch → effect doesn't fire → field stays empty → submit disabled silently
- **Defense:** explicit fill if input value < 7 chars after timeout
- **Underlying issue:** TIEMPO-453 (FE bootstrap self-heal) — `userData` could be null due to GET-404 on auto-restore. Landed 2026-05-06 commit `64c243d9`; TEST tier deployed.

**`regionalOrganizerRole` race:** RoleContext / `useRoles` fetches `/api/roles?appId=1` on mount; `regionalOrganizerRole` resolved by `roles.find(r => r.roleName === 'RegionalOrganizer')`. If apply modal opens before fetch completes, `regionalOrganizerRole` is null → submit disabled.

**`isLoading` stuck true:** any of `userDataLoading || rolesLoading || applicationStatus === 'loading'`. Wait for all three to clear.

### 6.7 Submit handler side-effects (`handleApply` lines 180-380)

After client validation passes (lines 187-211 — same checks as disabled prop):

1. PUT `/api/userlogins/{firebaseUserId}/roles` with `roleIds: [...existing, NU._id, SL._id, RO._id]` (TIEMPO-443 bundle)
2. POST `/api/organizers/` (or wherever createOrganizer routes) with full organizer payload:
   ```js
   {
     linkedUserLogin, firebaseUserId, name, fullName, shortName,
     description,
     contactEmail,  // from user.email
     organizerRegion,  // optional, from localUserInfo.userDefaults.region
     isActive: true, isEnabled: true, wantRender: true,  // TIEMPO-442 stopgap
     organizerTypes: { isEventOrganizer: true, ... }
   }
   ```
3. Update userLogins `regionalOrganizerInfo`: `{ organizerId, isApproved: true, isEnabled: true, isActive: true, ApprovalDate, allowedMasteredCityIds: [], allowedMasteredDivisionIds: [] }`
4. ROTermsModal flow (separate; agreement step post-apply)
5. Activity logs: `logActivity('ROLE_APPLICATION', ...)` + `logRoleChange('NamedUser', 'RegionalOrganizer', ...)`

---

## 7. Event Creation Modals (`CreateEventDetailModal.js`)

### 7.1 Modal location

**Selector:** `[data-testid="create-event-modal"]` (line 913).

**Open via:**
- RO/RA role: click "+" button on calendar OR menu "Create Event"
- Multi-day toggle: line 934,938 — disabled unless `selectedRole === 'RegionalOrganizer' || 'RegionalAdmin'`

### 7.2 Tab structure (lines 1007-1055)

| Tab | Value | Component | Required for save? |
|---|---|---|---|
| Basic | `basic` | `CreateEventDetailsBasic.js` | YES — name + date + venue + category + organizer |
| Repeating | `repeating` | `CreateEventDetailsRepeating.js` | conditional (only if recurring) |
| Image | `image` | `CreateEventDetailsImage.js` | optional |
| Spotlights | `spotlights` | `CreateEventDetailsSpotlights.js` | optional (TIEMPO-433 visibility per role) |
| Override Images | `overrideImages` | `CreateEventDetailsOverrideImages.js` | optional, RA-only |
| Grants | `grants` | `CreateEventDetailsGrants.js` | optional |
| Other | `other` | `CreateEventDetailsOther.js` | optional |

**Save button (line 1106):** `disabled={saving || !isFormValid()}`. `isFormValid()` validates Basic tab requirements.

### 7.3 RRULE / Recurring Events (`CreateEventDetailsRepeating.js`)

TT FE uses iCalendar RRULE strings. Per `CreateEventDetailsRepeating.js:14-145`:

**RRULE structure:**
```
FREQ=<DAILY|WEEKLY|MONTHLY|YEARLY>;BYDAY=<MO,TU,WE,TH,FR,SA,SU>;UNTIL=<YYYYMMDD>;COUNT=<n>;INTERVAL=<n>
```

**Examples:**
- Weekly Monday: `FREQ=WEEKLY;BYDAY=MO`
- 3rd Friday monthly: `FREQ=MONTHLY;BYDAY=3FR`
- Last Sunday monthly: `FREQ=MONTHLY;BYDAY=-1SU`
- Bi-weekly Wed: `FREQ=WEEKLY;BYDAY=WE;INTERVAL=2`

**FE state fields** (parsed from RRULE in `parseRRuleToUIFields` line 15):
- `frequency` — DAILY / WEEKLY / MONTHLY / YEARLY
- `daysOfWeek` — array of `MO`/`TU`/...
- `recurrenceCount` — number of occurrences
- `recurrenceEndDate` — terminal date (UNTIL)
- `monthlyByDay` — for monthly BYDAY (e.g., `3FR`)
- `interval` — repeat every N (default 1)

**End-date vs count exclusivity:** `calculateEndDateFromCount` and `calculateCountFromEndDate` helpers (lines 164-211) toggle between modes; UI exposes one or the other depending on user choice.

**For E2E recurring-event UCs:** drive the FE picker (frequency dropdown, day buttons, end-date/count toggle) rather than constructing RRULE strings directly. FE serializes to RRULE on save.

### 7.4 Role-gated event-creation features

| Feature | NU | SL | RO | RA |
|---|---|---|---|---|
| Create event button visible | NO | NO | YES | YES |
| Multi-day event toggle | N/A | N/A | YES | YES |
| Image upload | N/A | NO (TIEMPO-438 hides) | YES | YES |
| Override images tab | NO | NO | NO | YES (admin override) |
| Spotlights tab | NO | limited (TIEMPO-433) | YES | YES |
| Edit own organizer's events | N/A | limited (TIEMPO-436) | YES | YES (within scope) |
| Edit other organizers' events | NO | NO | NO | YES (within `allowedAdminMastered*Ids`) |

---

## 8. View Event Modal (`ViewEventDetailModal.js`)

**Selector:** `[data-testid="event-modal"]` (line 618).
**Content selector:** `[data-testid="event-modal-content"]` (line 619).

**Tabs (lines 837-840):** Basic / Venue / Organizer / Images.

**Spotlight-only variant:** `SpotlightOnlyModal.js` — TIEMPO-433; opens directly when `selectedRole === 'Spotlighter'` clicks an event.

**Edit occurrence:** `EditOccurrenceModal.js`:
- Role-aware: `role={'RegionalOrganizer' | 'Spotlighter'}` prop (line 617-618)
- Spotlighter mode hides image tab + image controls (TIEMPO-438 lines 389, 516)

---

## 9. RegionalOrganizers Admin Modal (`RegionalOrganizersModal.js`)

Admin-only flow for RA / SA to manage other organizers.

**Tabs (lines 159-161):**
- `Profile` — OrganizerProfileTab.js
- `Settings` — OrganizerSettingsTab.js
- `Status` — OrganizerStatusTab.js (approval/disable workflows)

**Save handler:** `handleSaveAll` (line 131) — disabled prop tracks form-validity.

Files in directory:
- `RegionalOrganizersModal.js` — top-level
- `RegionalOrganizerSelection.js` — pick organizer to manage
- `RegionalOrganizersName.js` / `Address.js` / `Settings.js` / `Status.js` / `Profile.js` / `Types.js` / `PrimaryLocations.js` / `ProfileImages.js` / `Images.js` / `Search.js` / `Delegated.js` — sub-forms

---

## 10. SystemAdmin Modal (`src/app/components/Modals/SystemAdmin/`)

SA-only system admin surface. Out of scope for Phase B UCs (no current UC exercises SA flows).

Files: `SystemAdminUserLogin.js` + likely a parent modal.

---

## 11. Modal Taxonomy Reference (data-testid lookup)

| `data-testid` | Modal | File |
|---|---|---|
| `signup-page` | Signup page header | `auth/signup/page.js:173` |
| `email-auth-form` | Email signup/login form | `EmailAuthForm.js:104` |
| `email-signup-button` | Switch from OAuth list to email form | `auth/signup/page.js:277` |
| `google-signup-button` | Google OAuth button | `auth/signup/page.js:217` |
| `map-center-modal` | MapCenterModal | `MapCenterModal.js:829` |
| `map-center-close` | Close button | `MapCenterModal.js:848` |
| `map-center-save` | Save city selection | `MapCenterModal.js:908` |
| `map-center-city-search` | City search input | `MapCenterModal.js:1011` |
| `map-center-use-my-location` | Use browser geo | `MapCenterModal.js:981` |
| `city-option-{name}` | City option in search results | `MapCenterModal.js:1028` |
| `create-event-modal` | Event creation modal | `CreateEventDetailModal.js:913` |
| `event-modal` | View event modal | `ViewEventDetailModal.js:618` |
| `event-modal-content` | View event content | `ViewEventDetailModal.js:619` |

**Additional discovered selectors** (no testid; use label/role):
- UserSettingsModal: open via user drawer "User Settings" item; tabs by `<Tab label="...">`
- ApplyTab fields: `getByLabel("Organizer Name")` / `getByLabel("Short Name")` / `getByLabel("Description")`
- Apply submit button: `getByRole('button', { name: 'Apply for Event Organizer' })`
- RegionalOrganizersModal tabs: `<Tab label="Profile" / "Settings" / "Status">`

---

## 12. Auto-Seed Behaviors + Race Conditions (CRITICAL FOR GAUGE)

| Field | Auto-seed source | Race condition | Defense |
|---|---|---|---|
| `organizerName` (apply form) | `localUserInfo.firstName + " " + lastName` (`UserSettingsApply.js:118-123`) | Effect fires only when `!hasOrganizerId && userData && !organizerName`; race if modal opens before userData hydrates | Wait for input value; defensive fill if empty |
| `shortName` (apply form) | `probeShortNameUnique(firstName+lastInitial)` (`UserSettingsApply.js:129-134`) | Async network call; modal can render before probe completes | Wait for value or fill manually + blur |
| `displayName` (Firebase) | `firstName + " " + lastName` post-signup (`AuthContext.js:561-563`) | Stamped in `updateProfile` call before redirect | Generally safe; populated by signup completion |
| `roleIds[]` (FE state) | Backend POST returns 201 → setUserData fetches doc + populates user context | Read-after-write race possible if BE replica lag | TIEMPO-453 self-heal handles 404 case |
| `selectedRole` (RoleContext) | First role from `user.roles` array OR 'NamedUser' if available (`AuthContext.js:204-212`) | Set after setUserData completes | Wait for user object |

---

## 13. AuthContext Bootstrap & Self-Heal

### 13.1 Bootstrap paths

**Path A — explicit signup/signin** (`AuthContext.js:548-616`):
1. `createUserWithEmailAndPassword` (or OAuth)
2. `updateProfile`
3. `sendEmailVerification` (auto-fires; rate-limited)
4. `handleBackendUser(firebaseUser)` — GET userlogins; on 404 POST to create
5. `setUserData(firebaseUser)` — fetches userlogins + populates user/roles
6. `router.push('/calendar')`

**Path B — onAuthStateChanged auto-restore** (`AuthContext.js:52-68`):
1. Firebase SDK fires `onAuthStateChanged` on page load if session cached
2. Direct call to `setUserData(firebaseUser)` — does NOT call handleBackendUser before
3. **Pre-TIEMPO-453:** if userlogins doc missing, GET 404 → setUserData throws → userData null → app broken
4. **Post-TIEMPO-453 (commit `64c243d9` on TEST 2026-05-06):** setUserData self-heals — on 404 calls handleBackendUser POST + re-GET

### 13.2 Bootstrap-broken symptoms (pre-TIEMPO-453)

If TIEMPO-453 fix not landed (or PROD-tier prior to M5 reauth bundle):
- `userData` stays null → all userData-gated UI silently disabled (Apply button, event creation, etc.)
- Console error: "Error fetching user data" / `error.response.status === 404`
- Recovery requires explicit re-signin (logout then login; signup also works)

### 13.3 TIEMPO-430 cross-app role filter

`AuthContext.js:186-192` — defensive filter that strips role docs whose `appId` doesn't match `process.env.NEXT_PUBLIC_APPLICATION_ID` (handles cross-app role leak).

`AnonymousUser` fallback (`AuthContext.js:236-249`): if backend GET fails entirely, set minimal user with `roles: ['AnonymousUser']`. This is a defensive fallback, NOT a real role.

---

## 14. API Endpoints Used by FE (Reference)

| Endpoint | Method | Use | Source |
|---|---|---|---|
| `/api/userlogins/firebase/{uid}?appId={appId}` | GET | Bootstrap; fetches userlogins doc | `AuthContext.js:148-178` |
| `/api/userlogins/` | POST | Create userlogins doc on first signup | `AuthContext.js:512` |
| `/api/userlogins/updateUserInfo` | PUT | Profile field updates | `useUserLogins.js:158` |
| `/api/userlogins/{firebaseUserId}/roles` | PUT | Role array mutations (apply flow) | `useUserLogins.js:165` |
| `/api/roles?appId={appId}` | GET | Fetch roles list (for resolve-by-name) | `useRoles.js:18-19` |
| `/api/organizers/shortname-check?appId={appId}&candidate={name}` | GET | Async shortname availability probe | `UserSettingsApply.js:167` |
| `/api/organizers/` | POST | Create organizer record (apply flow) | `useOrganizers` |

**Authorization:** all userlogins/organizers endpoints require Bearer token via `Authorization: Bearer <firebaseIdToken>`.

---

## 15. Test-Mutator Endpoints (Companion Reference)

For full reference see `calendar-be-af-test-mutators/` repo. Quick summary:

| Endpoint | Use | Pattern |
|---|---|---|
| `POST /api/test/preset-baseline` | Seeds `appId="99"` partition with manifest fixtures | Pattern A setup |
| `POST /api/test/reset-test-user` | Resets E2EUSER doc to NU baseline | Pattern A reset between UCs |
| `POST /api/test/reset-orphans` | Sweeps `appId="99"` non-fixture-key non-correlationId docs (with `$exists: true` belt+suspenders) | Pattern A cleanup |
| `POST /api/test/mark-test-user` | Stamps `isE2ETestUser` + `_testCorrelationId` markers + Firebase `emailVerified=true` (A2 design; bundled) | Pattern B post-signup |
| `POST /api/test/delete-test-user-by-correlation` | Cascade-deletes Firebase user + Mongo userLogins + organizer (`_testFixtureKey: "E2EORG-{correlationId}"`); supports `firebaseUserId` fallback for orphan-recovery | Pattern B cleanup |
| `POST /api/test/elevate-test-user-role` | Direct state-mutator for role transitions per role-elevation-matrix v1.0 | Pattern A or B (with appId param) |

---

## 16. Common UC Patterns

### 16.1 Pattern A persistent test user (E2EUSER)

```typescript
// Setup
await fetch('/api/test/preset-baseline', { method: 'POST' });
await fetch('/api/test/reset-test-user', { method: 'POST' });
// Bootstrap mints Firebase user via Admin SDK; UID captured to baseline/test-users.json
// E2EUSER lives at appId="99" with NU role; ready to test
```

### 16.2 Pattern B ephemeral signup-flow user (UC-0002 / UC-0003)

```typescript
const correlationId = `UC-XXXX-${ts}-${rand4hex}`;
const email = `tango.tiempo.test+${correlationId}@gmail.com`;

// signup via real flow
await authPo.signupAs({ email, password: 'E2EPass1!', firstName: 'E2E', lastName: `User-${rand4hex}` });

// post-stamp markers (closes Layer-3 REJECT gap)
await fetch('/api/test/mark-test-user', {
  method: 'POST',
  body: JSON.stringify({ firebaseUserId, correlationId, stampFirebaseEmailVerified: true, appId: '1' })
});

// UC body
await /* UC steps */;

// afterAll cleanup
await fetch('/api/test/delete-test-user-by-correlation', {
  method: 'POST',
  body: JSON.stringify({ correlationId, firebaseUserId, appId: '1' })  // pass both for orphan-recovery fallback
});
```

### 16.3 Wait-for-auth-ready helper (proposed `auth.po.ts.waitForAuthReady()`)

```typescript
async function waitForAuthReady(page, { timeout = 10000 } = {}) {
  // Wait for redirect stability (URL not in flux)
  const startUrl = page.url();
  await page.waitForURL(url => url === startUrl, { timeout: 5000 }).catch(() => {});
  
  // Wait for /api/userlogins fetch to complete (introspect via Bearer token)
  const idToken = await page.evaluate(() => window.firebase?.auth?.()?.currentUser?.getIdToken?.());
  await page.waitForFunction(async (token, appId) => {
    const res = await fetch(`/api/userlogins/firebase/${token.uid}?appId=${appId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);
    if (!res) return false;
    const data = await res.json();
    return data.roleIds?.length > 0;
  }, [idToken, '1'], { timeout });
}
```

(Sprint 2 retro candidate; encoding `auth.po.ts` utility per Quinn 23:40 surface.)

---

## 17. Memories + Cross-Session Knowledge

Sarah-side persistent memories (`~/.claude/projects/.../memory/`):
- `project_e2e_pattern_a_vs_b_partition_asymmetry.md` — Pattern A vs B partition strategy
- `project_tt_custom_calendar_views.md` — TT custom FullCalendar view selectors
- `project_mastered_cities_shared.md` — mastered* collections are global, not per-appId
- `feedback_no_location_fallback.md` — no fallback for location/city/country/region fields
- `feedback_ftpntd.md` — Fix The Process Not The Data principle
- `feedback_deploy_timing.md` — Verify deploy-live before reporting backend contract bugs

---

## 18. Living-Doc Protocol

**When to update this doc:**
- New form lands in TT FE → add §6-equivalent section
- New modal added → add to §11 modal taxonomy
- New role added → update §2 role taxonomy
- Validation rule changes → update relevant field row
- New `data-testid` added → update §11
- Auto-seed behavior changes → update §12

**Owner:** Sarah (TT FE persona) — primary author. Quinn (framework lane) — relay/mirror to e2e-calendar-framework if desired.

**Versioning:** semantic-ish: bump minor for new sections; bump patch for selector/value updates. Track in change log below.

**Discovery protocol:** when Gauge spawns surface POM gaps OR forms misbehave, root-cause via this doc first; if doc is incomplete or stale, file a Sarah-update + commit fix here adjacent to the code change.

### 18.1 FTPNTD self-application (Sarah maintenance commitment)

Per Sprint 4 charter directive (FTPNTD-on-self), TT custom-view selector divergence has been three-layer-fixed:

| Layer | Fix |
|---|---|
| **Data** | Memory entry `project_tt_custom_calendar_views.md` records `dayGrid8Week` / `list21Days` and the absent-`.fc-toolbar-title` trap |
| **Code-process** | §0 Selector Quick Reference + §0.1 Known Selector Traps (this doc, v0.2) — fast-lookup so Gauge sees the trap before authoring, not after a heal cycle |
| **Team-human** | **Standing maintenance rule:** any TT FE PR that adds/removes/renames a `data-testid`, label-based form field, or modal surface MUST update §0 (Quick Reference) + §11 (Modal Taxonomy) in the same commit. Discovery via Gauge spawn = file a Sarah-update issue + same-PR fix. Reviewer enforces. |

**Cross-app template signal:** other app personas (Cord/Compás/Dash) can copy this doc's §0 pattern as a fast-lookup template — selector trap surface is per-app but the format scales.

---

## 19. Change Log

- **v0.3** (2026-05-07T17:08 UTC) — Sarah added §0.4 Modal-bypass standard pattern with two REQUIRED rules (pre-wait `waitForSelector` before visibility check; post-bypass `toBeHidden` assertion). Field-tested via UC-0009 self-heal v1 (Phase C Exit DoD data point #2 GREEN). Pattern proposed by Quinn 2026-05-07T17:04Z under same-day-turnaround protocol established in v0.2. Twice-proven §0 cross-app template signal: UC-0008 §0.1 (traps) + UC-0009 §0.4 (modal-bypass). Stacked on v0.2 PR #355.
- **v0.2** (2026-05-07T16:45 UTC) — Sarah added §0 Selector Quick Reference + §0.1 Known Selector Traps + §0.2 Selector cheat-sheet by surface + §0.3 Pattern A vs B selector note. Audit code-process fix for TT custom-view selector divergence (Sprint 4 motion 5 per Number2 broadcast 16:30Z; framework-as-product / scale-readiness framing). Added §18.1 FTPNTD self-application + standing maintenance rule. No content removed; existing sections untouched.
- **v0.1** (2026-05-06T23:55 UTC) — Sarah initial draft per Toby directive 23:50 via Number2. Comprehensive scout of TT FE form/modal/role surface; covers signup / login / apply-as-organizer / event-creation / event-view / RegionalOrganizers admin / role taxonomy / RRULE / modal taxonomy / auto-seed race conditions / bootstrap self-heal / API endpoints / test-mutator companion reference / common UC patterns / wait-for-auth-ready proposal. Phase B Exit retrospective material; living doc.
