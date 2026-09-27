import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Scenario } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Same Figma tokens as the category cards.
const CARD_WIDTH = 220;
const CARD_HEIGHT = 176;
const CARD_RADIUS = 16;
const DISABLED_OPACITY = 0.35;

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
 * Scenario card in a category carousel. Unplayable scenarios are dimmed,
 * tagged "Soon" and their Start button is disabled. Inner spacing and type
 * sizes are estimates.
 */
export function ScenarioCard({ scenario, onStart }: ScenarioCardProps) {
  const { playable } = scenario;
  return (
    <View style={[styles.card, playable ? styles.active : styles.locked]}>
      {playable && scenario.duration ? (
        <View style={styles.tag}>
          <ClockIcon />
          <Text style={styles.duration}>{scenario.duration}</Text>
        </View>
      ) : (
        <View style={[styles.tag, styles.soon]}>
          <Text style={styles.soonText}>Soon</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {scenario.title}
      </Text>
      {scenario.summary ? (
        <Text style={styles.summary} numberOfLines={3}>
          {scenario.summary}
        </Text>
      ) : null}

      <StartButton
        scenarioTitle={scenario.title}
        disabled={!playable}
        onPress={onStart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    padding: 16, // est.
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
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 16,
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
    fontFamily: fonts.medium, // est.
    fontSize: 12,
    lineHeight: 16,
  },
  soon: {
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.placeholder,
  },
  soonText: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold, // est.
    fontSize: 11,
    lineHeight: 16,
  },
  title: {
    ...androidTextFix,
    marginTop: 8, // est.
    color: colors.white,
    fontFamily: fonts.bold, // est.
    fontSize: 18,
    lineHeight: 24,
  },
  summary: {
    ...androidTextFix,
    marginTop: 4, // est.
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 12,
    lineHeight: 16,
  },
  startWrap: {
    position: 'absolute',
    right: 16, // est.
    bottom: 16,
  },
  start: {
    height: 28, // est.
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  startDisabled: {
    backgroundColor: colors.placeholder,
  },
  startLabel: {
    ...androidTextFix,
    color: colors.background,
    fontFamily: fonts.semiBold, // est.
    fontSize: 13,
    lineHeight: 16,
  },
  startLabelOff: {
    color: colors.textSecondary,
  },
});
