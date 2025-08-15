import { getServerSend } from '../udp/getServerSend';
import { players } from './players';

const PING_INTERVAL_MS = 1000;
const PING_TIMEOUT_MS = 2_000;

export const pingLoop = (udpSocket: Bun.udp.Socket<'buffer'>) => {
  setInterval(() => {
    const { send, sendAll } = getServerSend(udpSocket);

    // if (players.size) {
    //   console.log(`Pinging ${players.size} players`);
    //   console.log(`Players ${Array.from(players.keys()).join(', ')}`);
    // }

    players.forEach((player, userId) => {
      if (Date.now() - player.lastHeardAt > PING_TIMEOUT_MS) {
        players.delete(userId);
        sendAll({ type: 'leave', userId });
        return;
      }

      send(userId, { type: 'ping', userId });
    });
  }, PING_INTERVAL_MS);
};
