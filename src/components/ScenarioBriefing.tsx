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

import type { Scenario } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma "Scenario Container": 728×292, about 90% of the 812pt frame.
const CARD_MAX_WIDTH = 728;
const CARD_HEIGHT = 292;

// Figma @3x exports, full landscape frame (2436×1125). Scenarios without
// one fall back to the plain background. The simulation reuses them as its
// scene.
export const BRIEFING_IMAGES: Record<string, ImageSourcePropType> = {
  'iraq-war': require('../assets/images/briefing-iraq-war.png'),
};

type ScenarioBriefingProps = {
  scenario: Scenario;
  onStart: () => void;
};

/**
 * Scenario briefing card (Figma "Scenario Container", 728×292): background
 * artwork under a bottom-up gradient, with the tag, title, description and
 * Start Simulation button centered on top. Values are from Figma inspect.
 */
export function ScenarioBriefing({ scenario, onStart }: ScenarioBriefingProps) {
  const press = usePressScale();
  const image = BRIEFING_IMAGES[scenario.id];
  return (
    <View style={styles.card}>
      {/* ImageBackground is deprecated in RN 0.87; an absolute Image with
          cover does the same. */}
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.image} />
      ) : null}
      <View style={styles.gradient} />

      <View style={styles.content}>
        <Text style={styles.tag}>Scenario Briefing</Text>
        <Text style={styles.title} accessibilityRole="header">
          {scenario.title}
        </Text>
        <Text style={styles.description}>{scenario.description}</Text>

        <Animated.View style={press.style}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start Simulation"
            onPress={onStart}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            style={styles.start}
          >
            <Text style={styles.startLabel} numberOfLines={1}>
              Start Simulation
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '90%',
    maxWidth: CARD_MAX_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder, // #1D293D
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: colors.secondaryButtonFill, // shown while loading
  },
  // No padding on the card: Android sizes the absolute image's percentages
  // against the card's content box, so padding would leave a gap.
  content: {
    alignItems: 'center',
    paddingHorizontal: 24, // est.
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  // Figma: bottom-up gradient over the artwork.
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'linear-gradient(0deg, #020618 0%, rgba(2, 6, 24, 0.4) 50%, rgba(0, 0, 0, 0) 100%)',
  },
  tag: {
    ...androidTextFix,
    marginBottom: 4,
    color: colors.primary, // #00D3F3
    fontFamily: fonts.bold, // 700
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    ...androidTextFix,
    marginBottom: 16,
    color: colors.cardTitle, // #F8FAFC
    // Figma: 900 italic. Neither Inter Black nor an italic face is bundled,
    // and iOS cannot synthesize italic for a custom font, so Bold upright
    // stands in.
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    ...androidTextFix,
    marginBottom: 24,
    maxWidth: 497,
    color: colors.screenTitle, // #E2E8F0
    fontFamily: fonts.regular, // 400
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Figma: 179×48 with 12/24 padding around a 131pt label. RN draws the
  // 1pt border inside the box, so that padding would squeeze the label;
  // a fixed box with the label centered gives the same result.
  start: {
    width: 179,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 211, 243, 0.4)', // #00D3F3 @ 40%
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 184, 219, 0.14)', // #00B8DB24
  },
  startLabel: {
    ...androidTextFix,
    color: colors.primary, // #00D3F3
    // Figma: Inter 900. Inter Black is not bundled; Bold is the heaviest.
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
  },
});
