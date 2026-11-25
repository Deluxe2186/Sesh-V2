import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Ghost mode, low data mode, theme and privacy settings for Sesh.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
