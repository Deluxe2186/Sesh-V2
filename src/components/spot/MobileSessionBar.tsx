'use client';

import { Ghost } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { SELF_ID, useSessions } from '@/lib/sessions';
import { useSettings } from '@/lib/settings';
import type { Level, Stance } from '@/types';

// Sticky bar above the tab bar (phones only): live count + Join / Leave.
export default function MobileSessionBar({ spotId }: { spotId: string }) {
  const { user } = useAuth();
  const { settings, toggle } = useSettings();
  const { getSessionForSpot, startSession, joinSession, leaveSession } =
    useSessions();

  const session = getSessionForSpot(spotId);
  const count = session?.members.length ?? 0;
  const isJoined = session?.members.some((m) => m.id === SELF_ID) ?? false;
  const ghost = settings.ghostMode;

  function handleJoin() {
    if (ghost) return;
    const named = settings.showByName;
    const member = {
      id: SELF_ID,
      named,
      name: named ? user?.name : undefined,
      stance: named ? (user?.stance as Stance | undefined) : undefined,
      level: named ? (user?.level as Level | undefined) : undefined,
    };
    if (session) {
      joinSession(spotId, member);
      toast.success('You joined the session');
    } else {
      startSession(spotId, member);
      toast.success('Session started');
    }
  }

  function handleLeave() {
    leaveSession(spotId, SELF_ID);
    toast('You left the session');
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 border-t bg-surface px-4 py-2 lg:hidden animate-slide-in-up">
      <div className="mx-auto flex max-w-xl items-center gap-3 animate-stagger-fade-in">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm stagger-1 animate-fade-in-up">
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-all duration-normal ${
              count > 0 ? 'bg-live animate-pulse' : 'bg-muted'
            }`}
          />
          <span className="font-semibold transition-all duration-fast">{count}</span>
          <span className="truncate text-muted">skating now</span>
        </div>
        {ghost ? (
          <Button
            variant="outline"
            className="min-h-[44px] rounded-full press-scale hover-lift stagger-2 animate-fade-in-up"
            onClick={() => toggle('ghostMode')}
          >
            <Ghost className="mr-2 h-4 w-4 transition-transform duration-fast hover:scale-110" />
            Ghost mode off
          </Button>
        ) : isJoined ? (
          <Button
            variant="outline"
            className="min-h-[44px] rounded-full press-scale hover-lift stagger-2 animate-fade-in-up"
            onClick={handleLeave}
          >
            Leave
          </Button>
        ) : (
          <Button className="min-h-[44px] rounded-full press-scale hover-lift stagger-2 animate-fade-in-up" onClick={handleJoin}>
            {count > 0 ? 'Join' : 'Start session'}
          </Button>
        )}
      </div>
    </div>
  );
}