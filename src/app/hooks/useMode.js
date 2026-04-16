'use client';

import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { AuthContext } from '@/contexts/AuthContext';

const MODES = ['beginner', 'local', 'explore'];
const DEFAULT_MODE = 'local';
const COOKIE_NAME = 'tt_mode';

const normalize = (value) => (MODES.includes(value) ? value : null);

export function useMode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const urlMode = normalize(searchParams?.get('mode'));
  const userMode = normalize(user?.backendInfo?.preferredMode);
  const cookieMode = typeof window !== 'undefined' ? normalize(Cookies.get(COOKIE_NAME)) : null;

  const mode = useMemo(() => {
    if (pathname?.startsWith('/explore')) return 'explore';
    return urlMode || userMode || cookieMode || DEFAULT_MODE;
  }, [pathname, urlMode, userMode, cookieMode]);

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

    const onBoston = pathname?.startsWith('/calendar/boston');
    const baseRoute = onBoston ? '/calendar/boston' : '/calendar';

    if (target === 'local') {
      router.push(baseRoute);
    } else {
      router.push(`${baseRoute}?mode=beginner`);
    }
  }, [pathname, router]);

  return { mode, setMode };
}
