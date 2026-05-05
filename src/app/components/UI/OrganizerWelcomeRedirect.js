// OrganizerWelcomeRedirect — TIEMPO-454.
// Watches the Auth-context user state for the first transition into
// `regionalOrganizerInfo.isEnabled === true` and redirects to
// /organizers/welcome once per browser session.
//
// Mounted from <Providers />. No UI; purely a side-effect component.
// Repurposes the existing `organizerWelcomeShown` sessionStorage key
// from the now-killed YourStatusTab.showWelcome flow so users who saw
// the old card don't get re-redirected after the upgrade.

'use client';

import { useContext, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

const SESSION_KEY = 'organizerWelcomeShown';
const WELCOME_PATH = '/organizers/welcome';

const OrganizerWelcomeRedirect = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const previousIsEnabled = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isEnabled = Boolean(
      user?.backendInfo?.regionalOrganizerInfo?.isEnabled,
    );
    const isApproved = Boolean(
      user?.backendInfo?.regionalOrganizerInfo?.isApproved,
    );

    // Only redirect on the FIRST observed transition to enabled-and-approved
    // within this session, and never if the user is already on the welcome
    // page (or in the middle of applying).
    const wasNotEnabledBefore = previousIsEnabled.current === false;
    const onApplyOrWelcome =
      pathname === WELCOME_PATH || pathname?.startsWith('/organizers/apply');

    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      // private-mode / quota — treat as already-shown to avoid redirect loops
      alreadyShown = true;
    }

    if (
      isEnabled &&
      isApproved &&
      wasNotEnabledBefore &&
      !alreadyShown &&
      !onApplyOrWelcome
    ) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // ignore — best-effort
      }
      router.push(WELCOME_PATH);
    }

    previousIsEnabled.current = isEnabled;
  }, [user, pathname, router]);

  return null;
};

export default OrganizerWelcomeRedirect;
