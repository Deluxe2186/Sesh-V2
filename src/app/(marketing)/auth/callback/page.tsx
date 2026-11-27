'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') || '/explore';

    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.push(next);
        router.refresh();
      });
    } else {
      router.push(`/login?error=${encodeURIComponent('Invalid confirmation link')}`);
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="animate-pulse text-center text-muted">
        <div className="h-8 w-8 mx-auto mb-4 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p>Verifying your account…</p>
      </div>
    </div>
  );
}