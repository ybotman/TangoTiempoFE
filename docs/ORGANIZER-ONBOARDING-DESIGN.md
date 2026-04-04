# Organizer Onboarding via Outreach Link — Detailed Design

**Created**: 2026-04-03
**Author**: Sarah (TangoTiempo Frontend Agent)
**Status**: SIGNED OFF — All parties confirmed 2026-04-04
**Related Tickets**: TIEMPO-TBD (frontend), CALBEAF-TBD (backend)

---

## 1. Storage Decision

**Answer: MongoDB.**

The entire existing stack uses MongoDB via calendar-be-af (Azure Functions backend):
- `userlogins` collection — user accounts, roles, `regionalOrganizerInfo`
- `organizers` collection — organizer profiles, types, regions
- Firebase is used for **auth only** (Google, Facebook, Apple, Email/Password)
- Firestore is initialized in `firebase.js` but not used for organizer/user data

All three new storage needs use MongoDB:

| Need | Collection | Rationale |
|------|-----------|-----------|
| Onboarding status | `organizers` (new field) | Already has organizer lifecycle fields |
| Outreach tokens | `outreach_tokens` (new) | Short-lived, queried by token value |
| Funnel tracking | `outreach_tracking` (new) | Event log for AIDI/Dash analytics |

---

## 2. Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AIDI generates outreach link via POST /api/outreach/generate-link         │
│  → Returns: https://tangotiempo.com/organizers/apply?ref=outreach&orgToken=abc123 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. CLICK: Organizer clicks link                                           │
│     - Lands on /organizers/apply?ref=outreach&orgToken=abc123              │
│     - Sarah reads orgToken from URL search params                          │
│     - Token stored in sessionStorage (survives auth redirect)              │
│     - Fulton logs "link_clicked" event to outreach_tracking                │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. AUTH GATE: Firebase login/signup (if not authenticated)                 │
│     - Show Firebase auth UI (Google, Email, Apple, Facebook)               │
│     - Token persists in sessionStorage through auth redirect               │
│     - On auth success → proceed to step 3                                  │
│     - On auth fail → show error, allow retry                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. RESOLVE TOKEN: Sarah calls GET /api/outreach/resolve-token?token=abc123│
│     - Returns pre-fill data: orgName, contactEmail, region, orgType, etc.  │
│     - Returns metadata: campaign_id, source, outreach context              │
│     - If token expired/invalid → show friendly error with manual apply CTA │
│     - Fulton logs "form_opened" event to outreach_tracking                 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. SIMPLE FORM: Single-page form (NOT tabs, NOT multi-step wizard)        │
│     - Pre-filled fields from token data (editable)                         │
│     - Minimal required fields (only what we don't already know)            │
│     - ROE terms acceptance inline (checkbox, not separate modal)           │
│     - Single "Submit Application" button                                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. SUBMIT: Sarah calls existing organizer creation flow                   │
│     - Creates organizer record via POST /api/organizers                    │
│     - Updates user's regionalOrganizerInfo (role, approval, etc.)          │
│     - Fulton logs "application_submitted" event to outreach_tracking       │
│     - Token marked as "used" (single-use for submit)                       │
│     - Auto-approved (same as current flow)                                 │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  6. CONFIRMATION: Welcome screen                                           │
│     - "You're in!" confirmation message                                    │
│     - Quick links: Add your first event, Edit your profile                 │
│     - Fulton logs "onboarding_complete" event to outreach_tracking         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. API Contract

### 3a. Generate Outreach Link (AIDI → Fulton)

```
POST /api/outreach/generate-link
Auth: Service-to-service API key (X-Service-Key header)

Request:
{
  "appId": 1,                                // required: 1=TangoTiempo, 2=HarmonyJunction
  "orgName": "Buenos Aires Milonga Club",
  "contactName": "Maria Garcia",             // optional: contact person if differs from org name
  "contactEmail": "contact@bamilonga.com",
  "organizerType": "isEventOrganizer",
  "region": "South America",
  "regionId": "66c4d99042ec462ea22484bd",   // optional, if known
  "campaignId": "outreach-2026-q2",
  "source": "facebook_group",
  "sourceDetail": "BA Tango Events Group",
  "additionalData": {                        // optional pre-fill extras
    "city": "Buenos Aires",
    "website": "https://bamilonga.com"
  }
}

Response (201):
{
  "token": "abc123def456",
  "link": "https://tangotiempo.com/organizers/apply?ref=outreach&orgToken=abc123def456",
  "expiresAt": "2026-05-03T00:00:00Z",
  "tokenId": "663f..."
}
```

### 3b. Resolve Token (Sarah → Fulton)

```
GET /api/outreach/resolve-token?token=abc123def456
Auth: None (token is self-validating)

Response (200):
{
  "valid": true,
  "used": false,
  "expiresAt": "2026-05-03T00:00:00Z",
  "prefill": {
    "orgName": "Buenos Aires Milonga Club",
    "contactEmail": "contact@bamilonga.com",
    "organizerType": "isEventOrganizer",
    "region": "South America",
    "regionId": "66c4d99042ec462ea22484bd",
    "city": "Buenos Aires",
    "website": "https://bamilonga.com"
  },
  "metadata": {
    "campaignId": "outreach-2026-q2",
    "source": "facebook_group",
    "sourceDetail": "BA Tango Events Group"
  }
}

Error responses:
- 404: { "valid": false, "reason": "token_not_found" }
- 410: { "valid": false, "reason": "token_expired", "expiredAt": "..." }
- 409: { "valid": false, "reason": "token_already_used", "usedAt": "..." }
```

### 3c. Track Event (Sarah/AIDI → Fulton)

```
POST /api/outreach/track
Auth: None (includes token for context)

Request:
{
  "token": "abc123def456",
  "event": "link_clicked" | "form_opened" | "auth_completed" | "application_submitted" | "onboarding_complete",
  "firebaseUserId": "optional - included after auth",
  "timestamp": "2026-04-03T20:00:00Z"
}

Response (200):
{ "tracked": true }
```

### 3d. Outreach Status / Funnel (AIDI/Dash → Fulton)

```
GET /api/outreach/status?campaignId=outreach-2026-q2
Auth: Service-to-service API key (X-Service-Key header)

Response (200):
{
  "campaignId": "outreach-2026-q2",
  "funnel": {
    "links_generated": 45,
    "links_clicked": 28,
    "auth_completed": 18,
    "forms_opened": 16,
    "applications_submitted": 12,
    "onboarding_complete": 11
  },
  "tokens": [
    {
      "tokenId": "663f...",
      "orgName": "Buenos Aires Milonga Club",
      "status": "used",
      "events": ["link_clicked", "auth_completed", "application_submitted", "onboarding_complete"],
      "completedAt": "2026-04-03T21:00:00Z"
    }
  ]
}
```

---

## 4. Data Models

### 4a. `outreach_tokens` Collection (NEW)

```javascript
{
  _id: ObjectId,
  token: String,               // Opaque, URL-safe, unique (crypto.randomBytes)
  appId: Number,               // 1 = TangoTiempo, 2 = HarmonyJunction
  
  // Pre-fill data for the form
  prefill: {
    orgName: String,
    contactEmail: String,
    organizerType: String,     // e.g., "isEventOrganizer"
    region: String,
    regionId: String,          // MongoDB ObjectId ref
    city: String,
    website: String
  },
  
  // Outreach tracking metadata
  campaignId: String,
  source: String,              // e.g., "facebook_group", "email", "website"
  sourceDetail: String,        // e.g., group name or email campaign name
  
  // Lifecycle
  createdAt: Date,
  expiresAt: Date,             // 30 days from creation
  usedAt: Date | null,         // Set when application is submitted
  usedByFirebaseUserId: String | null,
  
  // Status
  status: "active" | "used" | "expired"
}

// Indexes:
// - { token: 1 } unique
// - { expiresAt: 1 } TTL index (auto-cleanup)
// - { campaignId: 1, status: 1 }
```

### 4b. `outreach_tracking` Collection (NEW)

```javascript
{
  _id: ObjectId,
  token: String,               // References outreach_tokens.token
  tokenId: ObjectId,           // References outreach_tokens._id
  appId: Number,
  campaignId: String,
  
  event: String,               // "link_clicked", "auth_completed", "form_opened", 
                               // "application_submitted", "onboarding_complete"
  
  firebaseUserId: String | null,  // Available after auth step
  organizerId: String | null,     // Available after submission
  
  timestamp: Date,
  metadata: Object              // Flexible: user agent, referrer, etc.
}

// Indexes:
// - { token: 1, event: 1 }
// - { campaignId: 1, event: 1 }
// - { timestamp: 1 }
```

### 4c. `organizers` Collection — New Field

```javascript
// Add to existing organizer schema:
{
  // ... existing fields ...
  
  onboardingStatus: String,    // "invited" | "applied" | "approved" | "setup" | "active"
  onboardingSource: String,    // "outreach" | "self_apply" | "admin_created"
  outreachTokenId: ObjectId | null  // Reference to outreach_tokens._id (if from outreach)
}
```

---

## 5. Pre-fill Field Mapping

| AIDI Provides | Token Stores As | Form Field | User Editable? | Fulton Stores As |
|---------------|-----------------|------------|----------------|------------------|
| Organization name | `prefill.orgName` | Organizer Name | Yes | `organizers.name` + `organizers.fullName` |
| Contact email | `prefill.contactEmail` | Contact Email | Yes | `organizers.contactEmail` |
| Organizer type | `prefill.organizerType` | Type selector (pre-selected) | Yes | `organizers.organizerTypes.{type}: true` |
| Region | `prefill.region` | Region display | No (auto from regionId) | `organizers.organizerRegion` |
| Region ID | `prefill.regionId` | Hidden | No | `organizers.organizerRegion` |
| City | `prefill.city` | City display | Informational | Not stored (derived from region) |
| Website | `prefill.website` | Website field | Yes | `organizers.website` |

**Fields NOT from token (collected on form):**
- Short Name (required, 3-12 chars, unique) — auto-generated suggestion from orgName
- Description (required, min 1 char) — brief textarea

**Fields auto-filled from Firebase auth:**
- Firebase User ID
- Auth email (fallback if no contactEmail from token)

---

## 6. Token Lifecycle

```
┌──────────┐    POST /generate-link     ┌──────────┐
│  (none)  │ ─────────────────────────► │  active  │
└──────────┘                            └────┬─────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        │                    │                    │
                   30 days pass      GET /resolve-token     Form submitted
                        │            (multi-read OK)              │
                        ▼                                         ▼
                 ┌──────────┐                              ┌──────────┐
                 │ expired  │                              │   used   │
                 └──────────┘                              └──────────┘
                 (TTL auto-delete                     (kept for audit,
                  after 90 days)                       usedAt + userId set)
```

**Key rules:**
- **Multi-read**: Token can be resolved multiple times (user might visit, leave, come back)
- **Single-use for submit**: Once an application is submitted with this token, it's marked `used`
- **30-day TTL**: Token expires 30 days after generation
- **Auth-redirect survival**: Token stored in `sessionStorage` on first page load, read back after Firebase auth redirect completes

**Token survival through Firebase auth:**

```javascript
// On page load (before auth check):
const searchParams = useSearchParams();
const orgToken = searchParams.get('orgToken');
const ref = searchParams.get('ref');

if (orgToken) {
  sessionStorage.setItem('outreach_orgToken', orgToken);
  sessionStorage.setItem('outreach_ref', ref || '');
}

// After auth completes (AuthContext fires):
const savedToken = sessionStorage.getItem('outreach_orgToken');
if (savedToken) {
  // Resolve token and pre-fill form
}
```

---

## 7. Error States

| Error | Trigger | User Sees | Recovery |
|-------|---------|-----------|----------|
| Token not found | Invalid/garbled URL | "This link isn't valid. You can still apply manually." + link to standard apply flow | Manual apply |
| Token expired | >30 days old | "This invitation has expired. You can still apply manually." + link to standard apply flow | Manual apply |
| Token already used | Someone already submitted with this token | "This invitation has already been used. If this was you, sign in to check your status." + link to status page | Sign in |
| Auth failure | Firebase error | Standard Firebase auth error message | Retry auth |
| Duplicate organizer | User already has an organizer record | "You're already an organizer! Here's your dashboard." + redirect | Dashboard |
| Backend unavailable | API timeout/500 | "We're having trouble right now. Please try again in a few minutes." | Retry |
| Missing required fields | Form validation | Inline field validation errors | Fix and resubmit |

---

## 8. Implementation Sequence

### Phase 1: Fulton (Backend) — CALBEAF-TBD
**No frontend dependencies. Can start immediately.**

1. Create `outreach_tokens` collection + schema + indexes
2. Create `outreach_tracking` collection + schema + indexes
3. `POST /api/outreach/generate-link` — token generation endpoint
4. `GET /api/outreach/resolve-token` — token resolution endpoint
5. `POST /api/outreach/track` — event tracking endpoint
6. `GET /api/outreach/status` — funnel status endpoint
7. Add `onboardingStatus`, `onboardingSource`, `outreachTokenId` fields to organizer schema
8. Service-to-service auth (API key validation middleware)

### Phase 2: Sarah (Frontend) — TIEMPO-TBD
**Blocked on**: Fulton Phase 1 items 3, 4, 5 (generate, resolve, track endpoints)

1. Token detection on `/organizers/apply` — read `orgToken` + `ref` from URL params
2. Token persistence in sessionStorage (auth redirect survival)
3. Call resolve-token endpoint after auth
4. New `OutreachApplyForm` component — single-page, pre-filled, simple
5. Inline ROE terms acceptance (checkbox, not modal)
6. Submit flow: create organizer with pre-filled + user-entered data
7. Track events at each step (click, auth, form open, submit, complete)
8. Error state handling (expired, used, invalid tokens)
9. Confirmation/welcome screen

### Phase 3: AIDI (Outreach Integration)
**Blocked on**: Fulton Phase 1 item 3 (generate-link endpoint)

1. Update `OUTREACH-SIGNUP-INTEGRATION.md` to reflect agreed strategy
2. Integrate `POST /api/outreach/generate-link` into outreach pipeline
3. Inject generated links into outreach emails/messages
4. Build funnel dashboard using `GET /api/outreach/status`

---

## 9. Frontend Component Architecture

```
/organizers/apply (page.js — existing)
├── OrganizerApplicationPortal.js (existing — add outreach detection)
│   ├── [Standard tabs — existing flow, unchanged]
│   │   ├── ApplicationFormTab.js
│   │   └── WhoCanApplyTab.js
│   │
│   └── [Outreach flow — NEW, shown when orgToken present]
│       └── OutreachApplyForm.js (NEW)
│           ├── Auth gate (if not logged in)
│           ├── Pre-filled form fields
│           ├── ROE terms checkbox
│           ├── Submit button
│           └── Confirmation/welcome view
```

**Key decision**: The existing `/organizers/apply` page with its tabs remains the default for organic visitors. When `orgToken` is present in the URL, `OrganizerApplicationPortal` renders `OutreachApplyForm` instead — a single, clean, pre-filled form with no tabs.

---

## Sign-off

| Agent | Status | Date |
|-------|--------|------|
| Sarah (Frontend) | ✅ SIGNED | 2026-04-03 |
| Fulton (Backend) | ✅ SIGNED | 2026-04-04 (pending resolve-token contract fixes — committing today) |
| AIDI (Outreach) | ✅ SIGNED | 2026-04-04 (via Quinn, coordinator; AIDI doc sync pending) |
| Gotan (Overseer) | ✅ SIGNED | 2026-04-04 |
