'use client';

import { EyeOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSettings } from '@/lib/settings';

export default function GhostModeToggle() {
  const { settings, toggle } = useSettings();
  const ghost = settings.ghostMode;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => toggle('ghostMode')}
            aria-pressed={ghost}
            aria-label="Ghost mode"
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium lg:h-9 ${
              ghost
                ? 'border-accent bg-accent text-accent-foreground'
                : 'bg-surface text-foreground hover:bg-background'
            }`}
          >
            <EyeOff className="h-4 w-4" />
            <span className="hidden sm:inline">{ghost ? 'Ghost on' : 'Ghost off'}</span>
          </button>
        </TooltipTrigger>
        {ghost && (
          <TooltipContent side="bottom">
            You are hidden from live sessions
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
