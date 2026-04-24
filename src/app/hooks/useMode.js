'use client';

import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { AuthContext } from '@/contexts/AuthContext';

// TIEMPO-408 fix: path-first mode derivation. The toggle state must reflect
// the ACTUAL route the user is on, never a stale cookie/userPref that
// disagrees with what they're looking at.
//
// Previous bug: on /calendar, mode fell through to cookie || userPref ||
// default — so a user whose last-visited mode was Beginner would see the
// Beginner pill highlighted while actually on the Local calendar.
// Fix: pathname is authoritative. Cookie/userPref only influence navigation
// DECISIONS in setMode (where to land on fresh arrival), not current state.

const MODES = ['local', 'organizer', 'explore', 'beginner'];
const DEFAULT_MODE = 'local';
const COOKIE_NAME = 'tt_mode';

const normalize = (value) => (MODES.includes(value) ? value : null);

export function useMode() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  // Path-first derivation. Returns null on non-mode routes (root, /organizer/*,
  // /venue/*, /event/*, etc.) so the toggle can render un-highlighted.
  const mode = useMemo(() => {
    if (!pathname) return null;
    if (pathname.startsWith('/explore')) return 'explore';
    if (pathname.startsWith('/beginner')) return 'beginner';
    if (pathname.startsWith('/organizer')) return 'organizer';
    if (pathname.startsWith('/calendar')) return 'local'; // includes /calendar/boston
    return null;
  }, [pathname]);

  // Persist whatever the active route resolved to, so a first-visit user
  // who browses around then lands on '/' can be routed to their last mode.
  // (Note: this doesn't affect current-state — that's pathname-driven above.)
  useEffect(() => {
    if (typeof window !== 'undefined' && mode) {
      Cookies.set(COOKIE_NAME, mode, { expires: 365, sameSite: 'Lax' });
    }
  }, [mode]);

  const setMode = useCallback((newMode) => {
    const target = normalize(newMode) || DEFAULT_MODE;
    Cookies.set(COOKIE_NAME, target, { expires: 365, sameSite: 'Lax' });

    if (target === 'explore') {
      router.push('/explore');
      return;
    }
    if (target === 'beginner') {
      router.push('/beginner');
      return;
    }
    if (target === 'organizer') {
      router.push('/organizer');
      return;
    }
    // Local: if already on Boston variant, stay there; otherwise use /calendar.
    const onBoston = pathname?.startsWith('/calendar/boston');
    router.push(onBoston ? '/calendar/boston' : '/calendar');
  }, [pathname, router]);

  // Expose userPref read for future landing-page logic (TIEMPO-403). Not
  // consumed here — kept for downstream callers that want a landing hint.
  const preferredMode = normalize(user?.backendInfo?.preferredMode);

  return { mode, setMode, preferredMode };
}
