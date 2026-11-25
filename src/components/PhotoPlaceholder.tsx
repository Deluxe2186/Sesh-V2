import { Camera } from 'lucide-react';

export default function PhotoPlaceholder({ label = 'Photo' }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-[12px] border text-muted"
      style={{
        aspectRatio: '4 / 3',
        background:
          'linear-gradient(135deg, var(--border) 0%, var(--surface) 60%, var(--background) 100%)',
      }}
    >
      <Camera className="h-6 w-6" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
