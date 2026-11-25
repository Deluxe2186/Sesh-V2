'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'sesh-install-dismissed';

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua);
  // Chrome, Firefox and Edge on iOS cannot add to the home screen the same way
  const isOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && !isOtherBrowser;
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!isIosSafari() || isStandalone()) return;
      if (window.localStorage.getItem(DISMISS_KEY) === '1') return;
      setShow(true);
    } catch {
      // Storage blocked: stay hidden rather than nag on every visit.
    }
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  }

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex items-center gap-3 rounded-[12px] border bg-surface p-3 shadow-lg lg:hidden"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent text-lg font-bold text-accent-foreground">
        s
      </span>
      <p className="flex-1 text-sm">
        <span className="font-semibold">Install Sesh:</span> tap Share, then Add
        to Home Screen.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={dismiss}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
