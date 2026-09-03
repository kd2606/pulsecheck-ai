import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { verifySessionCookie, type Role } from './lib/auth/verify-session';

const handleI18n = createMiddleware(routing);
const SESSION_COOKIE = '__session';

const HOME_FOR: Record<Role, string> = {
  patient: '/dashboard/patient',
  worker: '/dashboard/worker',
  district: '/dashboard/district',
};

function stripLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return { locale: maybeLocale, path: '/' + rest.join('/') };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

function localized(locale: string, path: string) {
  return `/${locale}${path}`;
}

export default async function proxy(request: NextRequest) {
  const { locale, path } = stripLocale(request.nextUrl.pathname);

  if (!path.startsWith('/dashboard')) {
    return handleI18n(request);
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySessionCookie(token) : null;

  if (!claims) {
    const url = request.nextUrl.clone();
    url.pathname = localized(locale, '/auth'); // Redirecting to your auth page
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    const res = NextResponse.redirect(url);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const role: Role = claims.role ?? 'patient';
  const allowed =
    (role === 'patient' && path.startsWith('/dashboard/patient')) ||
    (role === 'worker' && path.startsWith('/dashboard/worker')) ||
    (role === 'district' &&
      (path.startsWith('/dashboard/district') || path.startsWith('/dashboard/worker')));

  if (!allowed) {
    const url = request.nextUrl.clone();
    url.pathname = localized(locale, HOME_FOR[role]);
    url.search = '';
    return NextResponse.redirect(url);
  }

  return handleI18n(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
