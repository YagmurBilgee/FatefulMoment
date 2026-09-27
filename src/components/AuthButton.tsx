import React from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

export type AuthButtonIcon = {
  source: ImageSourcePropType;
  width: number;
  height: number;
};

type AuthButtonProps = {
  label: string;
  icon: AuthButtonIcon;
  /** `primary` is the Email button; `secondary` the Apple / Google ones. */
  variant: 'primary' | 'secondary';
  onPress?: () => void;
};

/** Welcome screen action button with a leading icon (Figma tokens). */
export function AuthButton({ label, icon, variant, onPress }: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.button, isPrimary ? styles.primary : styles.secondary]}
      >
        <Image
          source={icon.source}
          style={{ width: icon.width, height: icon.height }}
        />
        <Text
          style={[
            styles.label,
            isPrimary ? styles.primaryLabel : styles.secondaryLabel,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: colors.primaryButtonFill,
    borderWidth: 1,
    borderColor: colors.primaryButtonBorder,
  },
  secondary: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.secondaryButtonFill,
  },
  label: {
    ...androidTextFix,
    ...Platform.select({ android: { textAlignVertical: 'center' as const } }),
    fontFamily: fonts.medium, // Figma: Inter Medium 16/24, letter spacing 0
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  primaryLabel: {
    color: colors.primary,
  },
  secondaryLabel: {
    color: colors.white,
  },
});
