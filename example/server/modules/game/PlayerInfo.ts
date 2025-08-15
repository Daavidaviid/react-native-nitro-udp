import type { Position } from '@/server/types/position';

export type Player = {
  index: number;
  position: Position;
  speed: number;
  rotation: number;
  holding: number;
};
export type PlayerInfo = Player & {
  lastHeardAt: number;

  port: number;
  address: string;
  ack: boolean;
};
