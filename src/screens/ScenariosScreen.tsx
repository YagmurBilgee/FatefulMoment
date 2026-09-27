import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MainScreenLayout } from '../components/MainScreenLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { CATEGORIES, SCENARIOS } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/**
 * Skeleton of the Scenarios screen: lists every category with its scenarios.
 * The horizontal landscape layout from Figma replaces this later.
 */
export function ScenariosScreen({
  navigation,
  route,
}: RootScreenProps<'Scenarios'>) {
  const { user } = route.params;

  return (
    <MainScreenLayout title="Scenarios">
      <Text style={styles.greeting}>Welcome back, {user.name}</Text>

      {CATEGORIES.map(category => (
        <View key={category.id} style={styles.category}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {SCENARIOS.filter(s => s.categoryId === category.id).map(scenario => (
            <Pressable
              key={scenario.id}
              accessibilityRole="button"
              accessibilityLabel={scenario.title}
              accessibilityState={{ disabled: !scenario.playable }}
              disabled={!scenario.playable}
              onPress={() =>
                navigation.navigate('Simulation', {
                  scenarioId: scenario.id,
                })
              }
              style={[styles.card, !scenario.playable && styles.cardLocked]}
            >
              <Text style={styles.cardTitle}>{scenario.title}</Text>
              {scenario.playable ? (
                <Text style={styles.cardRole}>{scenario.role}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ))}

      <PrimaryButton
        label="DNA Profile"
        onPress={() => navigation.navigate('DnaProfile', {})}
      />
      <PrimaryButton
        label="Sign Out"
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        }
      />
    </MainScreenLayout>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  category: {
    gap: 8,
  },
  categoryTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.secondaryButtonFill,
  },
  cardLocked: {
    opacity: 0.5,
  },
  cardTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  cardRole: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
