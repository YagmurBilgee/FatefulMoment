import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Press-down scale feedback for buttons. Spread the handlers on a Pressable
 * and apply `style` to an Animated.View wrapping it.
 *
 * Runs on the native driver. When `inactive` turns true (disabled or
 * loading) the scale snaps back to 1 so a press that started just before the
 * state change cannot leave the button shrunk.
 */
export function usePressScale(pressedScale: number, inactive = false) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number, bounciness: number) => {
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (inactive) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [inactive, scale]);

  return {
    style: { transform: [{ scale }] },
    onPressIn: () => animateTo(pressedScale, 0),
    onPressOut: () => animateTo(1, 6),
  };
}
