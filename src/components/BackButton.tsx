import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { colors } from '../theme/colors';

const SIZE = 40; // est. — measured 39–40pt in the Sign in frames
// Figma @3x export, 48px -> 16pt. Exported black; tinted to the icon color.
const ICON_SIZE = 16;

const arrowIcon = require('../assets/images/icon-back.png');

type BackButtonProps = {
  onPress: () => void;
};

/** Circular top-left back button used on the auth screens. */
export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
    >
      <Image source={arrowIcon} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.inputFill, // est.
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    tintColor: colors.backButtonIcon,
  },
});
