import 'react-native-get-random-values';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GrowingHoldButton } from '@/components/GrowingHoldButton';
import { Joystick } from '@/components/Joystick';

import { Player } from './components/Player';
import { useGameV0 } from './hooks/useGameV0';

export const GameV0 = () => {
  const { initialPlayerInfos, send, userId, textEncoder } = useGameV0();

  const onChangeJoystick = (x: number, y: number) => {
    send(
      textEncoder.current.encode(JSON.stringify({ type: 'move', userId, x, y }))
        .buffer as ArrayBuffer
    );
  };

  const onChangeButton = ({ holding }: { holding: boolean; progress: number }) => {
    send(
      textEncoder.current.encode(JSON.stringify({ type: 'hold', userId, holding }))
        .buffer as ArrayBuffer
    );
  };

  const { t } = useTranslation();

  return (
    <GestureHandlerRootView>
      <View className="flex-1 items-center justify-center">
        {initialPlayerInfos.map(initialPlayerInfo => (
          <Player key={initialPlayerInfo.userId} initialPlayerInfo={initialPlayerInfo} />
        ))}

        <Joystick onChange={onChangeJoystick} />
        <GrowingHoldButton onChange={onChangeButton} label={t('game.hold')} />
      </View>
    </GestureHandlerRootView>
  );
};
