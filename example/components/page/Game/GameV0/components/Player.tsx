import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { ServerMessage } from '@/server/types/ServerMessage';

import { gameBus, getPlayerEvent } from '../gameBus';
import type { InitialPlayerInfo } from '../InitialPlayerInfo';

type PlayerServerMessage =
  | Extract<ServerMessage, { type: 'move' }>
  | Extract<ServerMessage, { type: 'hold' }>
  | Extract<ServerMessage, { type: 'join' }>;

type Props = {
  initialPlayerInfo: InitialPlayerInfo;
};
export const Player = ({ initialPlayerInfo }: Props) => {
  const { t } = useTranslation();

  const userId = initialPlayerInfo.userId;

  const translateX = useSharedValue(initialPlayerInfo.x);
  const translateY = useSharedValue(initialPlayerInfo.y);
  const scale = useSharedValue(1);
  const [playerIndex, setPlayerIndex] = useState(0);

  const messageHandler = useCallback(
    (message: PlayerServerMessage) => {
      switch (message.type) {
        case 'move':
          translateX.value = message.position.x;
          translateY.value = -message.position.y;
          break;
        case 'hold':
          scale.value = withSpring(1 + message.holding, {
            clamp: { min: 1, max: 2 },
          });
          break;
        case 'join':
          setPlayerIndex(message.index);
          translateX.value = message.position.x;
          translateY.value = -message.position.y;
          break;
      }
    },
    [scale, translateX, translateY]
  );

  useEffect(() => {
    gameBus.on(getPlayerEvent(userId), messageHandler);

    return () => {
      gameBus.removeListener(getPlayerEvent(userId), messageHandler);
    };
  }, [messageHandler, userId]);

  const playerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={playerStyle}>
      <Text>{t('game.player', { playerIndex })}</Text>
    </Animated.View>
  );
};
