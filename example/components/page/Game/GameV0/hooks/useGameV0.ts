import { useEffect, useRef, useState } from 'react';
import { useUdp } from 'react-native-nitro-udp';
import { v4 } from 'uuid';

import type { Player as PlayerType } from '@/server/modules/game/PlayerInfo';
import type { ServerMessage } from '@/server/types/ServerMessage';

import { gameBus, getPlayerEvent } from '../gameBus';
import type { InitialPlayerInfo } from '../InitialPlayerInfo';

const HOST = '192.168.1.45';
// const HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const PORT = 1234;

export const useGameV0 = () => {
  const [userId] = useState(v4());
  const players = useRef<Map<string, PlayerType>>(new Map());
  const textDecoder = useRef(new TextDecoder());
  const textEncoder = useRef(new TextEncoder());

  const [initialPlayerInfos, setInitialPlayerInfos] = useState<InitialPlayerInfo[]>([]);

  const { send } = useUdp({
    host: HOST,
    port: PORT,
    onReceive: data => {
      const stringData = textDecoder.current.decode(data);
      const message = JSON.parse(stringData) as ServerMessage;

      switch (message.type) {
        case 'move': {
          const currentPlayer = players.current.get(message.userId);
          if (!currentPlayer) return;

          players.current.set(message.userId, {
            ...currentPlayer,
            position: message.position,
          });
          gameBus.emit(getPlayerEvent(message.userId), message);

          break;
        }
        case 'hold': {
          const currentPlayer = players.current.get(message.userId);
          if (!currentPlayer) return;

          players.current.set(message.userId, {
            ...currentPlayer,
            holding: message.holding,
          });
          gameBus.emit(getPlayerEvent(message.userId), message);

          break;
        }
        case 'join':
          players.current.set(message.userId, {
            position: message.position,
            holding: 0,
            speed: 0,
            rotation: 0,
            index: message.index,
          });
          setInitialPlayerInfos(prev => [
            ...prev,
            { userId: message.userId, x: message.position.x, y: -message.position.y },
          ]);
          gameBus.emit(getPlayerEvent(message.userId), message);
          break;
        case 'leave':
          players.current.delete(message.userId);
          setInitialPlayerInfos(prev => prev.filter(info => info.userId !== message.userId));
          break;
        case 'ping':
          send(
            textEncoder.current.encode(JSON.stringify({ type: 'pong', userId }))
              .buffer as ArrayBuffer
          );
          break;
      }
    },
  });

  useEffect(() => {
    send(
      textEncoder.current.encode(JSON.stringify({ type: 'join', userId })).buffer as ArrayBuffer
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    initialPlayerInfos,
    send,
    userId,
    textEncoder,
  };
};
