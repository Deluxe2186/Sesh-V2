import { getSkaters } from '@/lib/api';

export default async function SettingsPage() {
  const skaters = await getSkaters();

  return (
    <div>
      <h1 className="text-2xl font-bold font-display">Settings</h1>
      <p className="mt-2 text-muted">
        {skaters.length} skaters on Sesh in Lagos.
      </p>
    </div>
  );
}
