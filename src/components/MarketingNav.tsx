'use client';

import Link from 'next/link';
import ThemeQuickToggle from '@/components/ThemeQuickToggle';
import { Button } from '@/components/ui/button';

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur animate-fade-in-down">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="text-2xl font-bold font-display press-scale transition-colors duration-fast hover:text-accent" aria-label="Sesh home">
          sesh<span className="text-accent">.</span>
        </Link>
        <nav className="ml-8 hidden items-center gap-6 md:flex animate-stagger-fade-in" role="navigation" aria-label="Main navigation">
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-fast relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:origin-bottom-right after:transition-transform after:duration-fast hover:after:w-full hover:after:origin-bottom-left press-scale"
          >
            How it works
          </a>
          <a
            href="/#for-brands"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-fast relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:origin-bottom-right after:transition-transform after:duration-fast hover:after:w-full hover:after:origin-bottom-left press-scale"
          >
            For brands
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-3 animate-stagger-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="hidden sm:block">
            <ThemeQuickToggle />
          </div>
          <Link href="/login">
            <Button variant="ghost" className="rounded-full press-scale">Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-full press-scale">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}