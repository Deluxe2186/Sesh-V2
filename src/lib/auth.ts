'use client';

import { createClient } from '@/lib/supabase/client';
import type { Level, Stance } from '@/types';

export type { Level, Stance };

export interface SeshUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  shareLocation: boolean;
  stance?: Stance;
  level?: Level;
}

export interface SignUpInput {
  name: string;
  handle: string;
  email: string;
  password: string;
  shareLocation: boolean;
}

// Singleton Supabase client for client-side use
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

// Clean up legacy localStorage keys on first run
if (typeof window !== 'undefined') {
  const MIGRATION_FLAG = 'sesh-auth-migrated';
  if (!window.localStorage.getItem(MIGRATION_FLAG)) {
    window.localStorage.removeItem('sesh-users');
    window.localStorage.removeItem('sesh-session');
    window.localStorage.setItem(MIGRATION_FLAG, '1');
  }
}

function sanitizeHandle(handle: string): string {
  return handle.replace(/^@/, '').trim().toLowerCase();
}

function mapSupabaseUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }): SeshUser {
  return {
    id: user.id,
    name: (user.user_metadata?.name as string) || '',
    handle: (user.user_metadata?.handle as string) || '',
    email: user.email || '',
    shareLocation: (user.user_metadata?.shareLocation as boolean) ?? false,
    stance: user.user_metadata?.stance as Stance | undefined,
    level: user.user_metadata?.level as Level | undefined,
  };
}

export async function signUp(input: SignUpInput): Promise<SeshUser> {
  const supabase = getSupabase();
  const handle = sanitizeHandle(input.handle);
  const email = input.email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        handle,
        shareLocation: input.shareLocation,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
      if (msg.includes('email')) throw new Error('An account with that email already exists.');
      throw new Error('That username is already taken.');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Sign up failed');

  // If email confirmation is required, signUp won't create a session.
  // Auto sign-in to establish the session immediately.
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (signInError) throw new Error(signInError.message);
  if (!signInData.user) throw new Error('Sign in after sign up failed');

  return mapSupabaseUser(signInData.user);
}

export async function logIn(email: string, password: string): Promise<SeshUser> {
  const supabase = getSupabase();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('not found') || msg.includes('credentials')) {
      throw new Error('Wrong email or password.');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Login failed');

  return mapSupabaseUser(data.user);
}

export async function logOut(): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getUser(): Promise<SeshUser | null> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return mapSupabaseUser(session.user);
}