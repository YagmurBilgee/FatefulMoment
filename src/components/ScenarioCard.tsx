import React from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Scenario } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma card tokens.
const CARD_WIDTH = 220;
const CARD_HEIGHT = 176;
const CARD_RADIUS = 16;
const CARD_PADDING = 14;

/*
 * Pending: the White House night artwork from Figma is not exported yet, so
 * every card uses the History & War export (@3x, 660×528) for now.
 */
const cardImage = require('../assets/images/card-history-war.png');

/*
 * Pending: stopwatch icon asset from Figma. The "⏱" emoji would render in
 * color on iOS, so a small outlined clock is drawn instead.
 */
function ClockIcon() {
  return (
    <View style={styles.clock}>
      <View style={styles.clockHand} />
    </View>
  );
}

function StartButton({
  scenarioTitle,
  disabled,
  onPress,
}: {
  scenarioTitle: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(disabled);
  return (
    <Animated.View style={[styles.startWrap, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Start ${scenarioTitle}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.start, disabled && styles.startDisabled]}
      >
        <Text style={[styles.startLabel, disabled && styles.startLabelOff]}>
          Start
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type ScenarioCardProps = {
  scenario: Scenario;
  onStart: () => void;
};

/**
 * Scenario card in the Home carousel: background artwork under a dark
 * overlay, duration at the top, title and description in the middle and a
 * Start pill bottom-right that is only enabled for playable scenarios.
 * Spacing inside the card is estimated.
 */
export function ScenarioCard({ scenario, onStart }: ScenarioCardProps) {
  return (
    // The shadow sits on an outer view: the card clips to its radius, which
    // would otherwise clip the shadow too.
    <View style={styles.shadow}>
      <View style={styles.card}>
        {/* ImageBackground is deprecated in RN 0.87; an absolute Image with
          cover does the same. */}
        <Image source={cardImage} resizeMode="cover" style={styles.image} />
        <View style={styles.overlay} />

        <View style={styles.tag}>
          <ClockIcon />
          <Text style={styles.duration}>{scenario.duration}</Text>
        </View>

        <View style={styles.body}>
          <Text
            style={styles.title}
            numberOfLines={2}
            accessibilityRole="header"
          >
            {scenario.title}
          </Text>
          <Text style={styles.description} numberOfLines={3}>
            {scenario.description}
          </Text>
        </View>

        <StartButton
          scenarioTitle={scenario.title}
          disabled={!scenario.playable}
          onPress={onStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: CARD_RADIUS,
    // Figma drop shadows.
    boxShadow:
      '0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    padding: CARD_PADDING,
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryButtonFill, // shown while the image loads
  },
  image: {
    // Explicit size: an absolute Image with only edge offsets keeps its
    // intrinsic pixel size on Android instead of filling the card.
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 24, 0.35)', // background @ 35%
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // est.
  },
  clock: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clockHand: {
    width: 1.5,
    height: 4,
    marginTop: 1.5,
    backgroundColor: colors.primary,
  },
  duration: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  body: {
    // Keeps the last description line clear of the Start pill.
    marginBottom: 32, // est.
    gap: 4, // est.
  },
  title: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 18, // est.
  },
  description: {
    ...androidTextFix,
    color: 'rgba(255, 255, 255, 0.7)', // est. — muted white
    fontFamily: fonts.regular, // est.
    fontSize: 11,
    lineHeight: 14, // est.
  },
  startWrap: {
    position: 'absolute',
    right: CARD_PADDING,
    bottom: CARD_PADDING,
  },
  start: {
    height: 26, // est.
    paddingHorizontal: 14, // est.
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  startDisabled: {
    borderColor: colors.placeholder,
    backgroundColor: 'rgba(98, 116, 142, 0.35)', // placeholder @ 35%, est.
  },
  startLabel: {
    ...androidTextFix,
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  startLabelOff: {
    color: colors.textSecondary,
  },
});
