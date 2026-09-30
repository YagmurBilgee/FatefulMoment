import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { AudioStatusPill } from './AudioStatusPill';

// The 48pt audio pill fills the bar, so its bottom edge sits flush on the
// full-width separator.
const BAR_HEIGHT = 48;
export const LANDSCAPE_SIDE_PADDING = 24;

/** Horizontal padding for landscape screens: 24pt, or more beside a notch. */
export function useLandscapePadding() {
  const insets = useSafeAreaInsets();
  return {
    paddingLeft: Math.max(insets.left, LANDSCAPE_SIDE_PADDING),
    paddingRight: Math.max(insets.right, LANDSCAPE_SIDE_PADDING),
  };
}

type LandscapeHeaderProps = {
  /** Left side of the bar, e.g. the menu button or back button + title. */
  left: ReactNode;
};

/**
 * Header bar shared by the landscape screens: content on the left, the audio
 * status pill flush with the right screen edge, and a full-width 1pt
 * separator underneath.
 */
export function LandscapeHeader({ left }: LandscapeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { paddingLeft, paddingRight } = useLandscapePadding();
  return (
    <View style={{ paddingTop: insets.top }}>
      {/* No right padding: the pill runs to the screen edge. */}
      <View style={[styles.bar, { paddingLeft }]}>
        <View style={styles.left}>{left}</View>
        <AudioStatusPill edgePadding={paddingRight} />
      </View>
      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  left: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separator: {
    height: 1,
    backgroundColor: colors.headerSeparator,
  },
});
