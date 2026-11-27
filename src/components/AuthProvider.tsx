'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { SeshUser, SignUpInput, Stance, Level } from '@/lib/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: SeshUser | null;
  ready: boolean;
  signUp: (input: SignUpInput) => Promise<SeshUser>;
  logIn: (email: string, password: string) => Promise<SeshUser>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SeshUser | null>(null);
  const [ready, setReady] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let active = true;

    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      if (active && session?.user) {
        const u: SeshUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          handle: session.user.user_metadata?.handle || '',
          email: session.user.email || '',
          shareLocation: session.user.user_metadata?.shareLocation || false,
          stance: session.user.user_metadata?.stance as Stance | undefined,
          level: session.user.user_metadata?.level as Level | undefined,
        };
        setUser(u);
      }
      if (active) setReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (!active) return;
      if (session?.user) {
        const u: SeshUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          handle: session.user.user_metadata?.handle || '',
          email: session.user.email || '',
          shareLocation: session.user.user_metadata?.shareLocation || false,
          stance: session.user.user_metadata?.stance as Stance | undefined,
          level: session.user.user_metadata?.level as Level | undefined,
        };
        setUser(u);
      } else {
        setUser(null);
      }
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signUp = useCallback(async (input: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          name: input.name.trim(),
          handle: input.handle.replace(/^@/, '').trim().toLowerCase(),
          shareLocation: input.shareLocation,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign up failed');

    // If email confirmation is required, signUp won't create a session.
    // Auto sign-in to establish the session immediately.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    if (signInError) throw new Error(signInError.message);
    if (!signInData.user) throw new Error('Sign in after sign up failed');

    const u: SeshUser = {
      id: signInData.user.id,
      name: signInData.user.user_metadata?.name || input.name.trim(),
      handle: signInData.user.user_metadata?.handle || input.handle.replace(/^@/, '').trim().toLowerCase(),
      email: signInData.user.email || input.email.trim().toLowerCase(),
      shareLocation: signInData.user.user_metadata?.shareLocation ?? input.shareLocation,
      stance: signInData.user.user_metadata?.stance as Stance | undefined,
      level: signInData.user.user_metadata?.level as Level | undefined,
    };
    setUser(u);
    return u;
  }, [supabase]);

  const logIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Login failed');

    const u: SeshUser = {
      id: data.user.id,
      name: data.user.user_metadata?.name || '',
      handle: data.user.user_metadata?.handle || '',
      email: data.user.email || '',
      shareLocation: data.user.user_metadata?.shareLocation || false,
      stance: data.user.user_metadata?.stance,
      level: data.user.user_metadata?.level,
    };
    setUser(u);
    return u;
  }, [supabase]);

  const logOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, signUp, logIn, logOut }),
    [user, ready, signUp, logIn, logOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}