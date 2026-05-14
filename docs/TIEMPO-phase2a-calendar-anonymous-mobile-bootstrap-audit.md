# Phase 2a Audit — TT /calendar LOC anonymous-mobile bootstrap failure

**Author:** Sarah (TT FE)
**Date:** 2026-05-12
**Status:** Phase 2a complete; FE diagnosis locked. Awaiting Fulton's trace-stitch + Phase 2b output before Phase 3 convergence 2026-05-14 AM.
**Coordinator:** Quinn
**Cross-link:** CALBEAF-### (Fulton BE companion, to be created Phase 3)
**Incident artifact:** CalOps "API Errors Report 7d" 2026-05-12 14:16:55 BOS (single Boston session, 5/12 12:53:42 PM, 6 traces)
**Class:** "Always-mounted side-effecting conditional component" (Archie's naming, 2026-05-12T19:01Z)

---

## Summary

The user-perceived bug — anonymous mobile iPhone visitor sees "Loading Map Settings…/Opening location selector" + zero events for 4s, then gives up — is the product of **two independent FE defects** that compound on a cold Azure Function instance:

- **Defect 1 (fleet-wide):** an unguarded modal mount in the app shell causes `useServiceHealth` to fire 4 health-check fetches on **every page load for every user** including anonymous mobile.
- **Defect 2 (/calendar-specific):** a conditional render gate at `src/app/calendar/page.js:1251` blocks `<FullCalendar>` (and therefore the events fetch) until `useGeoLocation()` resolves a location — for anonymous users with no saved location, that's a ~4s wait on a cold Google Geo API call.

The "5-call burst aborting in a 28ms window" in the incident report is **not** a `Promise.all` rejection cascade or an `AbortController.timeout` firing. The timing math is decisive: aborts at 4267–4295ms are below the 5000ms `AbortSignal.timeout` floor. The aborts are mobile-Safari's cancel-all-in-flight on user backgrounding. The 28ms window is the browser's cancel-batch.

**Fix shape:** two FE changes (gate the modal mount; remove the conditional render gate + default-location fallback), shipped together with Fulton's BE companion (keep-alive coverage extension + Mongo pool warmth) as a single coordinated PROD event under stacked-gates protocol per Quinn's ship-together contract.

---

## Mechanism — full call chain on anonymous-mobile /calendar mount

```
app/layout.js
  ├─ <Providers>
  │    └─ AuthProvider → LocationAPIProvider → GeoLocationProvider → EventDiscoveryProvider
  │    └─ <UserLocationLoader/>          ← no-op for anonymous (bails at line 28)
  │    └─ <MapCenterModalWrapper/>       ← passive
  ├─ <SidebarDrawer/>                    ← Defect 1 entry: mounted unconditionally
  │    └─ <ServiceStatusModal open={X}/> ← NO {X && ...} guard at line 657
  │         └─ useServiceHealth()        ← hook called BEFORE any conditional return
  │              └─ useEffect([]) fans out 4 fetches in parallel on every mount:
  │                   ├─ checkGoogleGeoAPI    → /api/geo/google-geolocate
  │                   ├─ checkMongoDB         → /api/health/mongodb
  │                   ├─ checkAzureFunctions  → /api/health
  │                   └─ checkCloudflare      → /api/cloudflare/info
  │    └─ <DebugMenu open={X}/>          ← same anti-pattern, no fetches (verified)
  └─ children (/calendar)
       ├─ calendar/layout.js
       │    └─ useEffect([]) on mount fires:
       │         ├─ getGeolocationData()           → /api/geo/google-geolocate (2nd Geo trace)
       │         ├─ fetchAllGeolocationData(1440)  → /api/cloudflare/info + /api/geo/google-geolocate (parallel via Promise.allSettled)
       │         └─ fetch('/api/visitor/track')    → POST after geo resolves
       └─ calendar/page.js
            ├─ SiteHeader → useBackendHealth()    → /api/health (mount + 30s polling, unconditional)
            └─ Line 1251: {noLocationSelected ? <Loading...> : <FullCalendar/>}
                                   ↑
                              DEFECT 2 GATE
                              FullCalendar (and events fetch) blocked
                              until useGeoLocation() resolves a location.
```

**Per-endpoint source attribution** (the 4 incident endpoints, ordered by call count on cold mount):

| Endpoint (App Insights op_Name) | FE source(s) firing on /calendar mount | Notes |
|---|---|---|
| `/api/health` (Health_Basic) | 2 sources: `SiteHeader.useBackendHealth` (mount + 30s) **and** `useServiceHealth.checkAzureFunctions` (mount, via SidebarDrawer→ServiceStatusModal) | SiteHeader.useBackendHealth's return value is not destructured anywhere — side-effect-only. Hook can be removed without breaking any consumer. |
| `/api/geo/google-geolocate` (Geo_GoogleGeolocate) | 3 sources: `useServiceHealth.checkGoogleGeoAPI` + `calendar/layout.js:28 getGeolocationData` + `calendar/layout.js:49 fetchAllGeolocationData(1440)`. Latter two share `GOOGLE_GEO_CACHE_KEY` sessionStorage so on a warm-cache visit some are deduped. Anonymous-no-cache fires all. | Incident's Geo×2 explained by cache state at the user's session. |
| `/api/cloudflare/info` (Cloudflare_Info) | 2 sources: `useServiceHealth.checkCloudflare` + `trackingHelper.fetchAllGeolocationData` (parallel sibling of Google via `Promise.allSettled` at line 133). `trackingHelper` has 5-min sessionStorage cache (`CF_CACHE_KEY`) so it dedupes within session. | |
| `/api/health/mongodb` (Health_MongoDB) | 1 source: `useServiceHealth.checkMongoDB` (mount, via SidebarDrawer→ServiceStatusModal) | Only call site in the codebase. |

**Why all 5 hit cold instance:** per Fulton's BE-lane finding, calendar-be-af is on Azure Functions Consumption Y1/Dynamic. The existing keep-alive workflow (`.github/workflows/keep-alive-ping.yml`) pings ONLY `/api/geo/google-geolocate` every 15 min. Health_Basic, Health_MongoDB, and Cloudflare_Info are cold every cycle. Cold-start on Node 20 + first-Mongo-connection = 2-4s typical; stacks to ~4s easily, matching the incident durations.

---

## Defect 1 — fleet-wide health-check leak via unguarded modal mount

### Mount-chain evidence

- `src/app/layout.js:84`
  ```jsx
  <SidebarDrawer />  // mounted unconditionally in root layout
  ```
- `src/app/components/UI/SidebarDrawer.js:657`
  ```jsx
  <ServiceStatusModal open={serviceStatusOpen} onClose={() => setServiceStatusOpen(false)} />
  // NO {serviceStatusOpen && ...} parent guard
  ```
- `src/app/components/DevTools/ServiceStatusModal.js:34` (body line 1)
  ```jsx
  const ServiceStatusModal = ({ open, onClose }) => {
    const services = useServiceHealth();  // ← hook called before any conditional return
    // ...
    if (!open) return null;  // ← too late, hook already ran
  };
  ```
- `src/app/hooks/useServiceHealth.js:55-112`
  ```js
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_SERVICE_HEALTH_CHECKS === 'true') return;
    checkExpressBackend(); checkFirebase(); checkMapbox();
    checkMongoDB(); checkGoogleAnalytics();
    if (!isLocalhost) { checkGoogleGeoAPI(); checkAzureFunctions(); }
    checkCloudflare();
  }, []);  // empty deps — fires once per mount
  ```

### Why this is the canonical "Always-mounted side-effecting conditional component" instance

Parent (`SidebarDrawer`) always renders the modal component. The `open` prop only gates the modal's INTERNAL DOM output — React mounts the child as soon as the parent renders, so the child's hooks and mount-effects fire regardless of `open`. The modal's "I'm closed" state is invisible to its own side-effecting hooks.

`<DebugMenu open={debugMenuOpen}/>` on the adjacent line (656) is the same anti-pattern — verified no fetches today, but in scope for the fix-for-consistency-only.

### Reach

`<SidebarDrawer/>` is in the root layout, so the 4-call burst fires on **every page, every user, every visit**, not just `/calendar`. This is the TT-wide P2 architectural defect Quinn called out in beat 5.

### Cheapest fix (Phase 3 (b))

```jsx
// src/app/components/UI/SidebarDrawer.js:656-657
{debugMenuOpen && <DebugMenu open={debugMenuOpen} onClose={() => setDebugMenuOpen(false)} />}
{serviceStatusOpen && <ServiceStatusModal open={serviceStatusOpen} onClose={() => setServiceStatusOpen(false)} />}
```

Net effect: modals unmount on close + remount on open. Admin opening a diagnostic dialog gets fresh data on open — correct behavior. Latency cost moves from "every anonymous user every page" → "admin on-demand."

### Belt-and-suspenders

Keep `NEXT_PUBLIC_DISABLE_SERVICE_HEALTH_CHECKS` env-flag as a backup kill-switch even after the modal-gating fix. If Fulton confirms (env-flag ask from beat 5) the flag is unset in PROD today, that informs whether we need to also flip the flag at Phase 3 deploy.

---

## Defect 2 — /calendar LOC conditional render gate

### Evidence

`src/app/calendar/page.js:1251-1265`
```jsx
{noLocationSelected ? (
  <div style={{ /* placeholder styling */ }}>
    <h2 style={{ marginBottom: '20px', color: '#666' }}>Loading Map Settings...</h2>
    <p style={{ fontSize: '16px', color: '#777' }}>Opening location selector</p>
  </div>
) : (
  <div onTouchStart={onTouchStart} ...>
    {/* ...spinner... */}
    <NoEventsAlert .../>
    <FullCalendar ... events={eventsWithPlaceholders} />
  </div>
)}
```

`noLocationSelected` is derived from `useEvents` (via `useCalendarPage.js:87`). When no location is selected, `useEvents` short-circuits the events fetch AND `noLocationSelected` is true, so the gate above renders the placeholder instead of `<FullCalendar/>`. **The events module is never even instantiated** until location resolves.

For anonymous users with no saved location and no sessionStorage `currentLocation`, `noLocationSelected` stays `true` until one of:
- `setSessionLocation()` is called (e.g., browser GPS resolves in `calendar/layout.js:30-40`)
- User manually selects a location via MapCenterModal
- `setCurrentLocationState()` fires from another path

The 4s "Loading Map Settings" the user saw = waiting on `getGeolocationData()` to resolve, which is waiting on a cold Google Geo API call. User backgrounded at ~4s before geo resolved.

### Cheapest fix (Phase 3 (a))

Remove the conditional gate; add a default-location fallback chain so `<FullCalendar/>` mounts immediately with sensible coordinates:

```jsx
// Replace the {noLocationSelected ? <Loading> : <FullCalendar/>} block with:
<div onTouchStart={onTouchStart} ...>
  <NoEventsAlert .../>
  <FullCalendar
    {...}
    events={eventsWithPlaceholders}
    initialDate={getInitialDate()}
    initialView={getInitialView()}
  />
</div>
```

`useEvents` updates `eventsWithPlaceholders` based on whatever location is set. Default-location chain (already exists in `Providers.MapCenterModalWrapper.getInitialLocation` lines 47-74):
1. `currentLocation` (user explicit) — null for anonymous-no-cache
2. `savedLocation` (user backend preference) — null for anonymous
3. `getCachedGeolocation().google` — null on first visit
4. Cloudflare country center (`getCountryMapLocation(cachedGeo?.cloudflare?.country)`) — null on first visit
5. **NEW: Hardcoded sensible regional default** (e.g., "US continental center" + 75mi zoom) → triggers "no events nearby" empty state cleanly, OR alternatively a per-IP-region table baked at build time.

Geo continues to resolve in the background and refines the visible list when it lands.

### Side-effect: surfaces a downstream cold-start risk

Per Fulton's prediction (beat 3): removing the gate exposes `/events` endpoint on the user critical path. Today it's masked because the gate prevents the events fetch from firing until geo resolves. After the fix, FullCalendar mounts immediately and `useEvents` fires its events fetch on a possibly-cold AF instance. **This is why ship-together with Fulton's keep-alive coverage extension is mandatory.**

---

## Recommendations summary (Phase 3 FE scope)

| ID | Component | Change | File | Lines | Risk |
|---|---|---|---|---|---|
| (a) | /calendar LOC gate | Remove conditional render; add default-location fallback chain | `src/app/calendar/page.js` | 1251-1265 | LOW — `useEvents` already handles location-less state |
| (b.1) | ServiceStatusModal mount | Wrap in `{serviceStatusOpen && ...}` parent guard | `src/app/components/UI/SidebarDrawer.js` | 657 | LOW |
| (b.2) | DebugMenu mount | Same parent-guard for consistency | `src/app/components/UI/SidebarDrawer.js` | 656 | LOW — no current side-effects but prevents future leak |
| (c) | SiteHeader.useBackendHealth | Remove import + invocation entirely | `src/app/components/UI/SiteHeader.js` | 7, 14 | LOW — return value never destructured anywhere |
| (d) | env-flag belt-and-suspenders | Confirm `NEXT_PUBLIC_DISABLE_SERVICE_HEALTH_CHECKS=true` set in PROD before deploy | Vercel env | n/a | LOW |

Plus Fulton's BE companion (separate CALBEAF-### scope): keep-alive coverage extension to events + Health_*/CF_Info; Mongo pool warmth check + eager-init if warranted.

---

## Cross-validation from Fulton's trace-stitch (added 2026-05-12T19:02Z)

Fulton ran the 6-trace stitch in App Insights against the incident `operation_Id`s. The two Geo_GoogleGeolocate request rows decisively cross-validate this diagnosis:

| Trace (BOS) | name | resultCode | total ms | funcExec ms | **cold-gap ms** | host instance | client UA |
|---|---|---|---:|---:|---:|---|---|
| op `1db1a05a` 12:53:42 | Geo_GoogleGeolocate | 499 | **4294** | **4.21** | **~4290** | 970c9ded | iPhone Safari 26.4, iOS 18.7, Boston |
| op `4ed41e3b` 12:54:06 retry | Geo_GoogleGeolocate | 499 | **3449** | **59.76** | **~3389** | 3aac9397 | same user |

Both threw `System.Threading.Tasks.TaskCanceledException`. **Function execution was 4-60ms; the 3-4s wait was container boot / scale-out delay on Consumption Y1 before code ran.** Different host instances on the two requests confirms the retry hit a freshly-scaled container, not a warm reuse — keep-alive (15-min cadence on `/geo` only) doesn't ping scale-out instances.

**Update 2026-05-12T19:05Z — same-container empirical lock:** Fulton's raw `customDimensions` extraction shows all 4 first-burst traces (Geo + Health_MongoDB + Health_Basic + Cloudflare_Info) shared the **same `HostInstanceId` (`970c9ded-...`) + same `ProcessId` (3580)**, hitting one cold container serially. This empirically locks the "single user session, app-code burst" interpretation without needing `operation_ParentId` chain analysis. The retry trace (`3aac9397-.../7940`) on a fresh host instance confirms scale-out cold-start as a structurally separate path from baseline-warm cold-start. Per Archie 2026-05-12T19:04Z + Fulton 2026-05-12T19:05Z, keep-alive coverage extension solves baseline-warm but not scale-out — scale-out cold-start residual is a class artifact for a future tier-policy ADR (Toby dropped Premium-tier scope this incident).

| Trace | endpoint | total ms | funcExec ms | HostInstanceId | ProcessId |
|---|---|---:|---:|---|---:|
| 16:53:42.853 | Geo_GoogleGeolocate | 4294 | 4.21 | `970c9ded-...` | 3580 |
| 16:53:42.854 | Health_MongoDB | 4284 | 2.40 | `970c9ded-...` | 3580 |
| 16:53:42.854 | Health_Basic | 4267 | 22.68 | `970c9ded-...` | 3580 |
| 16:53:42.854 | Cloudflare_Info | 4287 | 2.14 | `970c9ded-...` | 3580 |
| 16:54:06.429 | Geo (retry) | 3449 | 59.76 | `3aac9397-...` | 7940 |

The 4 first-burst rows timestamped within 1ms of each other on the same `HostInstanceId`/`ProcessId` is the canonical empirical fingerprint of a single `useEffect` parallel fan-out (4 fetches kicked off synchronously by `useServiceHealth.js:55-112`).

This is the canonical "BE was healthy, container wasn't" finding. The Boston user waited on container boot, not function code. Combined with FE diagnosis:

- **Defect 2 surfaces the cold-start to the user** because the conditional render gate makes the geo call (which is on the cold-call critical path) block events render.
- **Defect 1 amplifies cold-start load** by firing 4 endpoint checks unconditionally per page — each potentially hitting cold container instances post-scale-out.
- **The user-perceived 4s wait = container boot time, full stop.** Not network, not function logic, not Mongo, not Google API. Container scale-out.

This is why Fulton's BE companion (keep-alive coverage extension to events + Health_*/CF_Info + Mongo pool warmth) is the load-bearing co-fix. Without it, removing the gate just shifts the user's cold-start exposure from "Geo" to "Events."

## Open items / data points still pending

1. ~~**Fulton's 6-trace stitch**~~ — **DELIVERED 2026-05-12T19:02Z.** See cross-validation section above. Container boot dominance confirmed.
2. ~~**Fulton's PROD env-flag check**~~ — **DELIVERED.** `NEXT_PUBLIC_DISABLE_SERVICE_HEALTH_CHECKS` is NOT SET in `tangotiempo-com` PROD env. Belt-and-suspenders Phase 3 work item: set the flag at deploy AS WELL AS landing the modal-gating fix.
3. **Fulton's Phase 2b latency pull** — Mongo pool warmth + per-endpoint P50/P95/P99 for incident endpoints + Mongo-touching endpoints (Events / Categories / Venues / Organizers). EOD 2026-05-13.
4. **AI instance mismatch finding (Fulton beat 10):** the `CalendarBEAF` App Insights resource visible in the RG is NOT the AI the Function App actually emits to (connection-string points to a different AI: appId `a9793e58-09db-...`). The RG-named resource is orphaned or used elsewhere. Worth Dash investigation as separate cleanup; out of Phase 3 scope.
5. **calendar/layout.js double-call rationale** — `fetchAllGeolocationData` is called from line 49 (1440min, mount) and line 98 (60min, on LOCATION_CHANGED event only). Verified: only ONE fires on anonymous-cold-mount. The 60min one is event-gated. Documenting for completeness; no scope change.

---

## FTPNTD layering

- **Data fix:** none. No bad data; this is a code-process and team-human gap.
- **Code-process fix:** the 4 changes above. Single TIEMPO-### + CALBEAF-### paired PR.
- **Team-human fix:**
  - "Always-mounted side-effecting conditional component" (Archie) added to FE review checklist as named anti-pattern. Future PRs that render `<X open={...}/>` where X has mount-side-effects must use parent-conditional guard.
  - "Predict second-order effects of structural fixes" (Quinn's beat 3, expanded Phase 3 §FTPNTD codification) — Fulton's "fix shifts symptom" prediction is the canonical instance.
  - "Anonymous + mobile + Slow-4G as pre-deploy smoke condition for TT" — likely Gauge plate per charter; flagged for post-Phase-3 scoping.

---

## Cross-app implications (informational, post-Phase-3)

Both defects are likely class instances, not TT-unique. Gotan and Archie have parallel cross-app investigations Toby-scoping-gated:
- **Defect 1 class:** "Always-mounted side-effecting conditional component" likely present in HJ (Cord), NTTT (Compás), CalOps (Dash), TBaP/VH (Charlotte). Archie's "FE modal/drawer/panel mount-discipline standard" ADR candidate, post-Phase-3.
- **Defect 1 specifics (health-check leak):** Cord's HJ and Compás's NTTT share TT's FE ancestry — likely same SiteHeader + SidebarDrawer + ServiceStatusModal pattern. Gotan's half-day audit candidate, post-Phase-3.

---

## Sign-off

FE diagnosis locked per Quinn beat 7 (2026-05-12T19:00Z). EOD-tomorrow report deliverable: this document. Ship-together contract acknowledged: TIEMPO-### + CALBEAF-### paired PRs, single coordinated PROD event 2026-05-14 AM under stacked-gates protocol.

Next FE action: standing by for Fulton's trace-stitch + Phase 2b output; Phase 3 convergence call 2026-05-14 AM with Quinn arbitrating.

— Sarah 2026-05-12
