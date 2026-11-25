import type { Level, Stance } from '@/types';

export interface SeshUser {
  id: string;
  name: string;
  handle: string;
  email: string;
  shareLocation: boolean;
  stance?: Stance;
  level?: Level;
}

interface StoredSession {
  user: SeshUser;
  password: string;
}

const USERS_KEY = 'sesh-users';
const SESSION_KEY = 'sesh-session';

function readUsers(): StoredSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredSession[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredSession[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): SeshUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SeshUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: SeshUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

function sanitizeHandle(handle: string): string {
  return handle.replace(/^@/, '').trim().toLowerCase();
}

export interface SignUpInput {
  name: string;
  handle: string;
  email: string;
  password: string;
  shareLocation: boolean;
}

export async function signUp(input: SignUpInput): Promise<SeshUser> {
  const users = readUsers();
  const handle = sanitizeHandle(input.handle);
  const email = input.email.trim().toLowerCase();

  if (users.some((u) => u.user.handle === handle)) {
    throw new Error('That username is already taken.');
  }
  if (users.some((u) => u.user.email === email)) {
    throw new Error('An account with that email already exists.');
  }

  const user: SeshUser = {
    id: `user-${Date.now()}`,
    name: input.name.trim(),
    handle,
    email,
    shareLocation: input.shareLocation,
  };

  writeUsers([...users, { user, password: input.password }]);
  writeSession(user);
  return user;
}

export async function logIn(email: string, password: string): Promise<SeshUser> {
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  const match = users.find((u) => u.user.email === normalized);

  if (!match || match.password !== password) {
    throw new Error('Wrong email or password.');
  }

  writeSession(match.user);
  return match.user;
}

export async function logOut(): Promise<void> {
  writeSession(null);
}

export async function getUser(): Promise<SeshUser | null> {
  return readSession();
}
