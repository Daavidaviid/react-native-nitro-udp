import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import { GameV0 } from '@/components/page/Game/GameV0/GameV0';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function GameScreen() {
  const [shouldDisplayGame, setShouldDisplayGame] = useState(false);

  const initializeGame = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setShouldDisplayGame(true);
  };

  const router = useRouter();
  const destroyGame = async () => {
    setShouldDisplayGame(false);
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    router.back();
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (!shouldDisplayGame) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <GameV0 />
      <BackButton onPress={destroyGame} />
    </View>
  );
}

const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute top-4 left-4 size-12 items-center justify-center bg-white/50 shadow-md rounded-full"
    >
      <IconSymbol name="xmark" color="gray" size={24} />
    </TouchableOpacity>
  );
};
