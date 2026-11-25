import type { Skater, Spot, User } from '@/types';

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3600000).toISOString();
}

export const spots: Spot[] = [
  {
    id: 'yaba-plaza-ledges',
    name: 'Yaba Plaza Ledges',
    area: 'Yaba',
    lat: 6.5095,
    lng: 3.3711,
    obstacles: ['Ledge', 'Flatground', 'Manual pad'],
    surface: 'Smooth',
    bestTime: 'Evenings after 5pm, cooler and quieter',
    notes:
      'Long granite ledges around the plaza edge. Ground is swept most days, watch for parked okadas near the entrance.',
    verified: true,
    liveCount: 4,
    weeklyVisits: 62,
    lastActive: '12 minutes ago',
    securityLevel: 'Low',
    securityNote:
      'Shop owners do not mind skaters after closing time. Keep clear of the okada rank at the south entrance.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(2) },
      { id: 'r2', type: 'All clear', at: daysAgo(9) },
      { id: 'r3', type: 'Security came by', at: daysAgo(16) },
    ],
    shelter: 'Open',
    tips: [
      'Go before 5pm, it is quieter and the light is good.',
      'Wax the ledges the first time, they run slow.',
      'Watch for okadas parked along the south edge.',
    ],
    busyByTime: { morning: 1, afternoon: 3, evening: 8, night: 2 },
    busyByDay: [3, 4, 5, 6, 9, 12, 8],
  },
  {
    id: 'surulere-stair-set',
    name: 'Surulere Stair Set',
    area: 'Surulere',
    lat: 6.5,
    lng: 3.35,
    obstacles: ['Stairs', 'Rail', 'Gap'],
    surface: 'Average',
    bestTime: 'Early mornings before traffic builds',
    notes:
      'Eight stair with a handrail down the middle. Security is relaxed before 9am, bring a broom for the landing.',
    verified: true,
    liveCount: 2,
    weeklyVisits: 41,
    lastActive: '1 hour ago',
    securityLevel: 'Medium',
    securityNote:
      'The building guard asks groups of four or more to move on. Smaller crews are usually left alone before 9am.',
    securityReports: [
      { id: 'r1', type: 'Asked to leave', at: daysAgo(4) },
      { id: 'r2', type: 'All clear', at: daysAgo(11) },
      { id: 'r3', type: 'Security came by', at: daysAgo(18) },
    ],
    shelter: 'Open',
    tips: [
      'Arrive before 9am, security has not started their rounds.',
      'Bring a broom, the landing collects grit overnight.',
      'Keep crews to three so the guard does not come over.',
    ],
    busyByTime: { morning: 6, afternoon: 2, evening: 4, night: 1 },
    busyByDay: [5, 4, 3, 4, 6, 8, 7],
  },
  {
    id: 'ikeja-city-flatground',
    name: 'Ikeja City Flatground',
    area: 'Ikeja',
    lat: 6.6018,
    lng: 3.3515,
    obstacles: ['Flatground', 'Manual pad'],
    surface: 'Smooth',
    bestTime: 'Weekday mornings, weekends get busy',
    notes:
      'Open paved lot, perfect for flatground tricks and line practice. Few obstacles but plenty of space to cruise.',
    verified: false,
    liveCount: 6,
    weeklyVisits: 55,
    lastActive: '5 minutes ago',
    securityLevel: 'Low',
    securityNote:
      'No security presence. The lot is public and well lit in the evenings.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(1) },
      { id: 'r2', type: 'All clear', at: daysAgo(7) },
      { id: 'r3', type: 'All clear', at: daysAgo(14) },
    ],
    shelter: 'Open',
    tips: [
      'Weekday mornings are empty, claim the best patch.',
      'Bring chalk to mark your lines on the asphalt.',
      'Avoid the far corner after dark, the light is out.',
    ],
    busyByTime: { morning: 4, afternoon: 5, evening: 7, night: 3 },
    busyByDay: [4, 5, 6, 5, 7, 10, 9],
  },
  {
    id: 'lekki-phase-1-rail-spot',
    name: 'Lekki Phase 1 Rail Spot',
    area: 'Lekki',
    lat: 6.4474,
    lng: 3.4723,
    obstacles: ['Rail', 'Ledge'],
    surface: 'Average',
    bestTime: 'Late evenings after the heat drops',
    notes:
      'Flat down rail behind the commercial strip. Slows you down fast, wax the cap before you session it.',
    verified: true,
    liveCount: 3,
    weeklyVisits: 38,
    lastActive: '25 minutes ago',
    securityLevel: 'Medium',
    securityNote:
      'Private security patrols the strip after 10pm. They are friendly but ask you to wrap up by 11pm.',
    securityReports: [
      { id: 'r1', type: 'Security came by', at: daysAgo(3) },
      { id: 'r2', type: 'All clear', at: daysAgo(8) },
      { id: 'r3', type: 'Asked to leave', at: daysAgo(15) },
    ],
    shelter: 'Partly covered',
    tips: [
      'Wax the rail cap first, it runs slow from the heat.',
      'Start after 7pm when the shops close and traffic drops.',
      'Pack up by 11pm, the night patrol starts then.',
    ],
    busyByTime: { morning: 1, afternoon: 2, evening: 6, night: 5 },
    busyByDay: [2, 3, 3, 4, 6, 8, 7],
  },
  {
    id: 'victoria-island-marina-bank',
    name: 'Victoria Island Marina Bank',
    area: 'Victoria Island',
    lat: 6.4281,
    lng: 3.4219,
    obstacles: ['Bank', 'Gap'],
    surface: 'Rough',
    bestTime: 'Sundays at sunrise, empty roads',
    notes:
      'Mellow bank facing the marina. The approach is coarse concrete, bigger wheels strongly recommended.',
    verified: false,
    liveCount: 1,
    weeklyVisits: 24,
    lastActive: '3 hours ago',
    securityLevel: 'High',
    securityNote:
      'The marina is private property and patrols are regular. Skating here risks being asked to leave quickly.',
    securityReports: [
      { id: 'r1', type: 'Asked to leave', at: daysAgo(1) },
      { id: 'r2', type: 'Security came by', at: daysAgo(5) },
      { id: 'r3', type: 'Asked to leave', at: daysAgo(12) },
    ],
    shelter: 'Open',
    tips: [
      'Go at sunrise on Sunday, patrols are thin then.',
      'Bring 54mm or bigger wheels, the concrete is rough.',
      'Be ready to move fast if a patrol truck comes by.',
    ],
    busyByTime: { morning: 5, afternoon: 1, evening: 2, night: 1 },
    busyByDay: [2, 2, 2, 3, 3, 5, 6],
  },
  {
    id: 'ikoyi-manual-pads',
    name: 'Ikoyi Manual Pads',
    area: 'Ikoyi',
    lat: 6.454,
    lng: 3.4316,
    obstacles: ['Manual pad', 'Ledge'],
    surface: 'Smooth',
    bestTime: 'Weekday afternoons, shaded by trees',
    notes:
      'Two low manual pads side by side in a quiet estate courtyard. Residents are friendly, keep the noise down.',
    verified: true,
    liveCount: 0,
    weeklyVisits: 19,
    lastActive: 'Yesterday',
    securityLevel: 'Low',
    securityNote:
      'Residents are used to skaters and rarely complain. Keep noise low and do not block the driveways.',
    securityReports: [
      { id: 'r1', type: 'All clear', at: daysAgo(6) },
      { id: 'r2', type: 'All clear', at: daysAgo(13) },
      { id: 'r3', type: 'All clear', at: daysAgo(20) },
    ],
    shelter: 'Covered',
    tips: [
      'Weekday afternoons are shaded and quiet.',
      'Keep the volume down, people live right there.',
      'Sweep the pads first, leaves collect overnight.',
    ],
    busyByTime: { morning: 2, afternoon: 4, evening: 3, night: 1 },
    busyByDay: [3, 4, 3, 4, 5, 4, 3],
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
