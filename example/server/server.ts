import { pingLoop } from './modules/game/pingLoop';
import { handleSocketData } from './modules/udp/handleSocketData';

const PORT = 1234;

console.log(`Starting server, waiting for messages on port ${PORT}...`);
const udpSocket = await Bun.udpSocket({ port: PORT, socket: { data: handleSocketData } });

pingLoop(udpSocket);
