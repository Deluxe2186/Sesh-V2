'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Keeps the sidebar / tab bar on screen when a single page breaks.
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold font-display">Something broke</h1>
      <p className="text-muted">We bailed on that trick. Give it another go.</p>
      <div className="flex gap-3">
        <Button onClick={reset} className="rounded-full px-6">
          Try again
        </Button>
        <Link href="/explore">
          <Button variant="outline" className="rounded-full px-6">
            Back to Explore
          </Button>
        </Link>
      </div>
    </div>
  );
}
