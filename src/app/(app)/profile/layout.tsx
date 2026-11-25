import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your profile',
  description:
    'Your skater profile, sessions, spots and tricks on Sesh.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
