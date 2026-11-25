'use client';

import { ChevronDown, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import { Button } from '@/components/ui/button';

const DOT_POSITIONS = [
  { top: '22%', left: '28%' },
  { top: '38%', left: '64%' },
  { top: '60%', left: '40%' },
  { top: '72%', left: '72%' },
];

const STEPS = [
  {
    n: '01',
    title: 'Find a spot',
    body: 'Browse verified spots across Lagos — plazas, stairs, rails, banks and flatground — filtered by area and obstacles.',
  },
  {
    n: '02',
    title: 'See who is there',
    body: 'Every spot shows a live count of skaters there right now, so you know if the session is already going.',
  },
  {
    n: '03',
    title: 'Join the session',
    body: 'Cruise over, check the local notes for the best time, and share your location so others can find you too.',
  },
  {
    n: '04',
    title: 'Add new spots',
    body: 'Found a hidden gem? Drop it on the map with obstacles, surface and notes so the whole community can skate it.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingNav />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-20 md:flex-row md:items-center">
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border bg-surface px-4 py-1.5 text-sm font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-[var(--live)]" />
              Live now in Lagos
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[115%] font-display md:text-5xl">
              Know where the session is before you leave home.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-[150%] text-muted">
              Sesh shows verified skate spots across Nigeria and how many
              skaters are there right now.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/explore">
                <Button size="lg" className="rounded-full px-7 text-base">
                  Open the app
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7 text-base"
                >
                  See how it works
                </Button>
              </a>
            </div>
          </div>

          {/* App preview card */}
          <div className="relative w-full max-w-md flex-1">
            <div className="relative overflow-hidden rounded-[16px] border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold font-display">
                  Lagos · Live map
                </span>
                <span className="rounded-full bg-[var(--live)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--live)]">
                  8 spots
                </span>
              </div>
              <div
                className="relative h-[300px] overflow-hidden rounded-[12px] border"
                style={{
                  background:
                    'linear-gradient(135deg, var(--border) 0%, var(--background) 70%)',
                }}
              >
                {/* faux street grid */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-40"
                  viewBox="0 0 400 300"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 90 L400 70 M0 160 L400 180 M0 240 L400 220 M80 0 L100 300 M200 0 L210 300 M310 0 L330 300"
                    stroke="var(--muted)"
                    strokeWidth="1"
                  />
                </svg>
                {DOT_POSITIONS.map((pos, i) => (
                  <span
                    key={i}
                    className="absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-accent"
                    style={pos}
                  />
                ))}
                {/* Floating live card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-[12px] border bg-surface p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--live)] opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--live)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        Yaba Plaza Ledges
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <Users className="h-3 w-3" />
                        5 skating now
                      </p>
                    </div>
                    <MapPin className="ml-auto h-4 w-4 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Thin strip */}
        <div className="border-y bg-surface">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Built for Lagos. Works with low data.
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold font-display">How it works</h2>
              <p className="mt-2 text-muted">
                Four steps from your door to the session.
              </p>
            </div>
            <ChevronDown className="hidden h-6 w-6 text-muted md:block" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-[12px] border bg-surface p-6"
              >
                <span className="text-sm font-bold text-accent font-display">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-semibold font-display">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[150%] text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* For skaters / For brands */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="grid gap-4 md:grid-cols-2">
            <div id="for-skaters" className="rounded-[16px] border bg-surface p-8">
              <h2 className="text-2xl font-bold font-display">For skaters</h2>
              <p className="mt-3 text-muted">
                Stop guessing if the spot is lit. See live counts, read notes
                from skaters who ride there, and share your location only when
                you want to. Ghost mode hides you anytime, no questions asked.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm">
                {[
                  'Live counts on every spot',
                  'Obstacles, surface and best-time notes',
                  'Ghost mode keeps your session private',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="mt-8 rounded-full">Create your account</Button>
              </Link>
            </div>

            <div id="for-brands" className="scroll-mt-20 rounded-[16px] border bg-surface p-8">
              <h2 className="text-2xl font-bold font-display">For brands</h2>
              <p className="mt-3 text-muted">
                Sponsor weekly challenges and reach Nigerian skaters directly.
                Put your gear in front of the community that is actually
                skating, not just scrolling.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm">
                {[
                  'Sponsor weekly spot challenges',
                  'Reach Lagos skaters where they skate',
                  'Support the scene, grow your name',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@sesh.ng">
                <Button variant="outline" className="mt-8 rounded-full">
                  Talk to us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-surface">
        <div className="mx-auto flex h-20 w-full max-w-6xl flex-col items-center justify-center gap-2 px-6 text-sm text-muted md:flex-row md:justify-between">
          <span className="font-bold text-foreground font-display">
            Sesh. Built in Lagos.
          </span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
