import React from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import type { DecisionOption } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma "Option Card": 345×66, 8/16 padding, label box up to 309pt.
const CARD_WIDTH = 345;
const CARD_HEIGHT = 66;
const LABEL_MAX_WIDTH = 309;

type DecisionCardProps = {
  option: DecisionOption;
  selected: boolean;
  /** Another option was picked; this one fades back and stops responding. */
  dimmed: boolean;
  onPress: () => void;
};

/**
 * Decision option card (Figma "Option Card"): translucent navy with a thin
 * border lit along the top edge. While pressed or once selected it takes
 * the Figma cyan glow: a navy → cyan → navy gradient, cyan border and a
 * soft cyan shadow. Values are from Figma inspect.
 */
export function DecisionCard({
  option,
  selected,
  dimmed,
  onPress,
}: DecisionCardProps) {
  const press = usePressScale(dimmed);
  return (
    // The wrapper holds the width so a row can shrink on narrow phones.
    <Animated.View
      style={[styles.wrapper, press.style, dimmed && styles.dimmed]}
    >
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
  wrapper: {
    width: CARD_WIDTH,
    flexShrink: 1,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.optionCardBorder, // #F8FAFC @ 20%
    borderTopColor: colors.optionCardBorderTop, // #F8FAFC
    backgroundColor: colors.optionCardFill, // #0F172BA1
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma selected fill. RN draws CSS gradients natively, so no gradient
  // package is needed.
  active: {
    borderColor: colors.primary, // #00D3F3
    borderTopColor: colors.primary,
    backgroundColor: 'transparent', // the gradient replaces the fill
    backgroundImage:
      'linear-gradient(90deg, rgba(15, 23, 43, 0.63) 0%, rgba(0, 211, 243, 0.63) 50%, rgba(15, 23, 43, 0.63) 100%)',
    shadowColor: colors.primary,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  dimmed: {
    opacity: 0.4,
  },
  // Figma caption01. Inter-Medium carries the 500 weight; the project does
  // not combine custom faces with fontWeight.
  label: {
    ...androidTextFix,
    maxWidth: LABEL_MAX_WIDTH,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});
