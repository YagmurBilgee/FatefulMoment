import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MainScreenLayout } from '../components/MainScreenLayout';
import { CATEGORIES, scenariosIn } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/**
 * Skeleton of a category's scenario list (e.g. History & War -> Apollo 13).
 * The final layout follows the Figma category detail frame.
 */
export function CategoryDetailScreen({
  navigation,
  route,
}: RootScreenProps<'CategoryDetail'>) {
  const category = CATEGORIES.find(c => c.id === route.params.categoryId);
  const scenarios = scenariosIn(route.params.categoryId).filter(
    s => s.playable,
  );

  return (
    <MainScreenLayout title={category?.title ?? 'Scenarios'} showBack>
      {scenarios.map(scenario => (
        <Pressable
          key={scenario.id}
          accessibilityRole="button"
          accessibilityLabel={scenario.title}
          onPress={() =>
            navigation.navigate('Simulation', { scenarioId: scenario.id })
          }
          style={styles.card}
        >
          <Text style={styles.cardTitle}>{scenario.title}</Text>
          <Text style={styles.cardRole}>{scenario.role}</Text>
        </Pressable>
      ))}
    </MainScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    minWidth: 220,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryButtonFill,
  },
  cardTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
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
