'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import GhostModeToggle from '@/components/GhostModeToggle';
import ThemeQuickToggle from '@/components/ThemeQuickToggle';
import { useAuth } from '@/components/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-[240px] flex-col border-r bg-surface px-4 py-6">
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

      <div className="ml-[240px] flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background px-6 py-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search spots in Lagos"
              onFocus={() => router.push('/explore')}
              className="h-10 w-full rounded-full border bg-surface pl-10 pr-4 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <GhostModeToggle />
            <ThemeQuickToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
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
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
