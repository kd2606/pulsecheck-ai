'use client';

import { useEffect, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/firebase/clientApp'; // Updated to match actual structure
import { useRouter, usePathname } from 'next/navigation';
import FullScreenLoader from './FullScreenLoader';

type Role = 'patient' | 'worker' | 'district';

const HOME_FOR: Record<Role, string> = {
  patient: '/dashboard/patient',
  worker: '/dashboard/worker',
  district: '/dashboard/district',
};

function isAllowed(role: Role, path: string) {
  // Check if the path contains the required route, ignoring the /[locale] prefix
  if (role === 'patient') return path.includes('/dashboard/patient');
  if (role === 'worker') return path.includes('/dashboard/worker');
  return path.includes('/dashboard/district') || path.includes('/dashboard/worker');
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [state, setState] = useState<'checking' | 'authorized' | 'redirecting'>('checking');

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
      if (cancelled) return;

      const currentLocale = pathname.split('/')[1] || 'en';

      if (!user) {
        setState('redirecting');
        await fetch('/api/auth/session', { method: 'DELETE' });
        
        let authPath = '/auth/patient';
        if (pathname.includes('/dashboard/worker')) {
          authPath = '/auth/worker';
        } else if (pathname.includes('/dashboard/district')) {
          authPath = '/auth/district';
        }
        
        router.replace(`/${currentLocale}${authPath}?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const result = await user.getIdTokenResult();
      if (cancelled) return;

      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: result.token }),
      });

      const role = (result.claims.role as Role) ?? 'patient';
      const isDemo = result.claims.email === 'demo@diagnoverseai.in';

      // Always redirect from the root dashboard path to the role-specific dashboard
      const purePath = pathname.replace(`/${currentLocale}`, '') || '/';
      if (purePath === '/dashboard' || purePath === '/dashboard/') {
        setState('redirecting');
        router.replace(`/${currentLocale}${HOME_FOR[role]}`);
        return;
      }

      if (!isDemo && !isAllowed(role, pathname)) {
        setState('redirecting');
        router.replace(`/${currentLocale}${HOME_FOR[role]}`);
        return;
      }

      setState('authorized');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pathname, router]);

  if (state !== 'authorized') return <FullScreenLoader />;
  return <>{children}</>;
}
