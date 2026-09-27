import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MainScreenLayout } from '../components/MainScreenLayout';
import {
  applyImpacts,
  BASELINE_DNA,
  DnaImpact,
  findScenario,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/**
 * Skeleton of the simulation: briefing, then one decision at a time. After
 * the last decision the resulting DNA score opens on the profile screen.
 */
export function SimulationScreen({
  navigation,
  route,
}: RootScreenProps<'Simulation'>) {
  const scenario = findScenario(route.params.scenarioId);
  const [impacts, setImpacts] = useState<DnaImpact[]>([]);

  if (!scenario || !scenario.playable) {
    return (
      <MainScreenLayout title="Scenario unavailable" showBack>
        <Text style={styles.body}>This scenario is coming soon.</Text>
      </MainScreenLayout>
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

  return (
    <MainScreenLayout title={scenario.title} showBack>
      <Text style={styles.meta}>{scenario.role}</Text>
      {step === 0 ? <Text style={styles.body}>{scenario.briefing}</Text> : null}

      <View style={styles.decision}>
        <Text style={styles.meta}>
          Decision {step + 1} of {scenario.decisions.length}
        </Text>
        <Text style={styles.decisionTitle} accessibilityRole="header">
          {decision.title}
        </Text>
        <Text style={styles.body}>{decision.situation}</Text>
        <Text style={styles.prompt}>{decision.prompt}</Text>
      </View>

      <View style={styles.options}>
        {decision.options.map(option => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() => choose(option.impact)}
            style={styles.option}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    </MainScreenLayout>
  );
}

const styles = StyleSheet.create({
  meta: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  decision: {
    gap: 8,
  },
  decisionTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
  },
  prompt: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryButtonBorder,
    backgroundColor: colors.primaryButtonFill,
  },
  optionLabel: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});
