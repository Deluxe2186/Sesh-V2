export type Obstacle =
  | 'Stairs'
  | 'Ramp'
  | 'Rail'
  | 'Ledge'
  | 'Gap'
  | 'Flatground'
  | 'Bank'
  | 'Manual pad'
  | 'Bowl';

export type Surface = 'Smooth' | 'Average' | 'Rough';

export type Stance = 'Goofy' | 'Regular';

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type SecurityLevel = 'Low' | 'Medium' | 'High';

export type Shelter = 'Open' | 'Partly covered' | 'Covered';

export type SecurityReportType =
  | 'Security came by'
  | 'Asked to leave'
  | 'All clear';

export interface SecurityReport {
  id: string;
  type: SecurityReportType;
  at: string;
}

export interface BusyByTime {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface Spot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  obstacles: Obstacle[];
  surface: Surface;
  bestTime: string;
  notes: string;
  verified: boolean;
  liveCount: number;
  weeklyVisits: number;
  lastActive: string;
  securityLevel: SecurityLevel;
  securityNote: string;
  securityReports: SecurityReport[];
  shelter: Shelter;
  tips: string[];
  busyByTime: BusyByTime;
  busyByDay: number[];
}

export interface Skater {
  id: string;
  name: string;
  handle: string;
  stance: Stance;
  level: Level;
  preferredObstacles: Obstacle[];
}

export interface SessionMember {
  id: string;
  named: boolean;
  name?: string;
  stance?: Stance;
  level?: Level;
}

export interface LiveSession {
  id: string;
  spotId: string;
  startedAt: string;
  members: SessionMember[];
}

export interface Session {
  id: string;
  spotId: string;
  skaterIds: string[];
  startedAt: string;
  active: boolean;
}

export interface User extends Skater {}

export type SubmissionStatus = 'draft' | 'ready_to_send' | 'pending_review' | 'approved';

export interface SubmissionFile {
  name: string;
  originalSize: number;
  compressedSize: number;
  thumbnail: string; // base64 data URL, max 200px
  type: 'image' | 'video';
  duration?: number; // for video, in seconds
}

export interface SpotSubmission {
  id: string;
  userId: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  // Step 1: Basics
  name: string;
  area: string;
  howToFind: string;
  description: string;
  surface: 'Smooth' | 'Average' | 'Rough';
  shelter: 'Open' | 'Partly covered' | 'Covered';
  bestTime: string;
  securityLevel: 'Low' | 'Medium' | 'High';
  securityNote: string;
  lat: number;
  lng: number;
  approximateLocation: boolean;
  // Step 2: Obstacles
  obstacles: string[]; // Obstacle[] + custom
  customObstacle: string;
  // Step 3: Proof
  files: SubmissionFile[];
  // Computed
  totalDataMB: number;
}
