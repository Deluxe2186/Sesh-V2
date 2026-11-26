'use client';

import { Compass, Flame, Plus, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/heatmap', label: 'Heatmap', icon: Flame },
  { href: '/add-spot', label: 'Add', icon: Plus },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-around">
        {TABS.map((tab) => {
          // Spot pages belong to Explore
          const active =
            pathname.startsWith(tab.href) ||
            (tab.href === '/explore' && pathname.startsWith('/spot'));
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
