'use client';

import { Ghost, LogOut, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { useSessions, SELF_ID } from '@/lib/sessions';
import { useSettings } from '@/lib/settings';
import { relativeDuration } from '@/lib/time';
import type { Level, Stance } from '@/types';

interface AvatarRow {
  id: string;
  named: boolean;
  initials: string;
  name?: string;
  stance?: Stance;
  level?: Level;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function LiveSessionCard({ spotId }: { spotId: string }) {
  const { user } = useAuth();
  const { settings, toggle } = useSettings();
  const { sessions, getSessionForSpot, startSession, joinSession, leaveSession } =
    useSessions();

  const session = getSessionForSpot(spotId);
  const count = session?.members.length ?? 0;
  const isJoined = session?.members.some((m) => m.id === SELF_ID) ?? false;
  const ghost = settings.ghostMode;

  function buildMember() {
    const named = settings.showByName;
    return {
      id: SELF_ID,
      named,
      name: named ? user?.name : undefined,
      stance: named ? (user?.stance as Stance | undefined) : undefined,
      level: named ? (user?.level as Level | undefined) : undefined,
    };
  }

  function handleJoin() {
    if (ghost) return;
    if (session) {
      joinSession(spotId, buildMember());
      toast.success("You joined the session");
    } else {
      startSession(spotId, buildMember());
      toast.success("Session started");
    }
  }

  function handleLeave() {
    leaveSession(spotId, SELF_ID);
    toast("You left the session");
  }

  const avatars: AvatarRow[] = (session?.members ?? []).map((m) => ({
    id: m.id,
    named: m.named,
    initials: getInitials(m.name),
    name: m.name,
    stance: m.stance,
    level: m.level,
  }));

  const namedMembers = avatars.filter((a) => a.named);

  return (
    <div className="rounded-[16px] border bg-surface p-6 card-hover hover-lift-sm animate-fade-in-up stagger-1">
      {/* Count */}
      <div className="flex items-end gap-3 animate-scale-in stagger-1">
        <span className="text-5xl font-bold leading-none font-display transition-colors duration-normal group-hover:text-accent">
          {count}
        </span>
        <span className="pb-1 text-sm font-medium text-muted">skating now</span>
      </div>

      {count > 0 ? (
        <p className="mt-2 text-sm text-muted stagger-2 animate-fade-in-up">
          Session started {session ? relativeDuration(session.startedAt) : ''}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted stagger-2 animate-fade-in-up">No one is here yet</p>
      )}

      {/* Avatars */}
      {count > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 animate-stagger-fade-in">
          {avatars.map((a, index) => (
            <div
              key={a.id}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all duration-fast hover:scale-110 hover:shadow-lg press-scale stagger-1 animate-fade-in-up ${
                a.named
                  ? 'bg-accent text-accent-foreground'
                  : 'border bg-background text-muted'
              }`}
              title={a.named ? a.name : 'Anonymous skater'}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {a.named ? a.initials : <User className="h-4 w-4 transition-transform duration-fast hover:rotate-12" />}
            </div>
          ))}
        </div>
      )}

      {/* Who's here */}
      {count > 0 && (
        <div className="mt-4 animate-stagger-fade-in">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted stagger-1 animate-fade-in-up">
            Who&apos;s here
          </h3>
          {namedMembers.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-2">
              {namedMembers.map((m, index) => (
                <li key={m.id} className="flex items-center gap-2 text-sm stagger-1 animate-fade-in-up hover-lift-sm press-scale transition-all duration-fast" style={{ animationDelay: `${index * 60}ms` }}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground transition-transform duration-fast hover:scale-110">
                    {m.initials}
                  </span>
                  <span className="font-medium">{m.name}</span>
                  {m.stance && (
                    <span className="text-muted">{m.stance}</span>
                  )}
                  {m.level && (
                    <span className="text-muted">· {m.level}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted stagger-1 animate-fade-in-up">
              Skaters here are not showing their names.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 animate-stagger-fade-in">
        {ghost ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-[12px] border border-border bg-background p-3 text-sm text-muted animate-fade-in-up stagger-1">
              <Ghost className="h-4 w-4 shrink-0 transition-transform duration-fast hover:scale-110" />
              <span>
                Ghost mode is on. You are hidden and not counted.
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full press-scale stagger-2 animate-fade-in-up"
              onClick={() => toggle('ghostMode')}
            >
              Turn off ghost mode
            </Button>
          </div>
        ) : isJoined ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-[12px] bg-accent/10 p-3 text-sm font-medium text-accent animate-fade-in-up stagger-1">
              <Users className="h-4 w-4 shrink-0 transition-transform duration-fast hover:scale-110" />
              You&apos;re in this session
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full press-scale stagger-2 animate-fade-in-up"
              onClick={handleLeave}
            >
              <LogOut className="mr-2 h-4 w-4 transition-transform duration-fast hover:-translate-x-1" />
              Leave session
            </Button>
          </div>
        ) : count > 0 ? (
          <Button
            className="w-full rounded-full press-scale hover-lift stagger-1 animate-fade-in-up"
            onClick={handleJoin}
          >
            Join session
          </Button>
        ) : (
          <Button
            className="w-full rounded-full press-scale hover-lift stagger-1 animate-fade-in-up"
            onClick={handleJoin}
          >
            Start a session
          </Button>
        )}
      </div>

      {/* Footnote */}
      <p className="mt-4 text-xs leading-[150%] text-muted stagger-2 animate-fade-in-up">
        Anyone near this spot is counted automatically while Sesh is open. Turn
        on ghost mode to stay hidden.
      </p>
    </div>
  );
}