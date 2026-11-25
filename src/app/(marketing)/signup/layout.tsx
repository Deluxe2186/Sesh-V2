import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
  description:
    'Create a Sesh account and find live skate spots across Lagos.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
