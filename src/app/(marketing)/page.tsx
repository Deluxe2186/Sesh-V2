'use client';

import { ChevronDown, MapPin, Users, Skull, MapPin as MapPinIcon, Sparkles, Shield } from 'lucide-react';
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
    icon: MapPinIcon,
  },
  {
    n: '02',
    title: 'See who is there',
    body: 'Every spot shows a live count of skaters there right now, so you know if the session is already going.',
    icon: Users,
  },
  {
    n: '03',
    title: 'Join the session',
    body: 'Cruise over, check the local notes for the best time, and share your location so others can find you too.',
    icon: Sparkles,
  },
  {
    n: '04',
    title: 'Add new spots',
    body: 'Found a hidden gem? Drop it on the map with obstacles, surface and notes so the whole community can skate it.',
    icon: Shield,
  },
];

const TRUST_SIGNALS = [
  { label: 'Active skaters', value: '2,800+', icon: Users },
  { label: 'Verified spots', value: '47', icon: MapPinIcon },
  { label: 'Weekly sessions', value: '120+', icon: Sparkles },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingNav />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-20 md:flex-row md:items-center">
          <div className="flex-1">
            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-3 mb-6" role="list" aria-label="Trust signals">
              {TRUST_SIGNALS.map((signal, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-4 py-1.5 text-sm font-medium text-muted" role="listitem">
                  <signal.icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>{signal.value}</span>
                  <span className="text-xs text-muted-foreground">{signal.label}</span>
                </span>
              ))}
            </div>

            <h1 className="mt-4 max-w-xl text-4xl font-bold leading-[110%] font-display md:text-5xl lg:text-6xl">
              Stop guessing.<br />
              <span className="text-accent">Know where the session is</span> before you leave home.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-[160%] text-muted">
              Real-time skater counts on every verified spot across Lagos.
              No more showing up to empty plazas. No more missed sessions.
            </p>

            {/* Primary CTA with micro-copy */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="rounded-full px-8 text-base group min-h-[48px]" aria-label="Open the live map to see active spots">
                  Open the map →
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">Live now</span>
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-base min-h-[48px]"
                >
                  How it works
                </Button>
              </a>
            </div>

            {/* Social proof strip */}
            <div className="mt-10 flex items-center gap-4 text-sm text-muted" aria-label="Community trust">
              <div className="flex -space-x-2" aria-hidden="true">
                {['🛹', '🛹', '🛹', '🛹', '🛹'].map((emoji, i) => (
                  <span key={i} className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[14px]">
                    {emoji}
                  </span>
                ))}
              </div>
              <span>Trusted by the Lagos skate community</span>
            </div>
          </div>

          {/* App preview card */}
          <div className="relative w-full max-w-md flex-1">
            <div className="relative overflow-hidden rounded-[16px] border bg-surface p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold font-display">
                  Lagos · Live map
                </span>
                <span className="rounded-full bg-[var(--live)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--live)]">
                  8 spots active
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
                  aria-hidden="true"
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
                    className="absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-accent animate-pulse"
                    style={pos}
                    aria-hidden="true"
                  />
                ))}
                {/* Floating live card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-[12px] border bg-surface p-3 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--live)] opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--live)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        Yaba Plaza Ledges
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <Users className="h-3 w-3" aria-hidden="true" />
                        5 skating now
                      </p>
                    </div>
                    <MapPin className="ml-auto h-4 w-4 text-accent" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mini feature highlights */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center" role="list" aria-label="Key features">
              <div className="rounded-[10px] bg-surface/50 p-3" role="listitem">
                <p className="text-2xl font-bold font-display text-accent">0s</p>
                <p className="text-xs text-muted">Latency</p>
              </div>
              <div className="rounded-[10px] bg-surface/50 p-3" role="listitem">
                <p className="text-2xl font-bold font-display text-accent">100%</p>
                <p className="text-xs text-muted">Verified</p>
              </div>
              <div className="rounded-[10px] bg-surface/50 p-3" role="listitem">
                <p className="text-2xl font-bold font-display text-accent">Free</p>
                <p className="text-xs text-muted">Forever</p>
              </div>
            </div>
          </div>
        </section>

        {/* Thin strip */}
        <div className="border-y bg-surface">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Built for Lagos. Works with low data.
          </div>
        </div>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24" aria-labelledby="how-it-works-heading">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 id="how-it-works-heading" className="text-3xl font-bold font-display">How it works</h2>
              <p className="mt-2 text-muted">
                Four steps from your door to the session.
              </p>
            </div>
            <ChevronDown className="hidden h-6 w-6 text-muted md:block" aria-hidden="true" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <article
                key={step.n}
                className="rounded-[12px] border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/10 text-accent" aria-hidden="true">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="mt-3 block text-sm font-bold text-accent font-display">
                  {step.n}
                </span>
                <h3 className="mt-2 text-lg font-semibold font-display">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[160%] text-muted">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* For skaters / For brands */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24" aria-labelledby="audiences-heading">
          <h2 id="audiences-heading" className="sr-only">Who Sesh is for</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article id="for-skaters" className="rounded-[16px] border bg-surface p-8 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-accent/10 text-accent mb-4" aria-hidden="true">
                <Skull className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display">For skaters</h2>
              <p className="mt-3 text-muted leading-[160%]">
                Stop guessing if the spot is lit. See live counts, read notes
                from skaters who ride there, and share your location only when
                you want to. Ghost mode hides you anytime, no questions asked.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm" role="list">
                {[
                  'Live counts on every spot',
                  'Obstacles, surface and best-time notes',
                  'Ghost mode keeps your session private',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3" role="listitem">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="mt-8 rounded-full w-full min-h-[48px]">Create your account</Button>
              </Link>
            </article>

            <article id="for-brands" className="scroll-mt-20 rounded-[16px] border bg-surface p-8 transition-shadow hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-accent/10 text-accent mb-4" aria-hidden="true">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold font-display">For brands</h2>
              <p className="mt-3 text-muted leading-[160%]">
                Sponsor weekly challenges and reach Nigerian skaters directly.
                Put your gear in front of the community that is actually
                skating, not just scrolling.
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm" role="list">
                {[
                  'Sponsor weekly spot challenges',
                  'Reach Lagos skaters where they skate',
                  'Support the scene, grow your name',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3" role="listitem">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@sesh.ng">
                <Button variant="outline" className="mt-8 rounded-full w-full min-h-[48px]">
                  Talk to us
                </Button>
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t bg-surface" role="contentinfo">
        <div className="mx-auto flex h-20 w-full max-w-6xl flex-col items-center justify-center gap-2 px-6 text-sm text-muted md:flex-row md:justify-between">
          <span className="font-bold text-foreground font-display">
            Sesh. Built in Lagos.
          </span>
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <Link href="/login" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded">
              Sign up
            </Link>
            <a href="#how-it-works" className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded">
              How it works
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
