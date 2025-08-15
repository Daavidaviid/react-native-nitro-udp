import { EventEmitter } from 'events';
export const gameBus = new EventEmitter();

export const getPlayerEvent = (userId: string) => `player-${userId}`;
