import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

/** Share of the time left below which the screen edges tint red. */
export const URGENT_FRACTION = 0.3;

const BAR_HEIGHT = 6; // est.

/**
 * Subtle red edge tint for the last stretch of the decision window. Driven
 * by the same `remaining` value (1 → 0) as the timer bar; invisible until
 * `URGENT_FRACTION` of the time is left, then fades in to full at zero.
 */
export function UrgencyVignette({ remaining }: { remaining: Animated.Value }) {
  const opacity = remaining.interpolate({
    inputRange: [0, URGENT_FRACTION],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.vignette, { opacity }]}
    />
  );
}

/**
 * Horizontal countdown bar. `remaining` runs from 1 to 0 and the fill
 * scales down around its center, so it shrinks from both ends at once
 * (Figma). Its color moves yellow → orange (half time) → red (from
 * `URGENT_FRACTION`), by fading stacked color layers in on top.
 */
export function TensionTimer({ remaining }: { remaining: Animated.Value }) {
  const orange = remaining.interpolate({
    inputRange: [0.5, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const red = remaining.interpolate({
    inputRange: [URGENT_FRACTION, 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel="Decision timer"
    >
      <Animated.View
        style={[styles.fill, { transform: [{ scaleX: remaining }] }]}
      >
        <View style={[styles.layer, styles.start]} />
        <Animated.View
          style={[styles.layer, styles.mid, { opacity: orange }]}
        />
        <Animated.View style={[styles.layer, styles.end, { opacity: red }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Kept faint: a hint of red at the screen edges, not a red screen.
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'radial-gradient(ellipse at center, rgba(251, 44, 54, 0) 55%, rgba(251, 44, 54, 0.12) 80%, rgba(251, 44, 54, 0.32) 100%)',
  },
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: colors.timerTrack,
  },
  // Scales around its center (the default transform origin).
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
  start: {
    backgroundColor: colors.timerStart, // #EAB308
  },
  mid: {
    backgroundColor: colors.timerMid, // #FF6900
  },
  end: {
    backgroundColor: colors.timerEnd, // #FB2C36
  },
});
