import 'react-native-get-random-values';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUdp } from 'react-native-nitro-udp';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { v4 } from 'uuid';

import { Cube } from '@/components/FiberCanvas/Cube';
import { GrowingHoldButton } from '@/components/GrowingHoldButton';
import { Joystick } from '@/components/Joystick';

const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

type Message =
  | {
      type: 'move';
      userId: string;
      x: number;
      y: number;
    }
  | {
      type: 'hold';
      userId: string;
      holding: number;
    };

export const GameV2 = () => {
  const transformX = useSharedValue(0);
  const transformY = useSharedValue(0);
  const scale = useSharedValue(1);

  const { send } = useUdp({ host: LOCALHOST, port: 1234 }, data => {
    const message = JSON.parse(data) as Message;

    switch (message.type) {
      case 'move':
        transformX.value = withSpring(message.x);
        transformY.value = withSpring(-message.y);
        break;
      case 'hold':
        scale.value = withSpring(1 + message.holding, { clamp: { min: 1, max: 2 } });
        break;
    }
  });

  const [userId] = useState(v4());

  const onChangeJoystick = (x: number, y: number) => {
    send(JSON.stringify({ type: 'move', userId, x, y }));
  };

  const onChangeButton = ({ holding }: { holding: boolean; progress: number }) => {
    send(JSON.stringify({ type: 'hold', userId, holding }));
  };

  const gameStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: transformX.value },
      { translateY: transformY.value },
      { scale: scale.value },
    ],
  }));

  const { t } = useTranslation();

  return (
    <GestureHandlerRootView>
      <View className="flex-1 items-center justify-center">
        <Cube />

        <Joystick onChange={onChangeJoystick} />
        <GrowingHoldButton onChange={onChangeButton} label={t('game.hold')} />
      </View>
    </GestureHandlerRootView>
  );
};
