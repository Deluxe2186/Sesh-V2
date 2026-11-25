import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in',
  description:
    'Log in to Sesh to see which skate spots are live right now.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
