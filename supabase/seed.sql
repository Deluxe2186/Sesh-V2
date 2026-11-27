-- Sesh-V2 Seed Data
-- Run this AFTER 0001_init.sql in the Supabase SQL Editor
-- Requires: profiles to exist (create auth users first, or insert profiles manually)

-- This seed assumes you have created auth users with matching handles.
-- For development, you can create users via Supabase Auth UI, then run this.

-- =============================================================================
-- HELPER: Insert spots (status=approved, verified as in seed)
-- =============================================================================
-- Note: created_by should match an existing profile.id (auth user)
-- For now, we'll insert with a placeholder - update after creating users

insert into spots (id, name, area, lat, lng, obstacles, surface, best_time, notes, how_to_find, shelter, security_level, security_note, tips, verified, approximate_location, status, created_by, created_at, updated_at)
values
-- Stadium
(
  'national-stadium',
  'Stadium',
  'Surulere',
  6.501,
  3.356,
  array['Stairs', 'Ledge', 'Rail', 'Flatground'],
  'Smooth',
  'Weekday evenings after 5pm, weekends early morning',
  'National Stadium outer concourse has long smooth ledges, a solid stair set with rail, and plenty of flatground. The concrete is well-maintained and waxed by locals.',
  'Outer concourse of National Stadium, Surulere',
  'Partly covered',
  'Low',
  'Stadium staff are used to skaters on the outer areas. Avoid the main pitch and indoor halls. Weekends can get busy with joggers.',
  array[
    'The ledges by Gate C run best after rain once dried.',
    'Stair set at Gate B has a mellow rail, good for learning.',
    'Weekday evenings are quiet, weekends fill up by 10am.'
  ],
  true,
  false,
  'approved',
  null, -- update with actual user UUID
  now() - interval '30 days',
  now() - interval '1 day'
),
-- Train station
(
  'ebute-metta-station',
  'Train station',
  'Ebute Metta',
  6.482,
  3.384,
  array['Stairs', 'Gap', 'Ledge', 'Manual pad'],
  'Rough',
  'Early mornings 6-8am before commuter rush',
  'Lagos Terminus forecourt and pedestrian bridge. Coarse concrete stairs with metal edges, a fun gap over the drainage channel, and low ledges along the platform ramp.',
  'Lagos Terminus forecourt, Ebute Metta',
  'Covered',
  'Medium',
  'Station security tolerates skating before 8am. After that the forecourt fills with commuters and okadas. Do not session the platforms.',
  array[
    'Hit it at 6am sharp, you have two hours before the rush.',
    'The gap over the drain is sketchy, scout the landing first.',
    'Bridge ledges are waxed but the concrete is rough, bring big wheels.'
  ],
  true,
  false,
  'approved',
  null,
  now() - interval '25 days',
  now() - interval '2 days'
),
-- Maryland bridge
(
  'maryland-bridge',
  'Maryland bridge',
  'Maryland',
  6.584,
  3.372,
  array['Bank', 'Gap', 'Ledge'],
  'Rough',
  'Mid-mornings when traffic noise masks the session',
  'The pedestrian bridge over the expressway has a mellow banked approach, a drainage gap mid-span, and coping ledges on both sides. Windy but the bank is unique.',
  'Pedestrian bridge over Lagos-Ibadan Expressway, Maryland',
  'Open',
  'Medium',
  'LASEMA and bridge patrol pass by occasionally. They usually wave if you are not blocking the walkway. Keep sessions low-key.',
  array[
    'The bank is steepest on the Ikeja-side approach.',
    'Gap is widest at the expansion joint, ollie early.',
    'Wind picks up past 11am, affects flip tricks on the bridge.'
  ],
  false,
  false,
  'approved',
  null,
  now() - interval '20 days',
  now() - interval '3 days'
),
-- Waf Skatepark
(
  'waf-skatepark',
  'Waf Skatepark',
  'Lagos Island',
  6.452,
  3.396,
  array['Ramp', 'Bowl', 'Rail', 'Ledge', 'Flatground'],
  'Smooth',
  'Weekdays 4-8pm, weekends 10am-6pm',
  'West African Festival (WAF) skatepark at Tafawa Balewa Square. Concrete bowl with pool coping, street section with rails and ledges, and a mini ramp. The only proper skatepark on the Island.',
  'Tafawa Balewa Square, Lagos Island',
  'Covered',
  'Low',
  'Official skatepark, free entry. Park marshals are skaters themselves. Helmets required for under-16s, recommended for all.',
  array[
    'Bowl coping is fresh, runs fast after a light wax.',
    'Street section rails are kinked, practice on the flat bar first.',
    'Weekends get packed after 12pm, weekdays are gold.'
  ],
  true,
  false,
  'approved',
  null,
  now() - interval '15 days',
  now() - interval '1 hour'
),
-- Church Street
(
  'church-street-alapere',
  'Church Street',
  'Alapere',
  6.578,
  3.368,
  array['Ledge', 'Manual pad', 'Flatground'],
  'Smooth',
  'Late afternoons after 4pm, shaded by trees',
  'Quiet residential street behind the Catholic church. Long smooth marble ledges along the fence, two manual pads by the gate, and clean flatground. Locals keep it swept.',
  'Behind Catholic Church, Alapere',
  'Partly covered',
  'Low',
  'Church security knows the skaters and does not mind after mass times. Keep noise down during services (Sun 7-10am, Wed 5-7pm).',
  array[
    'Ledges are marble, run slow until waxed — bring a block.',
    'Manual pads are low and wide, perfect for combos.',
    'Tree shade makes this a great midday spot in dry season.'
  ],
  true,
  false,
  'approved',
  null,
  now() - interval '10 days',
  now() - interval '5 hours'
),
-- Ogba spot
(
  'ogba-spot',
  'Ogba spot',
  'Ogba',
  6.652,
  3.334,
  array['Stairs', 'Rail', 'Bank'],
  'Average',
  'Evenings from 6pm, weekend afternoons',
  'Commercial complex behind Ogba retail market. Six-stair with a round rail, a mellow banked loading dock, and cracked flatground. The crew meets here most evenings.',
  'Behind Ogba retail market, Ogba',
  'Partly covered',
  'Medium',
  'Complex guards ask large groups to disperse. Crews of 3-4 are usually fine. Market area boys can be aggressive after dark, skate and leave.',
  array[
    'The rail is round and fast, wax the top before you try.',
    'Bank has a crack halfway up, approach from the left.',
    'Come with the local crew, they know the guard rotations.'
  ],
  false,
  false,
  'approved',
  null,
  now() - interval '8 days',
  now() - interval '12 hours'
),
-- Mainland Ramp Lot
(
  'mainland-ramp-lot',
  'Mainland Ramp Lot',
  'Yaba',
  6.515,
  3.38,
  array['Ramp', 'Bank', 'Flatground'],
  'Average',
  'Evenings from 6pm, the locals session weekly',
  'Community-built quarter pipe and bank in a disused lot. The crew sweeps it every Saturday, all are welcome.',
  'Disused lot off Herbert Macaulay Way, Yaba',
  'Partly covered',
  'Low',
  'The lot is looked after by the local crew and there is no security. Be respectful and take your rubbish.',
  array[
    'Come after 6pm, the whole crew shows up then.',
    'Help sweep on Saturdays, the crew will look after you.',
    'Bring wax, the ramp coping runs slow in the heat.'
  ],
  true,
  false,
  'approved',
  null,
  now() - interval '5 days',
  now() - interval '30 minutes'
),
-- Island Gap Run
(
  'island-gap-run',
  'Island Gap Run',
  'Lekki',
  6.44,
  3.49,
  array['Gap', 'Stairs', 'Bank'],
  'Rough',
  'Early mornings, before the market opens',
  'A three-block gap run along the service road. Rough through the middle section, scout the line first.',
  'Service road off Admiralty Way, Lekki',
  'Open',
  'High',
  'The service road is busy by 8am and market traders call the area boys if you linger. Skate and go.',
  array[
    'Scout the line first, the middle section is rough.',
    'Be done by 8am before the market fills the road.',
    'Skate it fast and move on, do not loiter.'
  ],
  false,
  false,
  'approved',
  null,
  now() - interval '2 days',
  now() - interval '2 days'
)
on conflict (id) do update set
  name = excluded.name,
  area = excluded.area,
  lat = excluded.lat,
  lng = excluded.lng,
  obstacles = excluded.obstacles,
  surface = excluded.surface,
  best_time = excluded.best_time,
  notes = excluded.notes,
  how_to_find = excluded.how_to_find,
  shelter = excluded.shelter,
  security_level = excluded.security_level,
  security_note = excluded.security_note,
  tips = excluded.tips,
  verified = excluded.verified,
  approximate_location = excluded.approximate_location,
  status = excluded.status,
  updated_at = now();

-- =============================================================================
-- SECURITY REPORTS (sample recent reports)
-- =============================================================================
-- Note: user_id should match existing profile.id
-- These are placeholder - update after creating users

insert into security_reports (spot_id, user_id, type, created_at)
values
-- Stadium reports
('national-stadium', null, 'All clear', now() - interval '1 day'),
('national-stadium', null, 'All clear', now() - interval '5 days'),
('national-stadium', null, 'All clear', now() - interval '12 days'),
-- Train station reports
('ebute-metta-station', null, 'Security came by', now() - interval '3 days'),
('ebute-metta-station', null, 'All clear', now() - interval '8 days'),
('ebute-metta-station', null, 'Asked to leave', now() - interval '14 days'),
-- Maryland bridge reports
('maryland-bridge', null, 'All clear', now() - interval '4 days'),
('maryland-bridge', null, 'Security came by', now() - interval '10 days'),
('maryland-bridge', null, 'All clear', now() - interval '17 days'),
-- Waf Skatepark reports
('waf-skatepark', null, 'All clear', now() - interval '1 day'),
('waf-skatepark', null, 'All clear', now() - interval '3 days'),
('waf-skatepark', null, 'All clear', now() - interval '7 days'),
-- Church Street reports
('church-street-alapere', null, 'All clear', now() - interval '2 days'),
('church-street-alapere', null, 'All clear', now() - interval '6 days'),
('church-street-alapere', null, 'All clear', now() - interval '13 days'),
-- Ogba spot reports
('ogba-spot', null, 'Asked to leave', now() - interval '2 days'),
('ogba-spot', null, 'All clear', now() - interval '7 days'),
('ogba-spot', null, 'Security came by', now() - interval '11 days'),
-- Mainland Ramp Lot reports
('mainland-ramp-lot', null, 'All clear', now() - interval '1 day'),
('mainland-ramp-lot', null, 'All clear', now() - interval '5 days'),
('mainland-ramp-lot', null, 'All clear', now() - interval '12 days'),
-- Island Gap Run reports
('island-gap-run', null, 'Asked to leave', now() - interval '2 days'),
('island-gap-run', null, 'Security came by', now() - interval '6 days'),
('island-gap-run', null, 'Asked to leave', now() - interval '10 days')
on conflict do nothing;

-- =============================================================================
-- NOTE: Sessions and spot_media are not seeded as they require real users.
-- The spot_stats function and spot_live_counts view will work with real session data.
-- =============================================================================