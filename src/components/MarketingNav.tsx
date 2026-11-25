'use client';

import Link from 'next/link';
import ThemeQuickToggle from '@/components/ThemeQuickToggle';
import { Button } from '@/components/ui/button';

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
        <Link href="/" className="text-2xl font-bold font-display">
          sesh<span className="text-accent">.</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 md:flex">
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="/#for-brands"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            For brands
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeQuickToggle />
          <Link href="/login">
            <Button variant="ghost" className="rounded-full">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
