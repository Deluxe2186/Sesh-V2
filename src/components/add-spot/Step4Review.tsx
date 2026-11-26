'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, MapPin, Clock, Shield, Home, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SpotSubmission } from '@/types';

interface Step4ReviewProps {
  formData: SpotSubmission;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const AREA_LABELS: Record<string, string> = {
  Yaba: 'Yaba',
  Surulere: 'Surulere',
  Ikeja: 'Ikeja',
  Lekki: 'Lekki',
  'Victoria Island': 'Victoria Island',
  Ikoyi: 'Ikoyi',
  Ajah: 'Ajah',
  Ikorodu: 'Ikorodu',
  Maryland: 'Maryland',
  Ogba: 'Ogba',
  Alapere: 'Alapere',
  'Lagos Island': 'Lagos Island',
  Other: 'Other',
};

const SURFACE_LABELS: Record<string, string> = {
  Smooth: 'Smooth',
  Average: 'Average',
  Rough: 'Rough',
};

const SHELTER_LABELS: Record<string, string> = {
  Open: 'Open',
  'Partly covered': 'Partly covered',
  Covered: 'Covered',
};

const SECURITY_LABELS: Record<string, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
};

const OBSTACLE_ICONS: Record<string, React.ReactNode> = {
  Stairs: '🏗️',
  Ramp: '🛹',
  Rail: '📏',
  Ledge: '📐',
  Gap: '↔️',
  Flatground: '🏃',
  Bank: '🏔️',
  'Manual pad': '📦',
};

export default function Step4Review({
  formData,
  onBack,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: Step4ReviewProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Handle successful submission
  useEffect(() => {
    if (submitted && submissionId) {
      // Show success for 2 seconds then redirect
      const timer = setTimeout(() => {
        router.push('/explore');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, submissionId, router]);

  const handleSubmit = async () => {
    await onSubmit();
    setSubmitted(true);
  };

  // If submitted, show success screen
  if (submitted) {
    return (
      <div className="space-y-6 max-w-md mx-auto text-center">
        {/* Success Icon */}
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Check className="h-8 w-8" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold font-display">Thanks!</h2>
          <p className="mt-1 text-muted">Your spot is under review</p>
        </div>

        {/* Status Badge */}
        <Badge className="mx-auto w-fit" variant="secondary">
          <span className="relative flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Pending review
          </span>
        </Badge>

        {/* Timeline */}
        <div className="relative pl-4 border-l border-border">
          {[
            { label: 'Submitted', active: true, done: true },
            { label: 'Under review', active: true, done: false },
            { label: 'Live', active: false, done: false },
          ].map((step, index) => (
            <div key={step.label} className="relative pb-6 last:pb-0">
              <div className="absolute left-[-28px] top-0 flex h-5 w-5 items-center justify-center">
                {step.done ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : step.active ? (
                  <div className="h-3.5 w-3.5 rounded-full bg-accent animate-pulse" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-border" />
                )}
              </div>
              <p
                className={cn(
                  'text-sm font-medium',
                  step.active ? 'text-foreground' : 'text-muted'
                )}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Back to Explore Button */}
        <Button
          onClick={() => router.push('/explore')}
          className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          Back to Explore
        </Button>
      </div>
    );
  }

  // Review form
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Review your submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Spot Name & Area */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold font-display">{formData.name}</h3>
              <p className="text-sm text-muted">{AREA_LABELS[formData.area] || formData.area}</p>
            </div>
            <Badge variant="outline">{SECURITY_LABELS[formData.securityLevel] || formData.securityLevel} security</Badge>
          </div>

          <Separator />

          {/* Location & Approximate */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted" />
              <span>
                {formData.approximateLocation ? 'Approximate location' : 'Exact location'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted font-mono">
              {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
            </div>
          </div>

          {/* How to find & Description */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">How to find it</p>
              <p className="mt-1 text-sm">{formData.howToFind}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Description</p>
              <p className="mt-1 text-sm">{formData.description}</p>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-4 w-4 flex items-center justify-center">{SURFACE_LABELS[formData.surface] === 'Smooth' ? '✨' : SURFACE_LABELS[formData.surface] === 'Rough' ? '🪨' : '⚖️'}</span>
              <span>
                <span className="font-medium">Surface:</span> {SURFACE_LABELS[formData.surface] || formData.surface}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-muted" />
              <span>
                <span className="font-medium">Shelter:</span> {SHELTER_LABELS[formData.shelter] || formData.shelter}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted" />
              <span>
                <span className="font-medium">Best time:</span> {formData.bestTime}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted" />
              <span>
                <span className="font-medium">Security:</span> {SECURITY_LABELS[formData.securityLevel] || formData.securityLevel}
              </span>
            </div>
          </div>

          {formData.securityNote && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Security note</p>
              <p className="mt-1 text-sm">{formData.securityNote}</p>
            </div>
          )}

          <Separator />

          {/* Obstacles */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Obstacles</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {formData.obstacles.map((obstacle) => (
                <span
                  key={obstacle}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                >
                  {OBSTACLE_ICONS[obstacle] || '✦'}
                  {obstacle}
                </span>
              ))}
            </div>
            {formData.customObstacle && (
              <p className="mt-2 text-sm text-muted">
                Custom: {formData.customObstacle}
              </p>
            )}
          </div>

          <Separator />

          {/* Files & Data Usage */}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Proof ({formData.files.length} files)</p>
              <Badge variant="secondary" className="text-xs">
                {formData.totalDataMB.toFixed(2)} MB
              </Badge>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {formData.files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="rounded-lg border bg-surface p-2">
                  <div className="aspect-square rounded-[8px] overflow-hidden bg-secondary mb-2">
                    <Image
                      src={file.thumbnail}
                      alt={file.name || 'Uploaded proof'}
                      width={320}
                      height={320}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="truncate text-xs font-medium">{file.name}</p>
                  <p className="text-xs text-muted">
                    {file.type === 'image' ? '📷' : '🎥'} {file.type === 'image' ? 'Photo' : 'Video'}{' '}
                    • {((file.originalSize - file.compressedSize) / 1024 / 1024).toFixed(2)} MB saved
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={disabled || isSubmitting}
          className="rounded-full px-6 py-3"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting}
          className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit for review
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}