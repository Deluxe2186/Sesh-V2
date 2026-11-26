'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (!pathname) return;

    // Start transition
    setShowContent(false);
    setIsTransitioning(true);

    // Small delay to allow exit animation
    const timer = setTimeout(() => {
      setShowContent(true);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative">
      {/* Page exit/enter overlay */}
      <div
        className={`fixed inset-0 z-50 bg-background transform transition-transform duration-normal ease-out pointer-events-none ${
          isTransitioning && !showContent ? 'scale-y-100 origin-top' : 'scale-y-0 origin-top'
        } ${showContent ? 'scale-y-0 origin-bottom' : 'scale-y-100 origin-top'}`}
        aria-hidden="true"
      />

      {/* Content with enter animation */}
      <div
        className={`transition-all duration-normal ease-out ${
          showContent
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Alternative: View transition API wrapper for smoother transitions
export function ViewTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!pathname) return;

    if (!document.startViewTransition) {
      setKey((k) => k + 1);
      return;
    }

    // Use View Transition API for browsers that support it
    const transition = document.startViewTransition(() => {
      setKey((k) => k + 1);
    });

    transition.ready.then(() => {
      // Transition is ready
    });
  }, [pathname]);

  return <div key={key}>{children}</div>;
}