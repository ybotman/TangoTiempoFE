# TangoTiempo — Branding Implementation Plan
**Version 1.0 — 2026-04-29**
**Reference:** `docs/BRANDING-GUIDELINES.md` (app-level) · `MasterCalendar/docs/BRANDING-GUIDELINES.md` (cross-app)

---

## Priority Tiers

| Tier | What | Why |
|---|---|---|
| **P1 — SEO/OG** | Fix all OG image fallbacks | Every shared link uses TangoTiempo3.jpg — replace with proper brand asset |
| **P2 — UI touchpoints** | Explore icon, event detail fallback, about hero | Visible to all users on common paths |
| **P3 — Acquisition surfaces** | Welcome modal, apply page, organizer-facing messaging | Converts/retains users |
| **P4 — Future** | Ads/banners, splash screen, social stories | Requires content + copy decisions |

---

## P1 — SEO / OG Image Fixes

### 1. Root layout — add site-wide OG fallback
**File:** `src/app/layout.js`
**Current:** `metadata` has no `openGraph.images`
**Change:** Add OG image to the root metadata

```js
openGraph: {
  title: 'Tango Tiempo - The Premiere Argentine Tango Calendar',
  description: '...',
  url: 'https://tangotiempo.com',
  siteName: 'TangoTiempo',
  images: [{
    url: 'https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png',
    width: 1200,
    alt: 'TangoTiempo — Move. Connect. Belong.',
  }],
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  images: ['https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png'],
},
```

### 2. Event share page — OG fallback
**File:** `src/app/event/[id]/page.js`
**Current:** `DEFAULT_EVENT_IMAGE = '/images/TangoTiempo3.jpg'`
**Change:**
```js
const DEFAULT_EVENT_IMAGE = '/brand/Brand-Simple-Light-WIDE-1.png';
```
Also update `EventPageClient.js` line 16 to match.

### 3. Venue page — OG image
**File:** `src/app/venue/[id]/page.js`
**Current:** `TangoTiempo3.jpg` hardcoded
**Change:** Replace both instances with `/brand/Brand-Simple-Light-WIDE-1.png`

### 4. Organizer profile page — OG fallback
**File:** `src/app/organizers/[slug]/page.js`
**Current:** `'/default-image.jpg'` (broken path)
**Change:** Replace with `/brand/Brand-Simple-Light-WIDE-1.png`

### 5. Explore layout — add OG metadata
**File:** `src/app/explore/layout.js`
**Current:** Check if metadata is exported — if not, add:
```js
export const metadata = {
  title: 'Explore Tango Events Worldwide — TangoTiempo',
  description: 'Discover travel-worthy tango festivals, marathons, and encuentros around the world.',
  openGraph: {
    images: [{ url: 'https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png' }],
  },
};
```

### 6. Tango landing page — OG image
**File:** `src/app/tango/page.js`
**Current:** `TangoTiempo3.jpg`
**Change:** Replace with `Brand-MCB-Light-V-WIDE-1.png`

---

## P2 — UI Touchpoints

### 7. Explore page heading icon
**File:** `src/app/explore/page.js`
**Current:** `<FlightTakeoffIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />`
**Change:** Replace with brand ICON (24px)

```jsx
import Image from 'next/image';
// ...
<Image
  src="/brand/Brand-ICON-Maroon-SQ-1.png"
  alt=""
  width={24}
  height={24}
  style={{ borderRadius: '50%' }}
/>
```

### 8. Event detail — missing image fallback
**File:** `src/app/components/Modals/ViewEvents/ViewEventDetailModal.js`
**Current:** Falls back to `/images/TangoTiempo3.jpg` when no event image
**Change:** Show the brand ICON (36px) watermark in the image area header when `eventImage` is null, rather than stretching TangoTiempo3.jpg.

Approach: in `ViewEventDetailsImage.js` (or wherever the image renders), when `imageSrc === DEFAULT_EVENT_IMAGE`, render the ICON centered in a branded placeholder div instead.

```jsx
{!hasEventImage && (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center',
             bgcolor: 'grey.50', height: 120 }}>
    <Image src="/brand/Brand-Simple-Light-WIDE-1.png"
           alt="TangoTiempo" width={200} height={60} style={{ opacity: 0.6 }} />
  </Box>
)}
```

### 9. About page — hero image
**File:** `src/app/about/page.js`
**Current:** No brand image (just Typography hero)
**Change:** Add `Brand-MCB-Light-WIDE-1.png` as a full-width image above the first Divider.

```jsx
<Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
  <Image src="/brand/Brand-MCB-Light-WIDE-1.png"
         alt="TangoTiempo — Move. Connect. Belong."
         width={900} height={200}
         style={{ width: '100%', height: 'auto' }} />
</Box>
```

### 10. SiteHeader default image
**File:** `src/app/components/UI/SiteHeader.js`
**Current:** `/images/TangoTiempo3.jpg`
**Consider:** Replace with `Brand-MCB-Dark-V-WIDE-1.png` (dark variant, better banner dimensions)
> ⚠️ This is visible on EVERY calendar page — test thoroughly before shipping.

---

## P3 — Acquisition Surfaces

### 11. Welcome modal — first-visit branding
**File:** `src/app/components/Modals/Welcome/WelcomeModal.js`
**Current:** Text only, no brand presence
**Change:** Add `Brand-ICON-Maroon-SQ-1.png` (32px) beside "TangoTiempo" in the modal header.
Keep it subtle — one small icon, no banner.

### 12. Organizer Apply page
**File:** `src/app/organizers/apply/page.js` or the Apply portal component
**Current:** No brand presence
**Change:** Add `Brand-MTGT-Orange-V-WIDE-1.png` as a slim header (max 80px height) at the top of the apply flow.
"Move together. Grow together." fits the organizer recruitment message.

### 13. Benefits / landing pages
**Files:** `src/app/benefits/page.js`, `src/app/organizer-join/page.js`
**Change:** Add `Brand-MCB-Light-WIDE-1.png` as page hero where there is currently no brand imagery.

---

## P4 — Future (requires copy/content decisions)

| Item | Asset | Notes |
|---|---|---|
| First-visit splash screen | `Brand-Phrase-A-Dark-TALL-1` | Mobile-first, max 1.5s, skippable. Requires animation decision. |
| Social story ads | `Brand-Phrase-A-Dark-TALL-1/2` | Instagram/Facebook stories format |
| Organizer-facing email | `Brand-MTGT-Orange-V-WIDE-1` | Email header in future notification emails |
| Beginner page header | `Brand-ICON-Light-SQ-1` | Small, beside page title only |
| Releases / changelog page | `Brand-Simple-Light-WIDE-1` | Subtle — one small mark at top |

---

## Pages Intentionally Skipped (per guidelines)

| Page | Reason |
|---|---|
| `/calendar/boston` | Partner brand identity — never add TT brand |
| `/privacy` · `/data-deletion` · `/auth/*` | Functional pages — brand is noise |
| `/calendar` (main) | SiteMenuBar already carries BrandMark — no duplication |
| `/calendar/boston` | Boston identity |

---

## Implementation Order

```
P1 (SEO — one PR)
  layout.js root OG
  event/[id]/page.js DEFAULT_EVENT_IMAGE
  venue/[id]/page.js OG image
  organizers/[slug]/page.js OG fallback
  explore/layout.js metadata
  tango/page.js OG image

P2 (UI — one PR)
  explore/page.js heading icon
  event detail missing-image fallback
  about/page.js hero image
  SiteHeader.js (separate PR — high risk, test first)

P3 (Acquisition — one PR per surface)
  WelcomeModal
  Organizer apply page
  Benefits / organizer-join pages
```

---

## Asset Quick Map (TT-specific)

| Surface | Asset | Size |
|---|---|---|
| Root / site-wide OG fallback | `Brand-MCB-Light-V-WIDE-1.png` | 1200×300 |
| Event OG fallback | `Brand-Simple-Light-WIDE-1.png` | 1200×300 |
| Venue / organizer OG fallback | `Brand-Simple-Light-WIDE-1.png` | 1200×300 |
| About page hero | `Brand-MCB-Light-WIDE-1.png` | 900×200 |
| Explore heading icon | `Brand-ICON-Maroon-SQ-1.png` | 24×24px |
| Event detail missing-image | `Brand-Simple-Light-WIDE-1.png` | 200×60px (opacity 0.6) |
| Welcome modal icon | `Brand-ICON-Maroon-SQ-1.png` | 32×32px |
| Organizer apply header | `Brand-MTGT-Orange-V-WIDE-1.png` | full-width, 80px tall |
| SiteHeader (candidate) | `Brand-MCB-Dark-V-WIDE-1.png` | full-width |
