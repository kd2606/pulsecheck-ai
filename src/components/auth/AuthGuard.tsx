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
  if (role === 'patient') return path.startsWith('/dashboard/patient');
  if (role === 'worker') return path.startsWith('/dashboard/worker');
  return path.startsWith('/dashboard/district') || path.startsWith('/dashboard/worker');
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const [state, setState] = useState<'checking' | 'authorized' | 'redirecting'>('checking');

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
      if (cancelled) return;

      if (!user) {
        setState('redirecting');
        await fetch('/api/auth/session', { method: 'DELETE' });
        router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
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

      if (!isAllowed(role, pathname)) {
        setState('redirecting');
        router.replace(HOME_FOR[role]);
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
