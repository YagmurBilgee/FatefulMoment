import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma card tokens.
export const CATEGORY_CARD_WIDTH = 220;
const CARD_HEIGHT = 176;
const CARD_RADIUS = 16;
const DISABLED_OPACITY = 0.4;

type CategoryCardProps = {
  title: string;
  available: boolean;
  onPress: () => void;
};

/**
 * Category card in the Scenarios carousel. Unavailable categories are
 * grayscale, dimmed, badged "Soon" and not pressable.
 *
 * Pending: category artwork from Figma; cards use flat fills until then.
 */
export function CategoryCard({ title, available, onPress }: CategoryCardProps) {
  const press = usePressScale(!available);
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={available ? title : `${title}, coming soon`}
        accessibilityState={{ disabled: !available }}
        disabled={!available}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.card, available ? styles.active : styles.locked]}
      >
        {available ? null : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Soon</Text>
          </View>
        )}
        <Text
          style={[styles.title, !available && styles.titleLocked]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CATEGORY_CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 16, // est.
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryButtonFill,
  },
  locked: {
    opacity: DISABLED_OPACITY,
    borderColor: colors.placeholder,
    backgroundColor: colors.secondaryButtonFill,
  },
  badge: {
    position: 'absolute',
    top: 12, // est.
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.placeholder,
  },
  badgeText: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold, // est.
    fontSize: 11,
    lineHeight: 14,
  },
  title: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold, // est.
    fontSize: 18,
    lineHeight: 24,
  },
  titleLocked: {
    color: colors.textSecondary,
  },
});
