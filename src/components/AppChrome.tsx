'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search, WifiOff, X } from 'lucide-react';
import { useRef, useState } from 'react';
import MobileTabBar from '@/components/MobileTabBar';
import GhostModeToggle from '@/components/GhostModeToggle';
import ThemeQuickToggle from '@/components/ThemeQuickToggle';
import { useAuth } from '@/components/AuthProvider';
import { useSettings } from '@/lib/settings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { href: '/explore', label: 'Explore' },
  { href: '/heatmap', label: 'Heatmap' },
  { href: '/add-spot', label: 'Add a spot' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logOut } = useAuth();
  const { settings } = useSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const displayName = user?.name ?? 'Guest';
  const handle = user?.handle ?? 'guest';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleLogOut() {
    await logOut();
    router.push('/login');
  }

  return (
    <div className="flex min-h-[100dvh]">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col lg:flex border-r bg-surface px-4 py-6 z-50">
        <Link href="/explore" className="mb-8 px-2 text-2xl font-bold font-display">
          sesh<span className="text-accent">.</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted hover:bg-background hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:ml-[240px]">
        <header className="sticky top-0 z-[60] isolate flex items-center gap-2 border-b bg-background px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:gap-4 lg:px-6 lg:pt-3">
          {/* Mobile: logo, expanding search */}
          {!searchOpen && (
            <Link
              href="/explore"
              className="text-xl font-bold font-display lg:hidden"
            >
              sesh<span className="text-accent">.</span>
            </Link>
          )}
          {searchOpen && (
            <div className="relative flex-1 lg:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                ref={searchRef}
                type="search"
                autoFocus
                aria-label="Search spots in Lagos"
                placeholder="Search spots in Lagos"
                onFocus={() => router.push('/explore')}
                className="h-11 w-full rounded-full border bg-surface pl-10 pr-4 text-base outline-none focus:border-accent"
              />
            </div>
          )}
          <button
            type="button"
            aria-label={searchOpen ? 'Close search' : 'Search spots'}
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-surface lg:hidden"
          >
            {searchOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>

          {/* Desktop search */}
          <div className="relative hidden w-full max-w-md lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              aria-label="Search spots in Lagos"
              placeholder="Search spots in Lagos"
              onFocus={() => router.push('/explore')}
              className="h-10 w-full rounded-full border bg-surface pl-10 pr-4 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className={`items-center gap-2 lg:ml-auto lg:flex lg:gap-3 ${searchOpen ? 'hidden' : 'ml-auto flex'}`}>
            {settings.lowDataMode && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <WifiOff className="h-3 w-3" />
                Low data
              </Badge>
            )}
            <GhostModeToggle />
            <div className="hidden lg:block">
              <ThemeQuickToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground lg:h-9 lg:w-9"
                  title={`@${handle}`}
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs font-normal text-muted">
                    @{handle}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut} className="text-muted">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 lg:px-6 lg:pb-8 lg:pt-8">
          {children}
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
