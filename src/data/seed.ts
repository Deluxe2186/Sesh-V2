import type { Skater, Spot, User } from '@/types';

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

export const spots: Spot[] = [
  {
    id: 'national-stadium',
    name: 'Stadium',
    area: 'Surulere',
    lat: 6.501,
    lng: 3.356,
    obstacles: ['Stairs', 'Ledge', 'Rail', 'Flatground'],
    surface: 'Smooth',
    bestTime: 'Weekday evenings after 5pm, weekends early morning',
    notes:
      'National Stadium outer concourse has long smooth ledges, a solid stair set with rail, and plenty of flatground. The concrete is well-maintained and waxed by locals.',
    verified: true,
    liveCount: 7,
    weeklyVisits: 85,
    lastActive: '8 minutes ago',
    securityLevel: 'Low',
    securityNote:
      'Stadium staff are used to skaters on the outer areas. Avoid the main pitch and indoor halls. Weekends can get busy with joggers.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(1) },
      { id: 'r2', type: 'All clear', at: daysAgo(5) },
      { id: 'r3', type: 'All clear', at: daysAgo(12) },
    ],
    shelter: 'Partly covered',
    tips: [
      'The ledges by Gate C run best after rain once dried.',
      'Stair set at Gate B has a mellow rail, good for learning.',
      'Weekday evenings are quiet, weekends fill up by 10am.',
    ],
    busyByTime: { morning: 3, afternoon: 4, evening: 9, night: 3 },
    busyByDay: [4, 5, 6, 7, 9, 13, 10],
  },
  {
    id: 'ebute-metta-station',
    name: 'Train station',
    area: 'Ebute Metta',
    lat: 6.482,
    lng: 3.384,
    obstacles: ['Stairs', 'Gap', 'Ledge', 'Manual pad'],
    surface: 'Rough',
    notes:
      'Lagos Terminus forecourt and pedestrian bridge. Coarse concrete stairs with metal edges, a fun gap over the drainage channel, and low ledges along the platform ramp.',
    bestTime: 'Early mornings 6-8am before commuter rush',
    verified: true,
    liveCount: 3,
    weeklyVisits: 42,
    lastActive: '20 minutes ago',
    securityLevel: 'Medium',
    securityNote:
      'Station security tolerates skating before 8am. After that the forecourt fills with commuters and okadas. Do not session the platforms.',
    securityReports: [
      { id: 'r1', type: 'Security came by', at: daysAgo(3) },
      { id: 'r2', type: 'All clear', at: daysAgo(8) },
      { id: 'r3', type: 'Asked to leave', at: daysAgo(14) },
    ],
    shelter: 'Covered',
    tips: [
      'Hit it at 6am sharp, you have two hours before the rush.',
      'The gap over the drain is sketchy, scout the landing first.',
      'Bridge ledges are waxed but the concrete is rough, bring big wheels.',
    ],
    busyByTime: { morning: 7, afternoon: 2, evening: 3, night: 1 },
    busyByDay: [6, 5, 4, 5, 6, 7, 5],
  },
  {
    id: 'maryland-bridge',
    name: 'Maryland bridge',
    area: 'Maryland',
    lat: 6.584,
    lng: 3.372,
    obstacles: ['Bank', 'Gap', 'Ledge'],
    surface: 'Rough',
    notes:
      'The pedestrian bridge over the expressway has a mellow banked approach, a drainage gap mid-span, and coping ledges on both sides. Windy but the bank is unique.',
    bestTime: 'Mid-mornings when traffic noise masks the session',
    verified: false,
    liveCount: 2,
    weeklyVisits: 31,
    lastActive: '45 minutes ago',
    securityLevel: 'Medium',
    securityNote:
      'LASEMA and bridge patrol pass by occasionally. They usually wave if you are not blocking the walkway. Keep sessions low-key.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(4) },
      { id: 'r2', type: 'Security came by', at: daysAgo(10) },
      { id: 'r3', type: 'All clear', at: daysAgo(17) },
    ],
    shelter: 'Open',
    tips: [
      'The bank is steepest on the Ikeja-side approach.',
      'Gap is widest at the expansion joint, ollie early.',
      'Wind picks up past 11am, affects flip tricks on the bridge.',
    ],
    busyByTime: { morning: 4, afternoon: 3, evening: 2, night: 1 },
    busyByDay: [3, 3, 4, 4, 5, 6, 4],
  },
  {
    id: 'waf-skatepark',
    name: 'Waf Skatepark',
    area: 'Lagos Island',
    lat: 6.452,
    lng: 3.396,
    obstacles: ['Ramp', 'Bowl', 'Rail', 'Ledge', 'Flatground'],
    surface: 'Smooth',
    notes:
      'West African Festival (WAF) skatepark at Tafawa Balewa Square. Concrete bowl with pool coping, street section with rails and ledges, and a mini ramp. The only proper skatepark on the Island.',
    bestTime: 'Weekdays 4-8pm, weekends 10am-6pm',
    verified: true,
    liveCount: 12,
    weeklyVisits: 120,
    lastActive: 'Right now',
    securityLevel: 'Low',
    securityNote:
      'Official skatepark, free entry. Park marshals are skaters themselves. Helmets required for under-16s, recommended for all.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(1) },
      { id: 'r2', type: 'All clear', at: daysAgo(3) },
      { id: 'r3', type: 'All clear', at: daysAgo(7) },
    ],
    shelter: 'Covered',
    tips: [
      'Bowl coping is fresh, runs fast after a light wax.',
      'Street section rails are kinked, practice on the flat bar first.',
      'Weekends get packed after 12pm, weekdays are gold.',
    ],
    busyByTime: { morning: 2, afternoon: 6, evening: 10, night: 4 },
    busyByDay: [5, 6, 7, 8, 10, 15, 13],
  },
  {
    id: 'church-street-alapere',
    name: 'Church Street',
    area: 'Alapere',
    lat: 6.578,
    lng: 3.368,
    obstacles: ['Ledge', 'Manual pad', 'Flatground'],
    surface: 'Smooth',
    notes:
      'Quiet residential street behind the Catholic church. Long smooth marble ledges along the fence, two manual pads by the gate, and clean flatground. Locals keep it swept.',
    bestTime: 'Late afternoons after 4pm, shaded by trees',
    verified: true,
    liveCount: 4,
    weeklyVisits: 48,
    lastActive: '15 minutes ago',
    securityLevel: 'Low',
    securityNote:
      'Church security knows the skaters and does not mind after mass times. Keep noise down during services (Sun 7-10am, Wed 5-7pm).',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(2) },
      { id: 'r2', type: 'All clear', at: daysAgo(6) },
      { id: 'r3', type: 'All clear', at: daysAgo(13) },
    ],
    shelter: 'Partly covered',
    tips: [
      'Ledges are marble, run slow until waxed — bring a block.',
      'Manual pads are low and wide, perfect for combos.',
      'Tree shade makes this a great midday spot in dry season.',
    ],
    busyByTime: { morning: 1, afternoon: 4, evening: 6, night: 2 },
    busyByDay: [3, 4, 5, 5, 6, 8, 6],
  },
  {
    id: 'ogba-spot',
    name: 'Ogba spot',
    area: 'Ogba',
    lat: 6.652,
    lng: 3.334,
    obstacles: ['Stairs', 'Rail', 'Bank'],
    surface: 'Average',
    notes:
      'Commercial complex behind Ogba retail market. Six-stair with a round rail, a mellow banked loading dock, and cracked flatground. The crew meets here most evenings.',
    bestTime: 'Evenings from 6pm, weekend afternoons',
    verified: false,
    liveCount: 5,
    weeklyVisits: 53,
    lastActive: '30 minutes ago',
    securityLevel: 'Medium',
    securityNote:
      'Complex guards ask large groups to disperse. Crews of 3-4 are usually fine. Market area boys can be aggressive after dark, skate and leave.',
    securityReports: [
      { id: 'r1', type: 'Asked to leave', at: daysAgo(2) },
      { id: 'r2', type: 'All clear', at: daysAgo(7) },
      { id: 'r3', type: 'Security came by', at: daysAgo(11) },
    ],
    shelter: 'Partly covered',
    tips: [
      'The rail is round and fast, wax the top before you try.',
      'Bank has a crack halfway up, approach from the left.',
      'Come with the local crew, they know the guard rotations.',
    ],
    busyByTime: { morning: 1, afternoon: 3, evening: 8, night: 4 },
    busyByDay: [3, 4, 5, 6, 8, 10, 8],
  },
  {
    id: 'mainland-ramp-lot',
    name: 'Mainland Ramp Lot',
    area: 'Yaba',
    lat: 6.515,
    lng: 3.38,
    obstacles: ['Ramp', 'Bank', 'Flatground'],
    surface: 'Average',
    bestTime: 'Evenings from 6pm, the locals session weekly',
    notes:
      'Community-built quarter pipe and bank in a disused lot. The crew sweeps it every Saturday, all are welcome.',
    verified: true,
    liveCount: 9,
    weeklyVisits: 71,
    lastActive: 'Right now',
    securityLevel: 'Low',
    securityNote:
      'The lot is looked after by the local crew and there is no security. Be respectful and take your rubbish.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(1) },
      { id: 'r2', type: 'All clear', at: daysAgo(5) },
      { id: 'r3', type: 'All clear', at: daysAgo(12) },
    ],
    shelter: 'Partly covered',
    tips: [
      'Come after 6pm, the whole crew shows up then.',
      'Help sweep on Saturdays, the crew will look after you.',
      'Bring wax, the ramp coping runs slow in the heat.',
    ],
    busyByTime: { morning: 1, afternoon: 3, evening: 9, night: 6 },
    busyByDay: [4, 5, 6, 7, 10, 14, 12],
  },
  {
    id: 'island-gap-run',
    name: 'Island Gap Run',
    area: 'Lekki',
    lat: 6.44,
    lng: 3.49,
    obstacles: ['Gap', 'Stairs', 'Bank'],
    surface: 'Rough',
    bestTime: 'Early mornings, before the market opens',
    notes:
      'A three-block gap run along the service road. Rough through the middle section, scout the line first.',
    verified: false,
    liveCount: 0,
    weeklyVisits: 15,
    lastActive: '2 days ago',
    securityLevel: 'High',
    securityNote:
      'The service road is busy by 8am and market traders call the area boys if you linger. Skate and go.',
    securityReports: [
      { id: 'r1', type: 'Asked to leave', at: daysAgo(2) },
      { id: 'r2', type: 'Security came by', at: daysAgo(6) },
      { id: 'r3', type: 'Asked to leave', at: daysAgo(10) },
    ],
    shelter: 'Open',
    tips: [
      'Scout the line first, the middle section is rough.',
      'Be done by 8am before the market fills the road.',
      'Skate it fast and move on, do not loiter.',
    ],
    busyByTime: { morning: 4, afternoon: 1, evening: 1, night: 1 },
    busyByDay: [2, 2, 3, 3, 3, 4, 3],
  },
];

export const skaters: Skater[] = [
  {
    id: 'skater-1',
    name: 'Yanmife',
    handle: 'yanmife',
    stance: 'Regular',
    level: 'Intermediate',
    preferredObstacles: ['Ledge', 'Stairs'],
  },
  {
    id: 'skater-2',
    name: 'Tunde Bakare',
    handle: 'tundeskates',
    stance: 'Goofy',
    level: 'Advanced',
    preferredObstacles: ['Rail', 'Gap'],
  },
  {
    id: 'skater-3',
    name: 'Chidinma Okeke',
    handle: 'chichi_rolls',
    stance: 'Regular',
    level: 'Intermediate',
    preferredObstacles: ['Manual pad', 'Flatground'],
  },
  {
    id: 'skater-4',
    name: 'Emeka Obi',
    handle: 'emekashred',
    stance: 'Goofy',
    level: 'Beginner',
    preferredObstacles: ['Flatground', 'Bank'],
  },
  {
    id: 'skater-5',
    name: 'Folami Adeyemi',
    handle: 'fola_flip',
    stance: 'Regular',
    level: 'Advanced',
    preferredObstacles: ['Stairs', 'Rail'],
  },
  {
    id: 'skater-6',
    name: 'Zainab Yusuf',
    handle: 'zay_skates',
    stance: 'Regular',
    level: 'Beginner',
    preferredObstacles: ['Ramp', 'Flatground'],
  },
];

export const currentUser: User = skaters[0];

export { daysAgo, hoursAgo };
