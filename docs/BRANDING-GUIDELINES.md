# TangoTiempo Branding Guidelines
**Version 1.0 — 2026-04-29**

---

## Principles

**Clean. Warm. Authoritative.**
TangoTiempo is the serious global tango calendar — not a startup landing page, not a blog. The brand should feel like a trusted companion for the tango world: warm enough to welcome a first-timer, professional enough that a festival organizer trusts it with their event.

**Never shout. Never clutter.**
One brand moment per screen. A small round icon in a header is enough. A banner in every modal is too much.

**Boston is its own brand.**
`/calendar/boston` and `bostontangocalendar.com` carry the Boston Tango Calendar identity. Do not add TangoTiempo brand assets there. The Cloudflare Worker proxy handles their identity.

---

## Assets Available (`/public/brand/`)

| Type | Files | Use for |
|---|---|---|
| **ICON** (round, no text) | `Brand-ICON-*` | Inline icons, favicons, small UI moments |
| **Simple** (mark + name, no tagline) | `Brand-Simple-*` | Event detail headers, about page, modest presence |
| **MCB** (mark + "Move. Connect. Belong.") | `Brand-MCB-*` | Banners, social cards, welcome screen |
| **Phrase-A** ("Dance becomes more beautiful when shared.") | `Brand-Phrase-A-*` | Splash screen, ads, emotional moments |
| **MTGT** ("Move together. Grow together.") | `Brand-MTGT-*` | Organizer-facing messaging |
| **Existing mark** | `tangotiempo-mark.png` | SiteMenuBar (already in use) — do not replace |

### Background variants
- **Light** — cream/white bg — general UI, about page, event detail
- **Dark** — deep maroon bg — splash, high-contrast moments
- **Orange/Red** — gradient — social banners, ads
- **Navy** — dark blue — alternative dark contexts
- **Purple** — for variety in social content only

### Ratio guide
- **SQ** — rounded square icons, app store, social profile
- **WIDE** — standard banner (roughly 3:1)
- **V-WIDE** — very wide banner (roughly 5:1) — site headers
- **TALL** — portrait (roughly 1:2) — mobile banners, stories

---

## Surface-by-Surface Rules

### Startup / Splash
- **Use**: `Brand-Phrase-A-Dark-TALL-1` or `Brand-MCB-Dark-V-WIDE-1`
- Show briefly on first app load or session start (max 1.5s, skippable)
- One asset only — mark + tagline, full bleed
- **Don't** use on every page load — only truly first visit / cold start

### Event Detail Modal
- **Use**: `Brand-ICON-Light-SQ-1` (or Maroon variant) — small, 28–36px, top-right of modal header or as a watermark in the event image area when no event image exists
- Replace the generic placeholder image with a brand ICON when `eventImage` is null
- **Don't** put a full banner in the event detail — it competes with the event content
- **Don't** use Phrase-A or MCB here — too much copy alongside event copy

### About Page (`/about`)
- **Use**: `Brand-Simple-Light-WIDE-1` or `Brand-MCB-Light-WIDE-1` as a hero section header image
- Already has proper SEO metadata (`export const metadata`) — keep it
- One brand image at the top, no brand repetition below
- **Don't** add the HDTS / AI-Guild branding back — that's company info, not product

### Welcome Back / Session Messages
- **Use**: `Brand-ICON-Light-SQ-1` beside the user's name in the welcome message
- Tagline "Move. Connect. Belong." is appropriate here as a sub-line
- Keep message copy short: "Welcome back, [name]. Ready to dance?"
- **Don't** use Phrase-A — it's for emotional/acquisition moments, not returning users

### Messaging / Notifications
- Brand presence = ICON only (16–20px) beside "TangoTiempo" as sender name
- No banners inside notification text
- **Don't** brand individual event alerts — the event should be the hero

### Ads / Social Banners
- **Use**: MCB or MTGT variants on appropriate background color
  - Dancer acquisition: `Brand-MCB-Light-V-WIDE-1` or `Brand-MCB-Dark-V-WIDE-1`
  - Organizer acquisition: `Brand-MTGT-Orange-V-WIDE-1`
  - Travel/explore: `Brand-Phrase-A-Dark-TALL-1` (portrait ad)
- Always include CTA text in the ad itself — the brand image alone is not enough
- **Don't** use Orange/Red gradient for tango-specific content — reserve for growth/energy messages

### Social Cards (OG / Twitter / iMessage previews)
- Event share: event image takes precedence → fallback to `Brand-Simple-Light-WIDE-1`
- Organizer profile share: organizer image → fallback to `Brand-Simple-Light-WIDE-1`
- Site-level pages (About, Explore, Beginner): `Brand-MCB-Light-V-WIDE-1`
- **Don't** use Dark variants for OG — they render poorly on light-mode social feeds

### SEO / Structured Data
- All pages that export `metadata` should include `og:image` pointing to a brand asset
- Use absolute URLs: `https://tangotiempo.com/brand/Brand-MCB-Light-V-WIDE-1.png`
- Event pages already use the event image with `Brand-Simple-Light-WIDE-1` as fallback — keep this
- **Don't** use SQ images for og:image — they look bad as link previews (should be ~1200×630)

### Explore Page
- Small ICON (24px) in the heading: `Brand-ICON-Maroon-SQ-1` or `tangotiempo-mark.png`
- "Events Worthy of Travel" heading already exists — brand icon beside it is enough
- **Don't** add a banner above the filters — it pushes content down

### Beginner Page
- No brand assets currently — appropriate, keep it clean
- If adding: `Brand-ICON-Light-SQ-1` in the page heading only

### Releases / Legal / Privacy / Data-deletion pages
- No brand assets — plain, functional pages

---

## Mobile vs Desktop

| Concern | Rule |
|---|---|
| **TALL assets** | Mobile-only: social stories, portrait ads, mobile splash |
| **V-WIDE assets** | Desktop banners, email headers |
| **WIDE assets** | Both — safest general use |
| **SQ/ICON assets** | Both — always safe |
| **Text size** | Brand assets are images — don't scale them below legibility (~80px wide min) |
| **Dark bg assets** | Test on OLED/dark-mode devices — Dark variants render great; Light variants may wash out |

---

## Typography & Color (do not add ad-hoc)

The brand images carry their own type. Do not recreate the brand typographically in the UI (e.g. don't write "Move. Connect. Belong." in a custom `Typography` component — use the image asset or nothing).

Brand red/maroon `#6B1230` is used in the existing MUI theme — do not override it for brand assets.

---

## Do's

- ✅ One brand touch per screen
- ✅ Use ICON size (24–36px) for inline/subtle presence
- ✅ Use Simple variants when the event or content is the hero
- ✅ Use MCB/Phrase-A for acquisition surfaces (ads, social, splash, about)
- ✅ Replace missing event images with `Brand-ICON-*` (not a full banner)
- ✅ Keep `/public/brand/` as the single source of truth — link from code, never copy-paste rasters inline
- ✅ Test new brand placements on mobile before shipping

## Suggestions

- 💡 Consider `Brand-Simple-Light-WIDE-1` as the fallback OG image for the whole site
- 💡 Event detail watermark: small ICON at 10% opacity in bottom-right of image area when no event image
- 💡 Organizer-facing pages (apply, settings) → use `Brand-MTGT-*` family — "Move together. Grow together." fits the organizer relationship
- 💡 Future ads: `Brand-Phrase-A-Dark-TALL-1` makes a strong Instagram Story / vertical ad
- 💡 Welcome modal (new user first visit): `Brand-MCB-Dark-V-WIDE-1` as the header, then copy

## Don'ts

- ❌ Don't brand `/calendar/boston` — it has its own identity
- ❌ Don't put banners inside modals that already have content (event detail, organizer settings)
- ❌ Don't use Orange/Red gradient assets for tango content — orange reads "energy/startup", not "tango"
- ❌ Don't stack multiple brand assets on one screen
- ❌ Don't recreate brand copy ("Move. Connect. Belong.") as UI text — use the image or omit
- ❌ Don't use SQ assets as OG images — use WIDE or V-WIDE
- ❌ Don't add brand assets to functional/legal pages (privacy, terms, data deletion)
- ❌ Don't animate brand assets unless it's a deliberate splash moment
- ❌ Don't use HDTS or AI-Guild assets in user-facing product pages

---

## Quick Reference: Asset → Use

| Want to... | Use |
|---|---|
| Replace missing event image | `Brand-ICON-Light-SQ-1` (28–36px) |
| OG image fallback for events | `Brand-Simple-Light-WIDE-1` |
| OG image for site pages | `Brand-MCB-Light-V-WIDE-1` |
| Splash on first visit | `Brand-Phrase-A-Dark-TALL-1` |
| About page hero | `Brand-MCB-Light-WIDE-1` |
| Explore page heading icon | `Brand-ICON-Maroon-SQ-1` (24px) |
| Organizer-facing banner | `Brand-MTGT-Orange-V-WIDE-1` |
| Social ad (dancer) | `Brand-MCB-Dark-V-WIDE-1` |
| Social ad (portrait/story) | `Brand-Phrase-A-Dark-TALL-1` |
| Welcome back message | `Brand-ICON-Light-SQ-1` + "Welcome back" copy |
