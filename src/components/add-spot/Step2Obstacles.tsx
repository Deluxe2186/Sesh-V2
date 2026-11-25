'use client';

import {
  StepForward, // Stairs
  ArrowUpRight, // Ramp
  RailSymbol, // Rail
  Square, // Ledge, Flatground, Manual pad
  Minus, // Gap
  Triangle, // Bank
  Plus,
  Check,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Form, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';

const OBSTACLES = [
  { id: 'Stairs', label: 'Stairs', icon: StepForward },
  { id: 'Ramp', label: 'Ramp', icon: ArrowUpRight },
  { id: 'Rail', label: 'Rail', icon: RailSymbol },
  { id: 'Ledge', label: 'Ledge', icon: Square },
  { id: 'Gap', label: 'Gap', icon: Minus },
  { id: 'Flatground', label: 'Flatground', icon: Square },
  { id: 'Bank', label: 'Bank', icon: Triangle },
  { id: 'Manual pad', label: 'Manual pad', icon: Square },
] as const;

const step2Schema = z.object({
  obstacles: z.array(z.string()).min(1, 'Select at least one obstacle'),
  customObstacle: z.string().optional(),
});

type Step2Data = z.infer<typeof step2Schema>;

interface Step2ObstaclesProps {
  formData: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export default function Step2Obstacles({
  formData,
  onChange,
  onBack,
  onNext,
  disabled = false,
}: Step2ObstaclesProps) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: formData,
    mode: 'onChange',
  });

  // Sync form changes to parent
  const onChangeProxy = (value: Step2Data) => {
    onChange(value);
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Obstacles Chips */}
        <FormField
          control={form.control}
          name="obstacles"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Obstacles</FormLabel>
              <FormDescription>
                Select all that apply. Tap to toggle.
              </FormDescription>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Obstacle types">
                {OBSTACLES.map((obstacle) => {
                  const isSelected = field.value.includes(obstacle.id);
                  return (
                    <button
                      key={obstacle.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          field.onChange(field.value.filter((o: string) => o !== obstacle.id));
                        } else {
                          field.onChange([...field.value, obstacle.id]);
                        }
                      }}
                      disabled={disabled}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                        isSelected
                          ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                          : 'border-border bg-surface text-foreground hover:border-accent/50 hover:bg-accent/5'
                      )}
                      aria-pressed={isSelected}
                    >
                      <obstacle.icon className="h-4 w-4" aria-hidden="true" />
                      {obstacle.label}
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom obstacle */}
              <div className="flex gap-2">
                <Controller
                  control={form.control}
                  name="customObstacle"
                  render={({ field: customField }) => (
                    <Input
                      placeholder="Anything else? (e.g. Hubba, Quarter pipe, Pole jam)"
                      value={customField.value}
                      onChange={customField.onChange}
                      disabled={disabled}
                      className="flex-1"
                    />
                  )}
                />
                {form.watch('customObstacle') && (
                  <button
                    type="button"
                    onClick={() => {
                      const custom = form.getValues('customObstacle');
                      if (custom && !field.value.includes(custom)) {
                        field.onChange([...field.value, custom]);
                        form.setValue('customObstacle', '', { shouldValidate: true });
                      }
                    }}
                    disabled={disabled || !form.watch('customObstacle')}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/5"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                )}
              </div>

              {/* Selected obstacles summary */}
              {field.value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {field.value.map((obstacle: string) => (
                    <span
                      key={obstacle}
                      className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {obstacle}
                    </span>
                  ))}
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent/5"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              form.trigger().then((isValid) => {
                if (isValid) onNext();
              });
            }}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Next
          </button>
        </div>
      </form>
    </Form>
  );
}