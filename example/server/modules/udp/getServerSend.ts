import { players } from '@/server/modules/game/players';
import type { ServerMessage } from '@/server/types/ServerMessage';

export const getServerSend = (udpSocket: Bun.udp.Socket<'buffer'>) => {
  const sendAll = (message: ServerMessage) => {
    players.forEach(player => {
      udpSocket.send(JSON.stringify(message), player.port, player.address);
    });
  };

  const send = (userId: string, message: ServerMessage) => {
    const player = players.get(userId);
    if (!player) return;

    udpSocket.send(JSON.stringify(message), player.port, player.address);
  };

  return { sendAll, send };
};
