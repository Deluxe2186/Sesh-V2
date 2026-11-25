import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are offline. Sesh will be back when your connection is.',
};

// Static page, cached by the service worker so it shows without a connection.
export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-2xl font-bold font-display">
        sesh<span className="text-accent">.</span>
      </span>
      <h1 className="text-3xl font-bold font-display">No signal</h1>
      <p className="max-w-sm text-muted">
        You are offline right now. Check your data or Wi-Fi, then try again.
        Spots you opened before may still load.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href="/explore"
          className="inline-flex min-h-[44px] items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground"
        >
          Try again
        </a>
      </div>
    </div>
  );
}
