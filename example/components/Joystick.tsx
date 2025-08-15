// Joystick.tsx (uniform emit while held)
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  radius?: number;
  onChange?: (x: number, y: number) => void; // normalized [-1..1], y+: up
  emitHz?: number; // default 30
};

export const Joystick: React.FC<Props> = ({ radius = 80, onChange, emitHz = 50 }) => {
  const R = radius,
    size = R * 2,
    KNOB = Math.round(R * 0.8);
  const x = useSharedValue(0),
    y = useSharedValue(0),
    active = useSharedValue(false);
  const lastEmit = useSharedValue(0),
    emitIntervalMs = 1000 / Math.max(1, emitHz);

  const clampToCircle = useMemo(
    () => (nx: number, ny: number) => {
      'worklet';
      const d = Math.hypot(nx, ny);
      if (d <= R) return { x: nx, y: ny };
      const k = R / d;
      return { x: nx * k, y: ny * k };
    },
    [R]
  );

  // Single source of truth for emissions (uniform rate whether moving or still)
  useFrameCallback(({ timeSinceFirstFrame }) => {
    'worklet';
    if (!active.value || !onChange) return;
    if (timeSinceFirstFrame - lastEmit.value >= emitIntervalMs) {
      lastEmit.value = timeSinceFirstFrame;
      runOnJS(onChange)(x.value / R, -y.value / R);
    }
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      active.value = true;
      // Force first emit on the next frame (low-latency start)
      lastEmit.value = -emitIntervalMs;
    })
    .onChange(e => {
      const v = clampToCircle(x.value + e.changeX, y.value + e.changeY);
      x.value = v.x;
      y.value = v.y;
      // no immediate emit here — frame loop handles uniform cadence
    })
    .onEnd(() => {
      active.value = false;
      x.value = withSpring(0, { damping: 15 });
      y.value = withSpring(0, { damping: 15 });
      if (onChange) runOnJS(onChange)(0, 0);
    })
    .onFinalize(() => {
      active.value = false;
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <View className="absolute bottom-6 left-6" style={{ width: size, height: size }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          className="rounded-full border border-blue-500/20 bg-blue-500/10"
          style={{ width: size, height: size }}
        >
          <Animated.View
            className="absolute rounded-full bg-blue-500/70 dark:bg-blue-500/60"
            style={[
              { width: KNOB, height: KNOB, left: R - KNOB / 2, top: R - KNOB / 2 },
              knobStyle,
            ]}
          />
          <View
            className="absolute rounded-full bg-blue-500/40"
            style={{ width: 6, height: 6, left: R - 3, top: R - 3 }}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
