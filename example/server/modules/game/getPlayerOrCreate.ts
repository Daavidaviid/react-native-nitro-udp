import type { PlayerInfo } from './PlayerInfo';
import { players } from './players';

const getNewPosition = () => {
  return {
    x: Math.random() * 400 - 200,
    y: Math.random() * 200 - 100,
  };
};

export const getPlayerOrCreate = (userId: string, port: number, address: string) => {
  const player = players.get(userId);

  if (player) return player;

  const newPlayer: PlayerInfo = {
    position: getNewPosition(),
    speed: 0,
    rotation: 0,
    holding: 0,
    lastHeardAt: Date.now(),
    port,
    address,

    index: players.size,
  };

  players.set(userId, newPlayer);

  return newPlayer;
};
