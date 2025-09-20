# Branch Environment Comparison
Generated: 2025-08-22

## Commit History by Branch (Aug 15 - Aug 22)

### Summary
- **PROD**: 11 commits (Aug 15-20) - Missing recent performance and UI updates
- **TEST**: 30+ commits (Aug 18-21) - Most complete, includes all features
- **DEVL**: 15 commits (Aug 20-21) - Subset of TEST, includes TIEMPO-253 re-implementation

## Feature Status by Branch

| Feature/Ticket | PROD | TEST | DEVL | Notes |
|----------------|------|------|------|-------|
| **TIEMPO-239** (Timezone Display) | ❌ Missing | ✅ Fixed Aug 21 | ✅ Fixed | Critical timezone regression in PROD |
| **TIEMPO-246** (Venue Timezone v3) | ❌ Missing | ✅ Merged Aug 20 | ✅ Merged | Major architecture upgrade |
| **TIEMPO-252** (Calendar Venue Times) | ❌ Missing | ✅ Fixed Aug 19 | ❌ Missing | Calendar display fix |
| **TIEMPO-253** (Profile Completion) | ⚠️ Overwritten | ✅ Fixed Aug 20 | ✅ Re-implemented | Was lost, now restored in DEVL |
| **TIEMPO-254** (Save State Mgmt) | ❌ Missing | ✅ Aug 20 | ✅ Present | Centralized save management |
| **TIEMPO-257** (Deduplication) | ❌ Missing | ✅ Aug 21 | ✅ Present | Performance optimization |
| **TIEMPO-258** (Venue Create Button) | ❌ Missing | ✅ Aug 21 | ❌ Missing | UI enhancement |
| **TIEMPO-259** (Map Center Menu) | ❌ Missing | ✅ Aug 21 | ❌ Missing | New menu item |
| **TIEMPO-264** (Image Fixes) | ❌ Missing | ✅ Aug 21 | ❌ Missing | Image handling improvements |
| **TIEMPO-164** (Old June Work) | ✅ Present | ❌ Overwritten | ❌ Overwritten | Old code that caused regression |

## Critical Issues

### 1. **PROD Branch - Severely Behind**
- Missing ALL August 18-21 improvements
- Has timezone regression (TIEMPO-239)
- Missing venue timezone architecture (TIEMPO-246)
- Contains old TIEMPO-164 code that overwrote newer work

### 2. **TEST Branch - Most Complete**
- Has all features and fixes
- Properly merged and tested
- Should be baseline for recovery

### 3. **DEVL Branch - Partial Updates**
- Has core fixes but missing UI enhancements
- TIEMPO-253 was re-implemented here
- Missing: TIEMPO-252, 258, 259, 264

## Merge Sequence Problem

```
June: TIEMPO-164 implemented in old branch
Aug 15-20: New features added (TIEMPO-253, etc)
Aug 20: Old TIEMPO-164 branch merged, overwriting August work
Aug 21: Partial fixes in TEST
Aug 22: TIEMPO-253 re-implemented in DEVL
```

## Recommendations

1. **DO NOT MERGE PROD** - It will regress TEST/DEVL
2. **TEST is the most stable** - Use as baseline
3. **DEVL needs selective updates** from TEST
4. **Need to cherry-pick** missing features to DEVL:
   - TIEMPO-252 (Calendar venue times)
   - TIEMPO-258 (Venue create button)
   - TIEMPO-259 (Map center menu)
   - TIEMPO-264 (Image fixes)

## Commit Details

### PROD (Aug 15-20)
```
cde0ee3 | Aug 20 | fix(TIEMPO-164): ensure RA organizer fields preserved
319cffe | Aug 20 | fix(TIEMPO-253): Prevent event creation (OVERWRITTEN)
aba44ea | Aug 20 | fix(TIEMPO-253): Add proper next steps
ea18be7 | Aug 20 | chore: bump version to 1.8.0
4a1944a | Aug 20 | fix(TIEMPO-245): Ensure shortTitle field
83f16e4 | Aug 18 | fix: correct useUserData path
1a1e226 | Aug 18 | fix(auth): Add null checks
c8f5fc2 | Aug 18 | fix(RA): Persist selectedOrganizer
63d9c34 | Aug 16 | feat: Regional Admin support
b94e7fe | Aug 15 | fix: Update EventDetailModal permissions
8e17a75 | Aug 15 | fix: Correct variable name
```

### TEST (Aug 18-21) - Selected Recent
```
db47099 | Aug 21 | fix(TIEMPO-264): Remove default fallback image
87508bc | Aug 21 | patch: UI refinements
070fb2c | Aug 21 | feat(TIEMPO-258): venue creation button
328c03f | Aug 21 | feat(TIEMPO-259): Map Center menu
8f0b743 | Aug 21 | fix(TIEMPO-239): handle Date objects
7ad9f55 | Aug 21 | feat(TIEMPO-257): deduplication extended
841b7ff | Aug 20 | Merge TIEMPO-246 venue-timezone-v3
aa0d04b | Aug 20 | fix(TIEMPO-253): profile completion check
a3c8626 | Aug 20 | feat(TIEMPO-254): save state management
c21845b | Aug 19 | fix(TIEMPO-252): calendar venue times
cd9da84 | Aug 18 | fix(TIEMPO-239): remove Date() critical
```

### DEVL (Aug 20-21)
```
7500aa7 | Aug 21 | feat(TIEMPO-257): request deduplication
841b7ff | Aug 20 | Merge TIEMPO-246 venue-timezone-v3
aa0d04b | Aug 20 | fix(TIEMPO-253): profile completion
a3c8626 | Aug 20 | feat(TIEMPO-254): save state management
319cffe | Aug 20 | fix(TIEMPO-253): Prevent event creation
```