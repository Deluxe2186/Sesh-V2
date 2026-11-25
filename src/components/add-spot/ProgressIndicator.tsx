'use client';

import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Basics', href: '#basics' },
  { id: 2, label: 'Obstacles', href: '#obstacles' },
  { id: 3, label: 'Proof', href: '#proof' },
  { id: 4, label: 'Review', href: '#review' },
] as const;

interface ProgressIndicatorProps {
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export default function ProgressIndicator({
  currentStep,
  completedSteps = [],
  className,
}: ProgressIndicatorProps) {
  return (
    <nav
      className={cn('relative', className)}
      aria-label="Add spot progress"
    >
      {/* Progress bar background */}
      <div className="relative h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Step indicators */}
      <ol className="flex justify-between mt-4" role="list">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <li key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Step circle */}
              <button
                type="button"
                disabled={isFuture}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted
                    ? 'border-accent bg-accent text-accent-foreground'
                    : isCurrent
                    ? 'border-accent bg-background text-accent'
                    : 'border-border bg-surface text-muted'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.label}`}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </button>

              {/* Step label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[80px]',
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}