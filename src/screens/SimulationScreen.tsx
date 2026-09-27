import React, { useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { usePressScale } from '../components/usePressScale';
import {
  applyImpacts,
  BASELINE_DNA,
  DecisionOption,
  DnaImpact,
  findScenario,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const COLUMN_GAP = 24; // est.

function OptionCard({
  option,
  onPress,
}: {
  option: DecisionOption;
  onPress: () => void;
}) {
  const press = usePressScale();
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={option.label}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.option}
      >
        <Text style={styles.optionLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Landscape simulation: briefing and the current decision on the left, its
 * options on the right. Both columns scroll on their own if a device is too
 * short, so nothing is clipped. After the last decision the DNA profile
 * replaces this screen, so Back from the profile returns to the category.
 *
 * Layout values are estimates until the simulation Figma frame is provided.
 */
export function SimulationScreen({
  navigation,
  route,
}: RootScreenProps<'Simulation'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const scenario = findScenario(route.params.scenarioId);
  const [impacts, setImpacts] = useState<DnaImpact[]>([]);

  const header = (title: string) => (
    <LandscapeHeader
      left={
        <>
          <BackButton />
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
        </>
      }
    />
  );

  if (!scenario || !scenario.playable) {
    return (
      <View style={styles.root}>
        {header('Scenario unavailable')}
        <Text style={[styles.body, styles.unavailable, padding]}>
          This scenario is coming soon.
        </Text>
      </View>
    );
  }

  const step = impacts.length;
  const decision = scenario.decisions[step];

  const choose = (impact: DnaImpact) => {
    const next = [...impacts, impact];
    if (next.length < scenario.decisions.length) {
      setImpacts(next);
      return;
    }
    navigation.replace('DnaProfile', {
      score: applyImpacts(BASELINE_DNA, next),
    });
  };

  const columnPadding = { paddingTop: 20, paddingBottom: insets.bottom + 16 };

  return (
    <View style={styles.root}>
      {header(scenario.title)}

      <View style={[styles.columns, padding]}>
        <ScrollView
          style={styles.briefing}
          contentContainerStyle={[styles.briefingContent, columnPadding]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.meta}>
            {scenario.role} · Decision {step + 1} of {scenario.decisions.length}
          </Text>
          {step === 0 ? (
            <Text style={styles.body}>{scenario.briefing}</Text>
          ) : null}
          <Text style={styles.decisionTitle} accessibilityRole="header">
            {decision.title}
          </Text>
          <Text style={styles.body}>{decision.situation}</Text>
          <Text style={styles.prompt}>{decision.prompt}</Text>
        </ScrollView>

        <ScrollView
          style={styles.options}
          contentContainerStyle={[styles.optionsContent, columnPadding]}
          showsVerticalScrollIndicator={false}
        >
          {decision.options.map(option => (
            <OptionCard
              key={option.id}
              option={option}
              onPress={() => choose(option.impact)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...androidTextFix,
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20, // est.
    lineHeight: 25,
  },
  unavailable: {
    marginTop: 24,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },
  briefing: {
    flex: 1,
  },
  briefingContent: {
    gap: 8,
  },
  options: {
    flex: 1,
  },
  optionsContent: {
    gap: 12,
  },
  meta: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.medium, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  decisionTitle: {
    ...androidTextFix,
    marginTop: 4,
    color: colors.white,
    fontFamily: fonts.bold, // est.
    fontSize: 20,
    lineHeight: 25,
  },
  body: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
  prompt: {
    ...androidTextFix,
    marginTop: 4,
    color: colors.white,
    fontFamily: fonts.semiBold, // est.
    fontSize: 15,
    lineHeight: 22,
  },
  option: {
    paddingVertical: 12, // est.
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryButtonBorder,
    backgroundColor: colors.primaryButtonFill,
  },
  optionLabel: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
});
