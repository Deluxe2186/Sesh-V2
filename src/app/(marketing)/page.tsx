'use client';

import { ChevronDown, MapPin, Users, Skull, Sparkles, Shield, Check } from 'lucide-react';
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
    title: 'Find a spot',
    body: 'Browse verified spots across Lagos — plazas, stairs, rails, banks and flatground — filtered by area and obstacles.',
    icon: MapPin,
  },
  {
    title: 'See who\'s there',
    body: 'Every spot shows a live count of skaters there right now, so you know if the session is already going.',
    icon: Users,
  },
  {
    title: 'Join the session',
    body: 'Cruise over, check the local notes for the best time, and share your location so others can find you too.',
    icon: Sparkles,
  },
  {
    title: 'Add new spots',
    body: 'Found a hidden gem? Drop it on the map with obstacles, surface and notes so the whole community can skate it.',
    icon: Shield,
  },
];

const TRUST_SIGNALS = [
  { label: 'Active skaters', value: '2,800+' },
  { label: 'Verified spots', value: '47' },
  { label: 'Weekly sessions', value: '120+' },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <MarketingNav />

      <main className="flex flex-1 flex-col">
        {/* Hero - map leads on mobile, side-by-side on desktop */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center md:text-left md:max-w-none">
            <p className="text-sm font-medium text-muted tracking-wide">
              Live in Lagos
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[110%] font-display md:text-5xl lg:text-6xl">
              Know where the session is before you leave home.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-[160%] text-muted mx-auto md:mx-0">
              Real-time skater counts on every verified spot across Lagos.
              No more showing up to empty plazas. No more missed sessions.
            </p>

            {/* Trust signals - minimal, inline */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted" role="list" aria-label="Trust signals">
              {TRUST_SIGNALS.map((signal, i) => (
                <span key={i} className="flex items-center gap-1.5" role="listitem">
                  <span className="font-semibold">{signal.value}</span>
                  <span>{signal.label}</span>
                </span>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="rounded-full px-8 text-base min-h-[48px] w-full sm:w-auto" aria-label="Open the live map to see active spots">
                  Open the map
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 text-base min-h-[48px] w-full sm:w-auto"
                >
                  How it works
                </Button>
              </a>
            </div>
          </div>

          {/* App preview card - the hero image, shown on all screens */}
          <div className="mt-12 md:mt-0 relative w-full max-w-md mx-auto md:ml-auto md:max-w-lg">
            <div className="relative overflow-hidden rounded-[16px] border bg-surface p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold font-display">
                  Lagos · Live map
                </span>
                <span className="rounded-full bg-[var(--live)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--live)]">
                  8 spots active
                </span>
              </div>
              <div
                className="relative h-[280px] overflow-hidden rounded-[12px] border"
                style={{
                  background:
                    'linear-gradient(135deg, var(--border) 0%, var(--background) 70%)',
                }}
                aria-hidden="true"
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
                    className="absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-accent animate-pulse"
                    style={pos}
                  />
                ))}
                {/* Floating live card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-[12px] border bg-surface p-3 shadow-sm animate-fade-in">
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
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Built for Lagos. Works with low data.
          </div>
        </div>

        {/* How it works - editorial layout, not card grid */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-6 py-20 md:py-28" aria-labelledby="how-it-works-heading">
          <header className="mb-16 max-w-2xl">
            <h2 id="how-it-works-heading" className="text-3xl font-bold font-display md:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-muted leading-[160%]">
              Four steps from your door to the session.
            </p>
          </header>

          <div className="space-y-8 md:space-y-12">
            {STEPS.map((step, index) => (
              <article
                key={step.title}
                className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8 p-0"
              >
                {/* Number - subtle, not a badge */}
                <span className="flex-shrink-0 w-8 text-right text-2xl font-bold font-display text-accent/30 md:w-10" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/10 text-accent" aria-hidden="true">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold font-display">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-[160%] text-muted pl-12 md:pl-0">
                    {step.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* For skaters / For brands - distinct, not identical cards */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 md:pb-28" aria-labelledby="audiences-heading">
          <h2 id="audiences-heading" className="sr-only">Who Sesh is for</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <article id="for-skaters" className="rounded-[16px] border bg-surface p-6 md:p-8">
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
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent" aria-hidden="true">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="mt-8 rounded-full w-full min-h-[48px]">Create your account</Button>
              </Link>
            </article>

            <article id="for-brands" className="rounded-[16px] bg-accent/5 p-6 md:p-8 border border-accent/20">
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
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent" aria-hidden="true">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@sesh.ng">
                <Button variant="outline" className="mt-8 rounded-full w-full min-h-[48px] border-accent text-accent hover:bg-accent/10">
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