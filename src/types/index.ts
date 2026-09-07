export type RoomStatus = 'lobby' | 'countdown' | 'racing' | 'finished';

export interface PlayerProfile {
  id: string;
  name: string;
  avatar?: string;
  country?: string;
  vehicle?: string;
}

export interface VehicleConfig {
  accent: string;
  body: string;
  trail: string;
}

export interface PlayerProgress {
  playerId: string;
  charIndex: number;
  correctChars: number;
  totalKeypresses: number;
  errors: number;
  currentWpm: number;
  rawWpm: number;
  accuracy: number;
  errorState: boolean;
  streak: number;
  progressPercent: number;
}

export interface RoomMember {
  id: string;
  profile: PlayerProfile;
  vehicle: VehicleConfig;
  progress: PlayerProgress;
}

export interface RoomState {
  code: string;
  status: RoomStatus;
  players: RoomMember[];
  countdown: number;
  raceStartTime: number | null;
}

export interface NetworkPayload {
  pid: string;
  c: number;
  w: number;
  p: number;
  e: boolean;
}

export interface ClientMessage {
  type: 'JOIN_ROOM' | 'PROGRESS' | 'FINISH' | 'PONG';
  payload?: Record<string, unknown>;
}

export interface TypingEvent {
  expected: string;
  actual: string | null;
  correct: boolean;
  isBackspace: boolean;
  timestamp: number;
}

export interface TypingState {
  text: string;
  charIndex: number;
  inputHistory: TypingEvent[];
  started: boolean;
  finished: boolean;
  errorState: boolean;
  streak: number;
}

export interface TypingMetrics {
  currentWpm: number;
  rawWpm: number;
  accuracy: number;
  progressPercent: number;
  streak: number;
  errorState: boolean;
}
