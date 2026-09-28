import React from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import type { Scenario } from '../data/simulation';
import { colors } from '../theme/colors';
import { androidTextFix, fontSecondaryBold, fonts } from '../theme/typography';
import { usePressScale } from './usePressScale';

// Figma card tokens.
const CARD_WIDTH = 220;
const CARD_HEIGHT = 176;
const CARD_RADIUS = 16;
const CARD_BORDER = 1;
// Distances below are from the card's outer edge. Padding and absolute
// offsets are measured inside the border, so the border is subtracted.
const CONTENT_TOP = 28;
const CONTENT_SIDE = 16;
const START_INSET = 14;
const START_HEIGHT = 32;
/*
 * Vertical rhythm, tightened so a 4-line description still clears Start:
 * 28 + 11 (duration) + 5 + 16 (title) + 3 + 64 (4 lines) = 127pt, and Start
 * begins at 176 - 14 - 32 = 130pt.
 */
const DURATION_GAP = 5;
const TITLE_GAP = 3;
const COMPLETED_OPACITY = 0.35;

// Figma video first-frame poster (White House at night), @3x 660×528.
// Home V2 uses it for every scenario card.
const cardImage = require('../assets/images/card-white-house.png');

// Figma @3x export, 33×30px; tinted cyan.
const clockIcon = require('../assets/images/icon-scenario-clock.png');

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
  const { t } = useTranslation();
  return (
    <Animated.View style={[styles.startWrap, press.style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('startScenario', { title: scenarioTitle })}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.start, disabled && styles.startDisabled]}
      >
        <Text style={[styles.startLabel, disabled && styles.startLabelOff]}>
          {t('start')}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type ScenarioCardProps = {
  scenario: Scenario;
  /** Played to the end this session: dimmed, Start disabled. */
  isCompleted: boolean;
  onStart: () => void;
  /** Makes the whole card tappable, e.g. for "coming soon" feedback. */
  onCardPress?: () => void;
};

/**
 * Scenario card in the Home carousel: background artwork under a dark
 * gradient, then duration, title and description stacked from the top, and
 * a Start pill bottom-right. Completed scenarios are dimmed, their duration
 * turns gray and Start is disabled. Values are from Figma inspect.
 */
export function ScenarioCard({
  scenario,
  isCompleted,
  onStart,
  onCardPress,
}: ScenarioCardProps) {
  const { localize } = useTranslation();
  const title = localize(scenario.title);
  return (
    // The shadow sits on an outer view: the card clips to its radius, which
    // would otherwise clip the shadow too.
    <View style={[styles.shadow, isCompleted && styles.completed]}>
      <Pressable
        accessible={Boolean(onCardPress)}
        accessibilityRole={onCardPress ? 'button' : undefined}
        accessibilityLabel={title}
        disabled={!onCardPress}
        onPress={onCardPress}
        style={styles.card}
      >
        {/* ImageBackground is deprecated in RN 0.87; an absolute Image with
          cover does the same. */}
        <Image source={cardImage} resizeMode="cover" style={styles.image} />
        <View style={styles.gradient} />

        <View style={styles.tag}>
          <Image
            source={clockIcon}
            resizeMode="contain"
            style={[styles.clock, isCompleted && styles.clockOff]}
          />
          <Text style={[styles.duration, isCompleted && styles.durationOff]}>
            {localize(scenario.duration)}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={4}>
          {localize(scenario.description)}
        </Text>

        <StartButton
          scenarioTitle={title}
          disabled={isCompleted}
          onPress={onStart}
        />
      </Pressable>
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
  completed: {
    opacity: COMPLETED_OPACITY,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: CARD_BORDER,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    paddingTop: CONTENT_TOP - CARD_BORDER,
    paddingHorizontal: CONTENT_SIDE - CARD_BORDER,
    backgroundColor: colors.secondaryButtonFill, // shown while the image loads
  },
  image: {
    // Explicit size: an absolute Image with only edge offsets keeps its
    // intrinsic pixel size on Android instead of filling the card.
    position: 'absolute',
    top: -CARD_BORDER,
    left: -CARD_BORDER,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  // Figma overlay: solid background at the bottom, 60% midway, clear at
  // the top. Stop positions are est.
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundImage:
      'linear-gradient(0deg, #020618 0%, rgba(2, 6, 24, 0.6) 50%, rgba(0, 0, 0, 0) 100%)',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: DURATION_GAP,
  },
  clock: {
    width: 11,
    height: 11,
    tintColor: colors.primary,
  },
  clockOff: {
    tintColor: colors.placeholder, // #62748E
  },
  duration: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fontSecondaryBold, // Helvetica Neue 700
    fontSize: 8,
    lineHeight: 11,
  },
  durationOff: {
    color: colors.placeholder, // #62748E
  },
  title: {
    ...androidTextFix,
    marginBottom: TITLE_GAP,
    color: colors.cardTitle, // #F8FAFC
    // Figma: 900 italic. Neither Inter Black nor an italic face is bundled,
    // and iOS cannot synthesize italic for a custom font, so Bold upright
    // stands in.
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  description: {
    ...androidTextFix,
    maxWidth: 188,
    color: colors.screenTitle, // #E2E8F0
    fontFamily: fonts.regular, // 400
    fontSize: 12,
    lineHeight: 16,
  },
  startWrap: {
    position: 'absolute',
    right: START_INSET - CARD_BORDER,
    bottom: START_INSET - CARD_BORDER,
  },
  start: {
    width: 62,
    height: START_HEIGHT,
    borderRadius: START_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 211, 243, 0.4)', // #00D3F3 @ 40%
    justifyContent: 'center',
    backgroundColor: colors.primaryButtonFill, // #00D3F324
  },
  startDisabled: {
    borderColor: 'transparent',
    backgroundColor: 'rgba(15, 23, 43, 0.6)', // #0F172B @ 60%
  },
  startLabel: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold, // 700
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  startLabelOff: {
    color: colors.placeholder, // #62748E
  },
});
