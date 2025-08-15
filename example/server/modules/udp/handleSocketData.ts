import { getPlayerOrCreate } from '@/server/modules/game/getPlayerOrCreate';
import { players } from '@/server/modules/game/players';
import type { ClientMessage } from '@/server/types/ClientMessage';

import { getServerSend } from './getServerSend';

export const handleSocketData = (
  udpSocket: Bun.udp.Socket<'buffer'>,
  buf: Buffer<ArrayBufferLike>,
  port: number,
  address: string
) => {
  const message = JSON.parse(buf.toString()) as ClientMessage;
  const player = getPlayerOrCreate(message.userId, port, address);

  const { sendAll } = getServerSend(udpSocket);

  switch (message.type) {
    case 'ack': {
      players.set(message.userId, { ...player, ack: true });
      break;
    }
    case 'join': {
      sendAll({
        type: 'join',
        userId: message.userId,
        index: player.index,
        position: player.position,
      });
      break;
    }
    case 'move': {
      const position = {
        x: player.position.x + 3 * message.x,
        y: player.position.y + 3 * message.y,
      };

      players.set(message.userId, { ...player, position, lastHeardAt: Date.now() });
      sendAll({ type: 'move', userId: message.userId, position });
      break;
    }
    case 'hold': {
      const holding = message.holding ? Math.min(3, player.holding + 0.1) : 0;

      players.set(message.userId, { ...player, holding, lastHeardAt: Date.now() });
      sendAll({ type: 'hold', userId: message.userId, holding });
      break;
    }
    case 'pong': {
      players.set(message.userId, { ...player, lastHeardAt: Date.now() });
      break;
    }
  }
};
