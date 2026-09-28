import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import type { DecisionOption } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

type DecisionCardProps = {
  option: DecisionOption;
  selected: boolean;
  /** Another option was picked; this one fades back and stops responding. */
  dimmed: boolean;
  onPress: () => void;
};

/**
 * Decision option card: dark translucent card with a thin border that
 * glows cyan while pressed or once selected. Values are estimates until the
 * decision Figma frame is inspected.
 */
export function DecisionCard({
  option,
  selected,
  dimmed,
  onPress,
}: DecisionCardProps) {
  const press = usePressScale(dimmed);
  return (
    <Animated.View style={[press.style, dimmed && styles.dimmed]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected, disabled: dimmed }}
        disabled={dimmed}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [
          styles.card,
          (pressed || selected) && styles.active,
        ]}
      >
        <Text style={styles.label} numberOfLines={3}>
          {option.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76, // est. fits three lines
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.decisionCardBorder,
    backgroundColor: colors.decisionCardFill,
    justifyContent: 'center',
  },
  active: {
    borderColor: colors.primary, // #00D3F3
    backgroundImage:
      'linear-gradient(135deg, rgba(0, 211, 243, 0.3) 0%, rgba(0, 211, 243, 0.08) 100%)',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  dimmed: {
    opacity: 0.4,
  },
  label: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.medium, // est.
    fontSize: 13,
    lineHeight: 18,
  },
});
