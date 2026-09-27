import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const MARQUEE_TEXT = 'THIS IS THE FATEFUL MOMENT...';
const MARQUEE_WIDTH = 150; // est.
const MARQUEE_SPEED = 30; // pt per second
// Room for the text to lay out at its natural width; only the visible
// MARQUEE_WIDTH window is shown, so this just has to exceed the text.
const MARQUEE_TRACK_WIDTH = 1000;

type TriangleProps = {
  direction: 'left' | 'right';
  size: number;
  color: string;
};

/*
 * Pending Figma icon assets: the rewind / forward / play glyphs are drawn
 * with border triangles until the exports are provided.
 */
function Triangle({ direction, size, color }: TriangleProps) {
  return (
    <View
      style={[
        styles.triangle,
        {
          borderTopWidth: size / 2,
          borderBottomWidth: size / 2,
          [direction === 'right' ? 'borderLeftWidth' : 'borderRightWidth']:
            size * 0.85,
          [direction === 'right' ? 'borderLeftColor' : 'borderRightColor']:
            color,
        },
      ]}
    />
  );
}

function DoubleTriangle({ direction }: { direction: 'left' | 'right' }) {
  return (
    <View style={styles.double}>
      <Triangle direction={direction} size={8} color={colors.textSecondary} />
      <Triangle direction={direction} size={8} color={colors.textSecondary} />
    </View>
  );
}

/** Scrolls its text from right to left forever (native driver). */
function Marquee({ text }: { text: string }) {
  const [textWidth, setTextWidth] = useState(0);
  const offset = useRef(new Animated.Value(MARQUEE_WIDTH)).current;

  useEffect(() => {
    if (textWidth === 0) {
      return;
    }
    const distance = MARQUEE_WIDTH + textWidth;
    offset.setValue(MARQUEE_WIDTH);
    const loop = Animated.loop(
      Animated.timing(offset, {
        toValue: -textWidth,
        duration: (distance / MARQUEE_SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [offset, textWidth]);

  return (
    <View style={styles.marquee}>
      <Animated.View
        style={[styles.marqueeTrack, { transform: [{ translateX: offset }] }]}
      >
        <Text
          numberOfLines={1}
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          style={styles.marqueeText}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

/**
 * Top-right audio / status pill on the Scenarios screen. Playback is not
 * implemented; the controls are visual only. Sizes are estimates.
 */
export function AudioStatusPill() {
  return (
    <View
      style={styles.pill}
      accessible
      accessibilityLabel={`Standby. ${MARQUEE_TEXT}`}
    >
      <DoubleTriangle direction="left" />
      <DoubleTriangle direction="right" />
      <View style={styles.play}>
        <Triangle direction="right" size={10} color={colors.background} />
      </View>
      <Text style={styles.status}>STANDBY</Text>
      <Marquee text={MARQUEE_TEXT} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 40, // est.
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondaryButtonFill,
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  double: {
    flexDirection: 'row',
  },
  play: {
    width: 28, // est.
    height: 28,
    borderRadius: 14,
    paddingLeft: 2, // optical centering of the triangle
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  status: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold, // est.
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
  marquee: {
    width: MARQUEE_WIDTH,
    height: 14,
    overflow: 'hidden',
  },
  marqueeTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MARQUEE_TRACK_WIDTH,
    // Row + flex-start: the text takes its natural width, not the track's.
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marqueeText: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.medium, // est.
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
});
