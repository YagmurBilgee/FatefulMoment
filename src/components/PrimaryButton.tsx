import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from '../hooks';

// Measured: the disabled frame matches the active one at ~35% opacity.
const DISABLED_OPACITY = 0.35; // est.

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner in place of the label and blocks presses. */
  loading?: boolean;
};

/**
 * Cyan primary action (Sign In, Sign up, Back to Sign in). Fill and border
 * reuse the Welcome "Continue with Email" button values, which are measured
 * estimates. The loading state is not drawn in Figma.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;
  const press = usePressScale(inactive);
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.button, disabled && !loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryButtonBorder,
    backgroundColor: colors.primaryButtonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  label: {
    ...androidTextFix,
    ...Platform.select({ android: { textAlignVertical: 'center' as const } }),
    color: colors.primary,
    // est.: same as the verified Welcome button labels (Inter Medium 16/24);
    // the Sign In frame measures closer to 15.
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
});
