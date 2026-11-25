import type { Metadata } from 'next';
import { getSpots } from '@/lib/api';
import ExploreClient from '@/components/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore spots',
  description:
    'Browse verified skate spots across Lagos and see who is skating right now.',
};

export default async function ExplorePage() {
  const spots = await getSpots();
  return <ExploreClient spots={spots} />;
}
