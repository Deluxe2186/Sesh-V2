import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SpotDetail from '@/components/spot/SpotDetail';
import { getSpot } from '@/lib/api';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const spot = await getSpot(params.id);
  if (!spot) return { title: 'Spot not found' };
  return {
    title: spot.name,
    description: `${spot.name} in ${spot.area}, Lagos. See who is skating here now, conditions and the best time to go.`,
  };
}

export default async function SpotPage({
  params,
}: {
  params: { id: string };
}) {
  const spot = await getSpot(params.id);
  if (!spot) notFound();

  return <SpotDetail spot={spot} />;
}
