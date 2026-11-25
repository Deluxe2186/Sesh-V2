import { getSpots } from '@/lib/api';
import ExploreClient from '@/components/ExploreClient';

export default async function ExplorePage() {
  const spots = await getSpots();
  return <ExploreClient spots={spots} />;
}
