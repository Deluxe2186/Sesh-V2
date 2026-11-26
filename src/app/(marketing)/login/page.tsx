'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';

interface Errors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Errors = {};
    if (!email.trim()) {
      next.email = 'Enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!password) {
      next.password = 'Enter your password.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await logIn(email, password);
      router.push('/explore');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Could not log in.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <MarketingNav />
      <main className="flex flex-1 items-center justify-center px-6 py-16 animate-fade-in-up">
        <div className="w-full max-w-sm animate-stagger-fade-in">
          <div className="rounded-[12px] border bg-surface p-8 card-hover hover-lift-sm stagger-1 animate-fade-in-up">
            <h1 className="text-2xl font-bold font-display stagger-2 animate-fade-in-up">Welcome back</h1>
            <p className="mt-1 text-sm text-muted stagger-3 animate-fade-in-up">
              Log in to see live sessions across Lagos.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 animate-stagger-fade-in" noValidate>
              {errors.form && (
                <div className="rounded-[12px] border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-foreground animate-fade-in-down stagger-1">
                  {errors.form}
                </div>
              )}

              <Field
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@lagos.ng"
                error={errors.email}
                autoComplete="email"
              />
              <Field
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                error={errors.password}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                className="mt-2 w-full rounded-full press-scale hover-lift stagger-4 animate-fade-in-up"
                disabled={submitting}
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted stagger-5 animate-fade-in-up">
              New to Sesh?{' '}
              <Link href="/signup" className="font-medium text-accent hover:underline transition-colors duration-fast">
                Create an account
              </Link>
            </p>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted stagger-6 animate-fade-in-up">
            <MapPin className="h-3 w-3" />
            Lagos, Nigeria
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 stagger-1 animate-fade-in-up transition-all duration-fast">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`h-10 rounded-[12px] border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-fast ${
          error ? 'border-[var(--warning)] focus:border-[var(--warning)] focus:ring-[var(--warning)]' : ''
        }`}
      />
      {error && <span className="text-xs text-[var(--warning)] animate-fade-in-down">{error}</span>}
    </div>
  );
}