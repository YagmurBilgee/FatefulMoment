import React from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Category, CategoryId } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma card tokens.
export const CATEGORY_CARD_WIDTH = 220;
const CARD_HEIGHT = 176;
const CARD_RADIUS = 16;
const DISABLED_OPACITY = 0.4;
const ICON_SIZE = 16;

type CategoryArt = {
  /** Figma @3x export. */
  image: ImageSourcePropType;
  /**
   * Point width of the export when it is narrower than the card. The Science
   * export is only the 60pt strip visible in the Figma frame, so it is drawn
   * at that width on the left instead of being stretched (and blurred).
   */
  imageWidth?: number;
  icon: ImageSourcePropType;
};

const ART: Record<CategoryId, CategoryArt> = {
  'history-war': {
    image: require('../assets/images/card-history-war.png'),
    icon: require('../assets/images/icon-category-history.png'),
  },
  'business-world': {
    image: require('../assets/images/card-business-world.png'),
    icon: require('../assets/images/icon-category-business.png'),
  },
  'crisis-security': {
    image: require('../assets/images/card-crisis-security.png'),
    icon: require('../assets/images/icon-category-crisis.png'),
  },
  science: {
    image: require('../assets/images/card-science.png'),
    imageWidth: 180 / 3,
    icon: require('../assets/images/icon-category-science.png'),
  },
};

type CategoryCardProps = {
  category: Category;
  available: boolean;
  onPress: () => void;
};

/**
 * Category card in the Scenarios carousel: Figma artwork, a dark overlay for
 * legible text, then the icon + scenario count and the title at the bottom.
 * Unavailable categories are dimmed, badged "Soon" and not pressable.
 */
export function CategoryCard({
  category,
  available,
  onPress,
}: CategoryCardProps) {
  const press = usePressScale(!available);
  const art = ART[category.id];
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          available ? category.title : `${category.title}, coming soon`
        }
        accessibilityState={{ disabled: !available }}
        disabled={!available}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.card, !available && styles.locked]}
      >
        {/* ImageBackground is deprecated in RN 0.87; an absolute Image with
            cover does the same. */}
        <Image
          source={art.image}
          resizeMode="cover"
          style={[
            styles.image,
            art.imageWidth ? { width: art.imageWidth } : null,
          ]}
        />
        {/* The exports already fade to dark at the bottom; this evens out
            bright areas so the white and cyan text stays crisp. */}
        <View style={styles.overlay} />

        {available ? null : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Soon</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.countRow}>
            <Image source={art.icon} style={styles.icon} resizeMode="contain" />
            <Text style={styles.count}>{category.scenarioCountLabel}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {category.title}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CATEGORY_CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.secondaryButtonFill,
  },
  locked: {
    opacity: DISABLED_OPACITY,
  },
  image: {
    // Explicit size: an absolute Image with only edge offsets keeps its
    // intrinsic pixel size on Android instead of filling the card.
    position: 'absolute',
    top: 0,
    left: 0,
    width: CATEGORY_CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 24, 0.25)', // est. — background @ 25%
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
  info: {
    padding: 16, // est.
    gap: 4, // est.
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // est.
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  // Typography below is from Figma inspect. Figma uses Inter 900 (Black),
  // and Black Italic for the title; neither face is bundled yet, so Bold
  // upright stands in (iOS cannot synthesize italic for a custom font).
  count: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    ...androidTextFix,
    color: colors.cardTitle,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 20,
  },
});
