'use client';

import { useState, useCallback } from 'react';
import { Camera, Video, X, Loader2, Check, AlertCircle, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  processFiles,
  validateFiles,
  calculateTotalDataMB,
  formatBytes,
  CompressedFileResult,
} from './FileCompression';
import { SubmissionFile } from '@/types';
import { toast } from 'sonner';

interface FileWithPreview extends CompressedFileResult {
  preview: string; // object URL for preview
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
}

const step3Schema = z.object({
  files: z.array(z.any()).min(2, 'At least 2 photos are required'),
});

type Step3Data = z.infer<typeof step3Schema>;

interface Step3ProofProps {
  formData: {
    files: SubmissionFile[];
    totalDataMB: number;
  };
  onChange: (data: { files: SubmissionFile[]; totalDataMB: number }) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export default function Step3Proof({
  formData,
  onChange,
  onBack,
  onSaveDraft,
  onNext,
  disabled = false,
}: Step3ProofProps) {
  const [filesWithPreview, setFilesWithPreview] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { files: [] },
    mode: 'onChange',
  });

  // Convert existing SubmissionFile to FileWithPreview for display
  const syncExistingFiles = useCallback(() => {
    if (formData.files.length > 0 && filesWithPreview.length === 0) {
      const existing = formData.files.map((f) => ({
        ...f,
        preview: f.thumbnail, // use thumbnail as preview
        status: 'done' as const,
      }));
      setFilesWithPreview(existing);
    }
  }, [formData.files, filesWithPreview.length]);

  // Update parent with compressed file metadata
  const updateParent = useCallback(
    (files: FileWithPreview[]) => {
      const submissionFiles: SubmissionFile[] = files.map((f) => ({
        name: f.name,
        originalSize: f.originalSize,
        compressedSize: f.compressedSize,
        thumbnail: f.thumbnail,
        type: f.type,
        duration: f.duration,
      }));
      const totalDataMB = calculateTotalDataMB(submissionFiles);
      onChange({ files: submissionFiles, totalDataMB });
    },
    [onChange]
  );

  // Process new files
  const handleFiles = async (newFiles: FileList | File[]) => {
    const { valid, errors } = validateFiles(newFiles);

    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
    }

    if (valid.length === 0) return;

    setIsProcessing(true);

    // Add files with pending status
    const pendingFiles: FileWithPreview[] = valid.map((file) => ({
      name: file.name,
      originalSize: file.size,
      compressedSize: 0,
      thumbnail: '',
      type: file.type.startsWith('video/') ? 'video' : 'image',
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));

    setFilesWithPreview((prev) => [...prev, ...pendingFiles]);

    try {
      const compressed = await processFiles(valid);

      // Update with compressed results
      setFilesWithPreview((prev) =>
        prev.map((pf) => {
          const compressedFile = compressed.find((c) => c.name === pf.name);
          if (compressedFile) {
            return {
              ...pf,
              ...compressedFile,
              status: 'done',
            };
          }
          return pf;
        })
      );

      toast.success(`${compressed.length} file(s) processed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process files';
      toast.error(message);

      setFilesWithPreview((prev) =>
        prev.map((pf) =>
          valid.some((v) => v.name === pf.name)
            ? { ...pf, status: 'error', error: message }
            : pf
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFilesWithPreview((prev) => {
      const file = prev[index];
      if (file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
      const next = prev.filter((_, i) => i !== index);
      updateParent(next);
      return next;
    });
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const totalDataMB = calculateTotalDataMB(
    filesWithPreview.map((f) => ({
      name: f.name,
      originalSize: f.originalSize,
      compressedSize: f.compressedSize,
      thumbnail: f.thumbnail,
      type: f.type,
      duration: f.duration,
    }))
  );

  const imageCount = filesWithPreview.filter((f) => f.type === 'image').length;
  const videoCount = filesWithPreview.filter((f) => f.type === 'video').length;
  const hasErrors = filesWithPreview.some((f) => f.status === 'error');
  const canSubmit = imageCount >= 2 && !hasErrors && !isProcessing;

  return (
    <form
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn('space-y-6', dragActive && 'ring-2 ring-accent')}
    >
      {/* Drop Zone */}
      <div
        className={cn(
          'relative rounded-[12px] border-2 border-dashed p-8 text-center transition-colors',
          dragActive
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50'
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleInputChange}
          disabled={disabled || isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <Camera className="h-8 w-8 text-muted" />
            <Video className="h-8 w-8 text-muted" />
          </div>
          <p className="text-sm text-muted">
            Click or drag photos & videos here
          </p>
          <p className="text-xs text-muted">
            Photos: min 2, max 50MB each. Video: optional, max 30s, 25MB.
          </p>
        </div>
        {isProcessing && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>

      {/* Data Usage */}
      <div className="rounded-lg bg-secondary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm font-medium">
              This will use about <strong>{totalDataMB.toFixed(2)} MB</strong> of data
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filesWithPreview.length} file(s)
          </Badge>
        </div>
        <Progress value={Math.min(totalDataMB * 10, 100)} className="mt-2 h-1.5" />
        <p className="mt-1 text-xs text-muted">
          {imageCount} photo(s), {videoCount} video(s) •{' '}
          {filesWithPreview.reduce((sum, f) => sum + f.originalSize, 0) > 0
            ? `Original: ${formatBytes(filesWithPreview.reduce((sum, f) => sum + f.originalSize, 0))}`
            : 'No files'}
        </p>
      </div>

      {/* File Previews */}
      {filesWithPreview.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Selected files</Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filesWithPreview.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  'relative rounded-[12px] border bg-surface p-3 transition-colors',
                  file.status === 'error' && 'border-destructive'
                )}
              >
                {/* Thumbnail */}
                <div className="aspect-square rounded-[8px] overflow-hidden bg-secondary">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {file.type === 'video' ? (
                        <Video className="h-8 w-8 text-muted" />
                      ) : (
                        <Image className="h-8 w-8 text-muted" />
                      )}
                    </div>
                  )}
                </div>

                {/* Status overlay */}
                {file.status === 'compressing' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-black/50">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-destructive/90">
                    <AlertCircle className="h-6 w-6 text-destructive-foreground" />
                  </div>
                )}
                {file.status === 'done' && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                )}

                {/* File info */}
                <div className="mt-2 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>
                      {file.type === 'image' ? '📷' : '🎥'}{' '}
                      {file.status === 'pending'
                        ? 'Compressing...'
                        : file.status === 'error'
                        ? 'Error'
                        : `Saved ${formatBytes(file.originalSize - file.compressedSize)}`}
                    </span>
                    {file.type === 'video' && file.duration && (
                      <span>{file.duration}s</span>
                    )}
                  </div>
                  {file.error && (
                    <p className="mt-1 text-xs text-destructive">{file.error}</p>
                  )}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled || isProcessing}
                  className="absolute top-2 right-2 rounded-full p-1 text-muted hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-sm text-muted">
        Photo proof helps us verify your spot before it goes live.
      </p>

      {/* Video helper */}
      <p className="text-sm text-muted">
        A short clip helps us verify faster, but it is optional.
      </p>

      {/* Errors */}
      {hasErrors && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          Some files have errors. Please remove or replace them.
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled || isProcessing}
          className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent/5"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={disabled || isProcessing || !canSubmit}
            className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent/5"
          >
            Save and send later
          </button>
          <button
            type="button"
            onClick={() => {
              if (canSubmit) onNext();
            }}
            disabled={disabled || isProcessing || !canSubmit}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </form>
  );
}