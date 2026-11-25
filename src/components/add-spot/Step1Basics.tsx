'use client';

import { useEffect } from 'react';
import { MapPin } from 'lucide-react';
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
              <FormLabel>Spot name</FormLabel>
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
              <FormLabel>Area</FormLabel>
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
              <FormLabel>How to find it</FormLabel>
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the spot: obstacles, vibe, surface details, anything skaters should know..."
                  rows={4}
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Surface & Shelter */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="surface"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface quality</FormLabel>
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
                <FormLabel>Shelter</FormLabel>
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

        {/* Best Time */}
        <FormField
          control={form.control}
          name="bestTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Best time to skate</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Weekday evenings after 5pm, weekends early morning"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Security Level & Note */}
        <FormField
          control={form.control}
          name="securityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security and disturbance</FormLabel>
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
              <FormLabel>Security note</FormLabel>
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
            <FormLabel className="mb-0">Location</FormLabel>
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