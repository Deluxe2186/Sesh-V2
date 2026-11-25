'use client';

import { useAuth } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex h-[40vh] items-center justify-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold font-display">Profile</h1>
        <p className="mt-4 text-muted">
          You are not signed in. Log in to see your profile.
        </p>
      </div>
    );
  }

  const initial = user.name[0]?.toUpperCase() ?? '?';

  return (
    <div>
      <h1 className="text-2xl font-bold font-display">Profile</h1>
      <div className="mt-6 max-w-md rounded-[12px] border bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-semibold font-display">{user.name}</h2>
            <p className="text-sm text-muted">@{user.handle}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Location sharing</dt>
            <dd className="mt-0.5 font-medium">
              {user.shareLocation ? 'On' : 'Off'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
