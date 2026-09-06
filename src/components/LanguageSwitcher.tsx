'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { ChangeEvent } from 'react';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const switchLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    if (!pathname) return;
    
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = nextLocale;
      const newPath = segments.join('/');
      router.push(newPath);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-400" />
      <select
        value={locale}
        onChange={switchLanguage}
        className="bg-transparent text-sm font-medium text-slate-200 outline-none cursor-pointer focus:ring-0 border-none appearance-none hover:text-white"
        aria-label="Select language"
      >
        {LOCALES.map((loc) => (
          <option key={loc.code} value={loc.code} className="bg-slate-900 text-slate-200">
            {loc.label}
          </option>
        ))}
      </select>
    </div>
  );
}
