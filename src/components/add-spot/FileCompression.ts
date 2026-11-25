'use client';

/**
 * Browser-side file compression utilities for the Add Spot flow.
 * Compresses images and videos before storing metadata (no actual file upload to server).
 */

export interface CompressedFileResult {
  name: string;
  originalSize: number;
  compressedSize: number;
  thumbnail: string; // base64 data URL, max 200px
  type: 'image' | 'video';
  duration?: number; // for video, in seconds
}

/**
 * Compress an image file:
 * - Resize to max 1600px on longest side
 * - JPEG quality 0.8
 * - Generate 200px thumbnail (base64)
 */
export async function compressImage(file: File): Promise<CompressedFileResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        const maxDimension = 1600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Create compressed version
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with quality 0.8
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4); // approximate bytes from base64

        // Create thumbnail (200px max)
        const thumbMax = 200;
        let thumbWidth = width;
        let thumbHeight = height;
        if (thumbWidth > thumbHeight) {
          if (thumbWidth > thumbMax) {
            thumbHeight = Math.round((thumbHeight * thumbMax) / thumbWidth);
            thumbWidth = thumbMax;
          }
        } else {
          if (thumbHeight > thumbMax) {
            thumbWidth = Math.round((thumbWidth * thumbMax) / thumbHeight);
            thumbHeight = thumbMax;
          }
        }
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (!thumbCtx) {
          reject(new Error('Failed to get thumbnail canvas context'));
          return;
        }
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
        const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);

        resolve({
          name: file.name,
          originalSize: file.size,
          compressedSize,
          thumbnail,
          type: 'image',
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process a video file:
 * - Validate max 30s duration
 * - Validate max 25MB
 * - Generate poster thumbnail (first frame, 200px)
 * - No actual compression (video compression in browser is complex)
 */
export async function processVideo(file: File): Promise<CompressedFileResult> {
  return new Promise((resolve, reject) => {
    // Check size first
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      reject(new Error(`Video must be 25MB or less. Current size: ${formatBytes(file.size)}`));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;

      // Check duration
      if (duration > 30) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Video must be 30 seconds or less. Current duration: ${duration.toFixed(1)}s`));
        return;
      }

      // Seek to first frame to capture poster
      video.currentTime = 0.1;
    };

    video.onseeked = () => {
      // Capture poster frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to get video canvas context'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Resize thumbnail to 200px max
      const thumbMax = 200;
      let thumbWidth = canvas.width;
      let thumbHeight = canvas.height;
      if (thumbWidth > thumbHeight) {
        if (thumbWidth > thumbMax) {
          thumbHeight = Math.round((thumbHeight * thumbMax) / thumbWidth);
          thumbWidth = thumbMax;
        }
      } else {
        if (thumbHeight > thumbMax) {
          thumbWidth = Math.round((thumbWidth * thumbMax) / thumbHeight);
          thumbHeight = thumbMax;
        }
      }
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = thumbWidth;
      thumbCanvas.height = thumbHeight;
      const thumbCtx = thumbCanvas.getContext('2d');
      if (!thumbCtx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to get thumbnail canvas context'));
        return;
      }
      thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
      const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);

      URL.revokeObjectURL(objectUrl);

      resolve({
        name: file.name,
        originalSize: file.size,
        compressedSize: file.size, // No actual video compression in browser
        thumbnail,
        type: 'video',
        duration: Math.round(video.duration),
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Process multiple files (images and videos)
 */
export async function processFiles(files: FileList | File[]): Promise<CompressedFileResult[]> {
  const results: CompressedFileResult[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      results.push(await compressImage(file));
    } else if (file.type.startsWith('video/')) {
      results.push(await processVideo(file));
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  return results;
}

/**
 * Calculate total data size in MB
 */
export function calculateTotalDataMB(files: CompressedFileResult[]): number {
  const totalBytes = files.reduce((sum, f) => sum + f.compressedSize, 0);
  return Math.round((totalBytes / (1024 * 1024)) * 100) / 100; // Round to 2 decimal places
}

/**
 * Format bytes as human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'File must be an image';
  }
  const maxSize = 50 * 1024 * 1024; // 50MB original
  if (file.size > maxSize) {
    return `Image must be 50MB or less. Current size: ${formatBytes(file.size)}`;
  }
  return null;
}

/**
 * Validate video file
 */
export function validateVideoFile(file: File): string | null {
  if (!file.type.startsWith('video/')) {
    return 'File must be a video';
  }
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (file.size > maxSize) {
    return `Video must be 25MB or less. Current size: ${formatBytes(file.size)}`;
  }
  return null;
}

/**
 * Validate multiple files
 */
export function validateFiles(files: FileList | File[]): { valid: File[]; errors: string[] } {
  const valid: File[] = [];
  const errors: string[] = [];
  let imageCount = 0;
  let videoCount = 0;

  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      const error = validateImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        valid.push(file);
        imageCount++;
      }
    } else if (file.type.startsWith('video/')) {
      const error = validateVideoFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        valid.push(file);
        videoCount++;
      }
    } else {
      errors.push(`${file.name}: Unsupported file type`);
    }
  }

  // Minimum 2 images required
  if (imageCount < 2) {
    errors.push('At least 2 photos are required');
  }

  // Max 1 video
  if (videoCount > 1) {
    errors.push('Only 1 video is allowed');
  }

  return { valid, errors };
}