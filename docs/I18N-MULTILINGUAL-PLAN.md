# Multilingual / i18n Plan — TangoTiempo

**Status**: Planning / Not Started
**Author**: Sarah (TangoTiempo Frontend Agent)
**Date**: 2026-04-07
**Target Languages**: English (default), Spanish, German, French
**Audience**: International Argentine Tango community

---

## Goals

Make tangotiempo.com fully usable by the international tango community in their native language, while preserving the universal Argentine Tango vocabulary that defines the dance globally.

**Success criteria:**
- A German-speaking tango dancer can browse, register, create events, and become an organizer entirely in German
- Same for Spanish (the largest non-EN tango community), French, and English
- SEO works per locale (`hreflang`, per-language sitemaps, locale-specific URLs)
- Tango-specific terms remain authentic (no auto-translation of "milonga" to "dance party")

---

## Effort Tiers

### Tier 1 — Foundation (~1-2 weeks)

**Library choice:**
- **`next-intl`** — recommended. App Router-native, modern DX, ICU MessageFormat support, SSR-friendly
- Alternative: `next-i18next` (older, Pages Router lineage)

**Routing strategy** (pick one):

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **Path-based** | `/en/calendar`, `/de/calendar` | SEO-friendly, easy, single domain | URLs include locale |
| **Subdomain** | `de.tangotiempo.com` | Max SEO authority per locale | Vercel/DNS infra work, separate cookies |
| **Cookie-based** | `/calendar` (locale via cookie) | Cleanest URLs | Worst for SEO, harder to share links |

**Recommendation**: Path-based (`/en/`, `/es/`, `/de/`, `/fr/`).

**Locale detection priority:**
1. Explicit URL prefix
2. User preference (MongoDB userlogin)
3. Cookie (`NEXT_LOCALE`)
4. Browser `Accept-Language` header
5. Default → English

**Translation file structure:**
```
messages/
├── en/
│   ├── common.json
│   ├── calendar.json
│   ├── auth.json
│   ├── organizer.json
│   ├── events.json
│   └── errors.json
├── es/
├── de/
└── fr/
```

---

### Tier 2 — String Extraction (~2-3 weeks)

- Audit every component for hardcoded strings
- Replace with `t('namespace.key')` calls
- Group by namespace (common, calendar, auth, organizer, events, errors)
- **Estimated string count**: 800-1500 (needs audit to confirm)
- **Tooling**:
  - `i18n-ally` VSCode extension
  - `next-intl` codemod / linter
  - Custom script to detect untranslated strings

---

### Tier 3 — Translation (~1-2 weeks + ongoing)

| Option | Approach | Cost (one-time) | Quality |
|--------|----------|----------------|---------|
| **A** | Professional human translators | $1,000-3,000 | Best |
| **B** | Claude/GPT-4 only | $50-200 | ~90% |
| **C** | AI first pass + tango-fluent native reviewer | $200-600 | Excellent |

**Recommended**: Option C — leverages AI speed with native context for tango community.

---

### Tier 4 — Tango-Specific Vocabulary

**DO NOT translate** (universal tango vocabulary preserved across all languages):

| Category | Terms |
|----------|-------|
| Event types | milonga, práctica, festival, marathon, encuentro |
| Music | tanda, cortina, vals, tango, milonga (rhythm), candombe |
| Dance | abrazo, salida, ocho, gancho, boleo, parada |
| Roles | maestro, DJ, taxi dancer (community choice: leader/follower or roles) |
| Spaces | salón, cabeceo, ronda |

**DO translate**:

| Category | Examples |
|----------|----------|
| UI chrome | Save, Cancel, Login, Profile, Settings |
| Forms | Form labels, helper text, validation messages |
| Marketing | Welcome copy, hero text, CTAs |
| Errors | "Page not found", "Network error", form validation |
| Email | Notification subjects and bodies |
| Calendar | View labels (Month, List, Week), filter labels |
| Time | Today, Tomorrow, This week, Next month |

**Edge cases to discuss with community:**
- "Lesson" vs "class" vs "clase" vs "Stunde"
- "Workshop" (often kept in English/Spanish across all languages)
- "Beginner / Intermediate / Advanced" — translate or keep universal?

---

### Tier 5 — Beyond Strings

| Item | Status / Notes |
|------|----------------|
| **Dates/times** | ✅ Already venue-local (Harvey's UTC contract handles this) |
| **Number formats** | Use `Intl.NumberFormat` — minimal currency in TT |
| **Pluralization** | ICU MessageFormat via `next-intl` (each language has different plural rules) |
| **RTL support** | Not needed for DE/ES/EN/FR (all LTR) |
| **Email templates** | Separate translation set, per-locale sender |
| **SEO meta** | Per-locale `<title>`, `<meta description>`, `hreflang` tags |
| **Sitemap.xml** | Per-locale entries, alternate refs |
| **Locale switcher** | Header dropdown with flag/label, persists choice |
| **404/500 pages** | Localized error pages |

---

### Tier 6 — Operational

| Concern | Approach |
|---------|----------|
| **Translation workflow** | Git PRs initially; consider Lokalise/Crowdin/Phrase later |
| **Missing key detection** | CI check + build warning |
| **First-visit detection** | Browser `Accept-Language` → suggest locale, allow override |
| **Regional defaults** | DE locale → suggest Berlin; ES locale → suggest Buenos Aires/Madrid |
| **User preference** | Store `preferredLocale` in MongoDB userlogin |

---

## Tango-Specific Wins

1. **Per-region landing pages**: `/de/berlin`, `/fr/paris`, `/es/buenos-aires`, `/es/madrid` — SEO gold for "milonga in Berlin", "tango Paris"
2. **Native organizer tools**: Organizers create events in their own language; no forced auto-translation
3. **Multi-region search**: A traveler in Berlin can search "tango in Paris next weekend" and get results
4. **AI-discovered events** (Harvey/Booker): Already pulls FB events in multiple languages — preserve original language, never auto-translate user content
5. **Community trust**: Authenticity matters in tango — preserving Spanish/Argentine vocabulary signals respect

---

## Phased Rollout Plan

| Phase | Scope | Effort |
|-------|-------|--------|
| **1** | `next-intl` setup, EN-only baseline, refactor strings to keys | 2 weeks |
| **2** | Add Spanish (largest non-EN tango community) — validates the system end-to-end | 1 week |
| **3** | Add German + French | 1 week |
| **4** | SEO polish: `hreflang`, per-locale sitemaps, meta tags | 1 week |
| **5** | Email templates, edge cases, native speaker review | 1 week |
| **6** | Launch + iterate based on user feedback | ongoing |

**Total**: 6-8 weeks dev time + ongoing maintenance

---

## Cost Estimate (One-Time)

| Item | Cost |
|------|------|
| Sarah dev time | 6-8 weeks (existing budget) |
| Translation (Option C: AI + native review) | $200-600 |
| Tooling | $0 (`next-intl` is free) |
| Translator hire (optional) | $0-2,500 if hiring per language |
| **Total** | **$200-3,100** |

---

## Risks & Considerations

### Architectural
1. **Cord (HarmonyJunction)** would benefit from the same i18n infrastructure — consider building as shared `@hdts/core` library so both apps share translation patterns
2. **Backend (Fulton, calendar-be-af)** mostly unaffected — user content (events, venues, organizers) stored as-is in their original language
3. **Calendar embeds** (FullCalendar) — needs `locale` prop set per user
4. **MongoDB userlogin schema** — needs new field `preferredLocale`

### Content
1. **String audit** always takes longer than estimated — budget 50% buffer
2. **Tango terminology decisions** need community input (Toby + native speakers in each language)
3. **AI-discovered events** (Harvey) bring multilingual content — UI must handle mixed-language event lists gracefully

### SEO
1. **`hreflang` setup** is critical — wrong setup can hurt rankings
2. **Domain authority** spreads across locales with path-based; concentrates with subdomain
3. **Existing English content** has SEO equity — don't break URLs (use 301 redirects if restructuring)

---

## Open Questions for Toby

1. **Routing strategy**: path (`/de/`) or subdomain (`de.tangotiempo.com`)?
2. **Spanish dialect**: Argentine/Rioplatense (`es-AR`) or neutral (`es`)?
3. **Translation approach**: AI-only (cheap), AI+review (best value), or human (premium)?
4. **Launch timeline**: phased rollout vs big-bang launch?
5. **Tango terminology**: confirm preserved-vs-translated word list with community
6. **Cord/HarmonyJunction**: build as shared infrastructure or TT-only?
7. **First language to add**: Spanish (largest community) or all four at once?

---

## Confidence & Risk Assessment

- **Confidence**: 85% — well-known territory, clear patterns, established libraries
- **Risks**:
  - String count uncertainty (budget buffer)
  - Tango terminology decisions need stakeholder input
  - SEO migration risk if changing existing URLs
- **Knowledge gaps**:
  - Exact current string count (needs audit)
  - Tango community preferences for translated vs preserved terms per language
  - Backend impact for `preferredLocale` field

---

## Next Steps (If Approved)

1. **Spike**: Build a `next-intl` POC on one page (e.g., welcome/landing) to validate approach
2. **String audit**: Run script to count and categorize hardcoded strings
3. **JIRA epic**: Create TIEMPO epic with phased breakdown
4. **Stakeholder interview**: Toby + native speakers to confirm terminology decisions
5. **Translator selection**: Quote from professional service if Option A; otherwise prep AI prompts for Option B/C

---

## Related Documents

- `CLAUDE.md` — Project conventions
- `MASTER-CALENDAR-SYNC.md` — Dual-frontend architecture (TT + HJ)
- `docs/SEO-STRATEGY.md` (TBD) — SEO implications of i18n routing

---

**Last updated**: 2026-04-07
**Next review**: After Toby's decisions on the Open Questions section
