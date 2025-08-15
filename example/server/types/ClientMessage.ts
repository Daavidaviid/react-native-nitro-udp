import type { Position } from './position';

export type ClientMessage =
  | {
      type: 'ack';
      userId: string;
    }
  | {
      type: 'join';
      userId: string;
    }
  | ({
      type: 'move';
      userId: string;
    } & Position)
  | {
      type: 'hold';
      userId: string;
      holding: boolean;
    }
  | {
      type: 'pong';
      userId: string;
    };
