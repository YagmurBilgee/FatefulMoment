import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { ScenarioCard } from '../components/ScenarioCard';
import { CATEGORIES, scenariosIn } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const CARD_GAP = 16; // Figma token

/**
 * Landscape list of a category's scenarios (History & War -> Apollo 13).
 * Only playable scenarios can be started.
 */
export function CategoryDetailScreen({
  navigation,
  route,
}: RootScreenProps<'CategoryDetail'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const category = CATEGORIES.find(c => c.id === route.params.categoryId);

  return (
    <View style={styles.root}>
      <LandscapeHeader
        left={
          <>
            <BackButton />
            <Text
              style={styles.title}
              numberOfLines={1}
              accessibilityRole="header"
            >
              {category?.title ?? 'Scenarios'}
            </Text>
          </>
        }
      />

      <FlatList
        horizontal
        data={scenariosIn(route.params.categoryId)}
        keyExtractor={scenario => scenario.id}
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          padding,
          { paddingBottom: insets.bottom + 16 },
        ]}
        renderItem={({ item }) => (
          <ScenarioCard
            scenario={item}
            onStart={() =>
              navigation.navigate('Simulation', { scenarioId: item.id })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...androidTextFix,
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20, // est.
    lineHeight: 25,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: CARD_GAP,
    paddingTop: 24, // est.
  },
});
