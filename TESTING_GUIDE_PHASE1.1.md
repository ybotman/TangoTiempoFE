# TIEMPO-329 Phase 1.1 Testing Guide

## 🎯 What Got Built

**Smart Onboarding Workflow:**
- Visit 1: Full welcome ("Welcome to Tango Tiempo!" with stats)
- Visit 2: Welcome back (simple friendly message)
- Visits 3-4: Silent load (no interruption)
- Visit 5+: Signup prompt (every visit until they sign up)

**GPS Auto-Center:**
- If no saved location exists, automatically centers map to GPS coordinates with 75-mile zoom

---

## 🧪 Quick Testing Commands

### Test Visit 1 (First Time Visitor)
Paste in browser console:
```javascript
localStorage.clear();
document.cookie = 'visitor_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
sessionStorage.clear();
location.reload();
```
**Expected:** Full "Welcome to Tango Tiempo!" modal with deployment stats

---

### Test Visit 2 (Welcome Back)
After seeing Visit 1, just reload:
```javascript
location.reload();
```
**Expected:** "Welcome Back!" modal with waving hand icon

---

### Test Visit 3-4 (Silent)
Keep reloading:
```javascript
location.reload(); // Visit 3 - should be silent
location.reload(); // Visit 4 - should be silent
```
**Expected:** No modal, goes straight to calendar

---

### Test Visit 5+ (Signup Prompt)
One more reload:
```javascript
location.reload(); // Visit 5
```
**Expected:** "You're a regular!" modal with signup benefits:
- Save your location
- Favorite events
- Follow organizers
- Event notifications

Every subsequent reload should show the same signup prompt.

---

## 🔍 Debug Current State

Check what visit number you're on:
```javascript
console.log('Visit #:', localStorage.getItem('visit_count'));
console.log('Full state:', {
  visitCount: localStorage.getItem('visit_count'),
  visitorId: document.cookie.match(/visitor_id=([^;]+)/)?.[1],
  welcomeShown: localStorage.getItem('welcome_shown')
});
```

---

## 🧹 Reset Everything

Complete reset to test from scratch:
```javascript
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

## 📍 GPS Auto-Center Testing

**To test GPS auto-center:**
1. Clear all data (use reset command above)
2. Reload page
3. When browser asks for location permission, click "Allow"
4. **Expected:** Map should automatically center to your GPS coordinates with 75-mile radius
5. Check console for: `[Auto-Center] Setting map center from GPS:`

**To test without GPS:**
1. Clear all data
2. Block location permission when browser asks
3. **Expected:** Map will NOT auto-center, will wait for user to select location

---

## 🚀 Files Changed (Commit e1075be)

1. **src/app/utils/visitorTracking.js** - Added visit counter functions
2. **src/app/components/Modals/Welcome/SignupPromptContent.js** - New signup component
3. **src/app/components/Modals/Welcome/WelcomeModal.js** - Updated state logic
4. **src/app/calendar/layout.js** - Added GPS auto-center logic

---

## ✅ Ready for TEST Merge?

After testing locally, if everything works:
1. Confirm visit pattern works (1, 2, 3-4, 5+)
2. Confirm GPS auto-center works
3. Approve merge to TEST

---

**Built by Sarah (AI Agent) on 2025-10-28**
**Commit:** e1075be
**Branch:** DEVL
**Status:** Ready for testing
