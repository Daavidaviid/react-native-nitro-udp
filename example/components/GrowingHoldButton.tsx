// GrowingHoldButton.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * onChange is called:
 * - continuously while holding: { holding: true,  progress: 0..1 }
 * - on release:                  { holding: false, progress: 0..1 }
 */
type Props = {
  size?: number;
  growDurationMs?: number;
  maxScale?: number;
  emitHz?: number;
  label: string;
  onChange?: (e: { holding: boolean; progress: number }) => void;
};

export const GrowingHoldButton: React.FC<Props> = ({
  size = 72,
  growDurationMs = 2_000,
  maxScale = 1.6,
  emitHz = 30,
  label,
  onChange,
}) => {
  const scale = useSharedValue(1);
  const holding = useSharedValue(false);
  const lastEmit = useSharedValue(0);
  const emitIntervalMs = 1000 / Math.max(1, emitHz);
  const maxDelta = Math.max(0.0001, maxScale - 1);

  const emit = (isHolding: boolean) => {
    'worklet';
    if (!onChange) return;
    const progress = Math.min(1, Math.max(0, (scale.value - 1) / maxDelta));
    runOnJS(onChange)({ holding: isHolding, progress });
  };

  // Continuous emit while holding
  useFrameCallback(({ timeSinceFirstFrame }) => {
    'worklet';
    if (!holding.value || !onChange) return;
    if (timeSinceFirstFrame - lastEmit.value >= emitIntervalMs) {
      lastEmit.value = timeSinceFirstFrame;
      emit(true);
    }
  });

  // Start immediately on touch, grow toward maxScale while held
  const longPress = Gesture.LongPress()
    .minDuration(0) // fires onStart immediately
    .onStart(() => {
      holding.value = true;
      lastEmit.value = 0;
      cancelAnimation(scale);
      scale.value = withTiming(maxScale, { duration: growDurationMs });
      emit(true); // immediate
    })
    .onEnd(() => {
      // Release: report final progress, then spring back
      emit(false);
      holding.value = false;
      cancelAnimation(scale);
      scale.value = withSpring(1, { damping: 15, stiffness: 180 });
    })
    .onFinalize(() => {
      if (holding.value) {
        emit(false);
        holding.value = false;
        cancelAnimation(scale);
        scale.value = withSpring(1, { damping: 15, stiffness: 180 });
      }
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="absolute bottom-6 right-6">
      <GestureDetector gesture={longPress}>
        <Animated.View
          className="rounded-full bg-white/80 dark:bg-white/70 shadow-lg items-center justify-center"
          style={[{ width: size, height: size }, style]}
        >
          <Text className="text-black/80 font-semibold">{label}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
