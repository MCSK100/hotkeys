import { create } from 'zustand';
import { RoomState, RoomStatus, PlayerProgress, PlayerProfile, VehicleConfig } from '@/types';

interface GameStoreState {
  connected: boolean;
  socket: WebSocket | null;
  room: RoomState | null;
  localPlayerId: string;
  countdownValue: number;
  raceStartTime: number | null;
  hudOpacity: number;
  latency: number;
  roomStatus: RoomStatus;
  setSocket: (socket: WebSocket | null) => void;
  setConnected: (connected: boolean) => void;
  setRoom: (room: RoomState | null | ((prev: RoomState | null) => RoomState | null)) => void;
  setLocalPlayerId: (id: string) => void;
  setCountdownValue: (value: number) => void;
  setRaceStartTime: (time: number | null) => void;
  updateRoomStatus: (status: RoomStatus) => void;
  setLatency: (latency: number) => void;
  updatePlayerProgress: (playerId: string, progress: PlayerProgress) => void;
  setHudOpacity: (opacity: number) => void;
  reset: () => void;
}

const initialRoom: RoomState = {
  code: 'PUBLIC',
  status: 'lobby',
  players: [],
  countdown: 0,
  raceStartTime: null,
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  connected: false,
  socket: null,
  room: initialRoom,
  localPlayerId: 'local-player',
  countdownValue: 0,
  raceStartTime: null,
  hudOpacity: 1,
  latency: 0,
  roomStatus: 'lobby',
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  setRoom: (room) => set((state) => ({ room: typeof room === 'function' ? room(state.room) : room })),
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  setCountdownValue: (value) => set({ countdownValue: value }),
  setRaceStartTime: (time) => set({ raceStartTime: time }),
  updateRoomStatus: (status) => set((state) => ({
    roomStatus: status,
    room: state.room ? { ...state.room, status } : state.room,
  })),
  setLatency: (latency) => set({ latency }),
  updatePlayerProgress: (playerId, progress) => set((state) => {
    if (!state.room) return state;
    const players = state.room.players.map((player) =>
      player.id === playerId ? { ...player, progress } : player,
    );
    return { room: { ...state.room, players } };
  }),
  setHudOpacity: (opacity) => set({ hudOpacity: opacity }),
  reset: () => set({
    connected: false,
    socket: null,
    room: initialRoom,
    localPlayerId: 'local-player',
    countdownValue: 0,
    raceStartTime: null,
    hudOpacity: 1,
    latency: 0,
    roomStatus: 'lobby',
  }),
}));
