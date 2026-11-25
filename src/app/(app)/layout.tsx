import AppChrome from '@/components/AppChrome';
import AutoJoinMount from '@/components/AutoJoinMount';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppChrome>
      <AutoJoinMount />
      {children}
    </AppChrome>
  );
}
