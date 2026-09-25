import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
} from 'react-native';

import { colors } from '../theme/colors';

const SIZE = 40; // est. — measured 39–40pt in the Sign in frames
const ICON_SIZE = 20; // est.

/*
 * Pending: back-arrow asset from Figma. Until it is provided the button draws
 * only its circle; the touch target and accessibility label are complete.
 */
const arrowIcon: ImageSourcePropType | undefined = undefined;

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
      {arrowIcon ? <Image source={arrowIcon} style={styles.icon} /> : null}
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
