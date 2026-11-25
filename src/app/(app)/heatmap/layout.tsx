import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Heatmap',
  description:
    'See when Lagos skate spots are busiest, by time of day and day of the week.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
