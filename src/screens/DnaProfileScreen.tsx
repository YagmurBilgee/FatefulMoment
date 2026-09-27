import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MainScreenLayout } from '../components/MainScreenLayout';
import {
  BASELINE_DNA,
  DNA_DIMENSIONS,
  DNA_LABELS,
  DNA_MAX,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/**
 * Skeleton of the DNA profile: one plain View bar per dimension (no SVG).
 * The final visualization follows the landscape Figma frames.
 */
export function DnaProfileScreen({ route }: RootScreenProps<'DnaProfile'>) {
  const score = route.params.score ?? BASELINE_DNA;

  return (
    <MainScreenLayout title="DNA Profile" showBack>
      {route.params.score ? null : (
        <Text style={styles.note}>
          Play a scenario to build your profile. Showing the neutral baseline.
        </Text>
      )}

      <View style={styles.rows}>
        {DNA_DIMENSIONS.map(dimension => (
          <View
            key={dimension}
            style={styles.row}
            accessible
            accessibilityLabel={`${DNA_LABELS[dimension]} ${score[dimension]} of ${DNA_MAX}`}
          >
            <Text style={styles.label}>{DNA_LABELS[dimension]}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${(score[dimension] / DNA_MAX) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.value}>{score[dimension]}</Text>
          </View>
        ))}
      </View>
    </MainScreenLayout>
  );
}

const styles = StyleSheet.create({
  note: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  rows: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    ...androidTextFix,
    width: 72,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryButtonFill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  value: {
    ...androidTextFix,
    width: 32,
    textAlign: 'right',
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
