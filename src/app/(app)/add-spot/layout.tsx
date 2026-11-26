import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a spot',
  description:
    'Submit a new skate spot in Nigeria for the community to verify.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}