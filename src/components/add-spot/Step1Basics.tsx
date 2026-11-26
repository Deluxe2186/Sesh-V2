'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import SpotMapPicker from '@/components/SpotMapPicker';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const areas = [
  'Yaba',
  'Surulere',
  'Ikeja',
  'Lekki',
  'Victoria Island',
  'Ikoyi',
  'Ajah',
  'Ikorodu',
  'Maryland',
  'Ogba',
  'Alapere',
  'Lagos Island',
  'Other',
] as const;

const OBSTACLE_OPTIONS = [
  { id: 'Stairs', label: 'Stairs' },
  { id: 'Ramp', label: 'Ramp' },
  { id: 'Rail', label: 'Rail' },
  { id: 'Ledge', label: 'Ledge' },
  { id: 'Gap', label: 'Gap' },
  { id: 'Flatground', label: 'Flatground' },
  { id: 'Bank', label: 'Bank' },
  { id: 'Manual pad', label: 'Manual pad' },
  { id: 'Hubba', label: 'Hubba' },
  { id: 'Quarter pipe', label: 'Quarter pipe' },
  { id: 'Pole jam', label: 'Pole jam' },
] as const;

const surfaces = ['Smooth', 'Average', 'Rough'] as const;
const shelters = ['Open', 'Partly covered', 'Covered'] as const;
const securityLevels = ['Low', 'Medium', 'High'] as const;

const step1Schema = z.object({
  name: z.string().min(2, 'Spot name must be at least 2 characters'),
  area: z.string().min(1, 'Please select an area'),
  howToFind: z.string().min(5, 'Please provide directions (at least 5 characters)'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  surface: z.enum(surfaces),
  shelter: z.enum(shelters),
  bestTime: z.string().min(2, 'Please specify the best time to skate'),
  securityLevel: z.enum(securityLevels),
  securityNote: z.string().optional(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  approximateLocation: z.boolean(),
});

type Step1Data = z.infer<typeof step1Schema>;

interface Step1BasicsProps {
  formData: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
  onNext: () => void;
  disabled?: boolean;
}

export default function Step1Basics({
  formData,
  onChange,
  onNext,
  disabled = false,
}: Step1BasicsProps) {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: formData,
    mode: 'onChange',
  });

  // Sync form changes to parent
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  // Validate lat/lng are set
  const hasLocation = formData.lat !== null && formData.lng !== null;

  const handleSubmit = () => {
    form.trigger().then((isValid) => {
      if (isValid && hasLocation) {
        onNext();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Spot Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-bold">Spot name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Stadium, Church Street, Waf Skatepark"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Area */}
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-bold">Area</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* How to find it */}
        <FormField
          control={form.control}
          name="howToFind"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-bold">How to find it</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Behind the train station, near Gate C"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Short landmark or directions to help others find the spot
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description with obstacle buttons */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);
            const [customObstacle, setCustomObstacle] = useState('');

            const toggleObstacle = (obstacle: string) => {
              if (selectedObstacles.includes(obstacle)) {
                setSelectedObstacles(selectedObstacles.filter((o) => o !== obstacle));
              } else {
                setSelectedObstacles([...selectedObstacles, obstacle]);
              }
            };

            const addCustomObstacle = () => {
              if (customObstacle.trim() && !selectedObstacles.includes(customObstacle.trim())) {
                setSelectedObstacles([...selectedObstacles, customObstacle.trim()]);
                setCustomObstacle('');
              }
            };

            // Build description from selected obstacles + free text
            const obstacleText = selectedObstacles.length > 0
              ? `Obstacles: ${selectedObstacles.join(', ')}. `
              : '';
            const freeText = field.value.replace(/^Obstacles: [^.]*\. ?/, '');
            const combinedValue = obstacleText + freeText;

            // Update field when obstacles change
            useEffect(() => {
              field.onChange(combinedValue);
            }, [selectedObstacles, freeText, field]);

            return (
              <FormItem>
                <FormLabel className="text-foreground font-bold">Description</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Obstacle buttons */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted">Tap to add obstacles:</p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Obstacle types">
                        {OBSTACLE_OPTIONS.map((obstacle) => {
                          const isSelected = selectedObstacles.includes(obstacle.id);
                          return (
                            <button
                              key={obstacle.id}
                              type="button"
                              onClick={() => toggleObstacle(obstacle.id)}
                              disabled={disabled}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                                isSelected
                                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                                  : 'border-border bg-surface text-foreground hover:border-accent/50 hover:bg-accent/5'
                              )}
                              aria-pressed={isSelected}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                              {obstacle.label}
                            </button>
                          );
                        })}
                        {/* Custom obstacle input */}
                        <div className="flex gap-1.5 items-center">
                          <Input
                            type="text"
                            placeholder="Other..."
                            value={customObstacle}
                            onChange={(e) => setCustomObstacle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustomObstacle()}
                            disabled={disabled}
                            className="w-36 h-8 text-sm"
                          />
                          <button
                            type="button"
                            onClick={addCustomObstacle}
                            disabled={disabled || !customObstacle.trim()}
                            className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent/5"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selected obstacles summary */}
                    {selectedObstacles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-accent/5 rounded-lg">
                        {selectedObstacles.map((obstacle) => (
                          <span
                            key={obstacle}
                            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                          >
                            {obstacle}
                            <button
                              type="button"
                              onClick={() => toggleObstacle(obstacle)}
                              className="hover:text-accent/70"
                              aria-label={`Remove ${obstacle}`}
                            >
                              <Check className="h-3 w-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Free-form description textarea */}
                    <Textarea
                      placeholder="Describe the spot: vibe, surface details, anything else skaters should know..."
                      rows={3}
                      value={freeText}
                      onChange={(e) => field.onChange(obstacleText + e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Selected obstacles are added automatically. Add any extra details above.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Surface & Shelter */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="surface"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-bold">Surface quality</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface" />
                    </SelectTrigger>
                    <SelectContent>
                      {surfaces.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shelter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-bold">Shelter</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shelter" />
                    </SelectTrigger>
                    <SelectContent>
                      {shelters.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Best Time with day/time buttons */}
        <FormField
          control={form.control}
          name="bestTime"
          render={({ field }) => {
            const [selectedDays, setSelectedDays] = useState<string[]>([]);
            const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

            const toggleDay = (day: string) => {
              if (selectedDays.includes(day)) {
                setSelectedDays(selectedDays.filter((d) => d !== day));
              } else {
                setSelectedDays([...selectedDays, day]);
              }
            };

            const toggleTime = (time: string) => {
              if (selectedTimes.includes(time)) {
                setSelectedTimes(selectedTimes.filter((t) => t !== time));
              } else {
                setSelectedTimes([...selectedTimes, time]);
              }
            };

            // Build bestTime from selections + free text
            const daysText = selectedDays.length > 0 ? selectedDays.join(', ') : '';
            const timesText = selectedTimes.length > 0 ? selectedTimes.join(', ') : '';
            const combinedParts = [];
            if (daysText) combinedParts.push(daysText);
            if (timesText) combinedParts.push(timesText);
            const combinedValue = combinedParts.join(' - ');

            // Update field when selections change
            useEffect(() => {
              field.onChange(combinedValue);
            }, [selectedDays, selectedTimes, field]);

            return (
              <FormItem>
                <FormLabel className="text-foreground font-bold">Best time to skate</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Day buttons */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted">When:</p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Days">
                        {['Weekdays', 'Weekends', 'Both'].map((day) => {
                          const isSelected = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              disabled={disabled}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                                isSelected
                                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                                  : 'border-border bg-surface text-foreground hover:border-accent/50 hover:bg-accent/5'
                              )}
                              aria-pressed={isSelected}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time of day buttons */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted">Time of day:</p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Time of day">
                        {['Morning', 'Noon', 'Night'].map((time) => {
                          const isSelected = selectedTimes.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleTime(time)}
                              disabled={disabled}
                              className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                                isSelected
                                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                                  : 'border-border bg-surface text-foreground hover:border-accent/50 hover:bg-accent/5'
                              )}
                              aria-pressed={isSelected}
                            >
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary */}
                    {(selectedDays.length > 0 || selectedTimes.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-accent/5 rounded-lg">
                        {selectedDays.map((day) => (
                          <span
                            key={day}
                            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                          >
                            {day}
                            <button
                              type="button"
                              onClick={() => toggleDay(day)}
                              className="hover:text-accent/70"
                              aria-label={`Remove ${day}`}
                            >
                              <Check className="h-3 w-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                        {selectedTimes.map((time) => (
                          <span
                            key={time}
                            className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                          >
                            {time}
                            <button
                              type="button"
                              onClick={() => toggleTime(time)}
                              className="hover:text-accent/70"
                              aria-label={`Remove ${time}`}
                            >
                              <Check className="h-3 w-3 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Optional free-form input for additional details */}
                    <Input
                      placeholder="Or type custom: e.g. Weekday evenings after 5pm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Tap buttons above or type custom. Format: Days - Times.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Security Level & Note */}
        <FormField
          control={form.control}
          name="securityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-bold">Security and disturbance</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    {securityLevels.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="securityNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-bold">Security note</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Guards usually ask us to leave after 6pm. Private security patrols after 10pm."
                  rows={2}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>
                Details about security, guards, or any disturbances skaters should know
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Map */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted" />
            <FormLabel className="mb-0 text-foreground font-bold">Location</FormLabel>
          </div>
          <Controller
            control={form.control}
            name="lat"
            render={({ field }) => (
              <Controller
                control={form.control}
                name="lng"
                render={({ field: lngField }) => (
                  <Controller
                    control={form.control}
                    name="approximateLocation"
                    render={({ field: approxField }) => (
                      <SpotMapPicker
                        lat={field.value}
                        lng={lngField.value}
                        onChange={(lat, lng) => {
                          field.onChange(lat);
                          lngField.onChange(lng);
                        }}
                        approximate={approxField.value}
                        onApproximateChange={approxField.onChange}
                        disabled={disabled}
                        height="320px"
                      />
                    )}
                  />
                )}
              />
            )}
          />
          {!hasLocation && (
            <p className="text-sm text-destructive">
              Please click on the map to set the spot location
            </p>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !hasLocation}
            className={cn(
              'inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            Next
          </button>
        </div>
      </form>
    </Form>
  );
}