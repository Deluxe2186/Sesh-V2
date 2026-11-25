'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-2xl font-bold font-display">
        sesh<span className="text-accent">.</span>
      </span>
      <h1 className="text-3xl font-bold font-display">Something broke</h1>
      <p className="max-w-sm text-muted">
        We bailed on that trick. Give it another go.
      </p>
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
