'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-2xl font-bold font-display">
        sesh<span className="text-accent">.</span>
      </span>
      <h1 className="text-4xl font-bold font-display">Spot not found</h1>
      <p className="max-w-sm text-muted">
        This page rolled away. Head back and pick a new line.
      </p>
      <Link href="/explore">
        <Button className="rounded-full px-6">Back to Explore</Button>
      </Link>
    </div>
  );
}
