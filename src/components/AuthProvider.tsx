'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { signUp as authSignUp, logIn as authLogIn, logOut as authLogOut, getUser } from '@/lib/auth';
import type { SeshUser, SignUpInput, Stance, Level } from '@/lib/auth';

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

  useEffect(() => {
    let active = true;

    getUser().then((u) => {
      if (active) {
        setUser(u);
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const u = await authSignUp(input);
    setUser(u);
    return u;
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    const u = await authLogIn(email, password);
    setUser(u);
    return u;
  }, []);

  const logOut = useCallback(async () => {
    await authLogOut();
    setUser(null);
  }, []);

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