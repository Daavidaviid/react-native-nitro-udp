import type { Position } from './position';

export type ServerMessage =
  | {
      type: 'join';
      userId: string;
      index: number;
      position: Position;
    }
  | {
      type: 'leave';
      userId: string;
    }
  | {
      type: 'move';
      userId: string;
      position: Position;
    }
  | {
      type: 'hold';
      userId: string;
      holding: number;
    }
  | {
      type: 'ping';
      userId: string;
    };
