import { notFound } from 'next/navigation';
import SpotDetail from '@/components/spot/SpotDetail';
import { getSpot } from '@/lib/api';

export default async function SpotPage({
  params,
}: {
  params: { id: string };
}) {
  const spot = await getSpot(params.id);
  if (!spot) notFound();

  return <SpotDetail spot={spot} />;
}
