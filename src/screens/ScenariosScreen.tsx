import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { MenuButton } from '../components/MenuButton';
import { NavigationDrawer } from '../components/NavigationDrawer';
import { ScenarioCard } from '../components/ScenarioCard';
import { SCENARIOS } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const CARD_GAP = 16; // Figma token
// Figma: the card group starts 66pt from the left screen edge.
const CAROUSEL_LEFT = 66;
// Room below the 176pt cards so their drop shadow (20pt offset + 25pt blur
// - 5pt spread) is not clipped by the list.
const SHADOW_SPACE = 40;

// Figma copy; the total is a design figure, not derived from local data.
const SCENARIO_COUNT_LABEL = '30 Scenarios';

// Figma Home V2 repeats the two scenarios to fill the carousel.
const CAROUSEL = [...SCENARIOS, ...SCENARIOS];

/**
 * Landscape Scenarios (Home V2) screen: header, then a horizontal carousel
 * of scenario cards. Only Iraq War is playable in the demo.
 */
export function ScenariosScreen({ navigation }: RootScreenProps<'Scenarios'>) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const { paddingLeft, paddingRight } = useLandscapePadding();
  // Never closer to the edge than the notch-aware screen margin.
  const carouselLeft = Math.max(paddingLeft, CAROUSEL_LEFT);

  return (
    <View style={styles.root}>
      <LandscapeHeader
        left={
          <MenuButton expanded={menuOpen} onPress={() => setMenuOpen(true)} />
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.intro, { paddingLeft, paddingRight }]}>
          <Text style={styles.title} accessibilityRole="header">
            Scenarios
          </Text>
          <Text style={styles.subtitle}>
            Choose A Scenario And Ask Yourself, "If You Were In That Situation,
            What Would You Do?"
          </Text>
          <Text style={styles.count}>{SCENARIO_COUNT_LABEL}</Text>
        </View>

        <FlatList
          horizontal
          data={CAROUSEL}
          keyExtractor={(scenario, index) => `${scenario.id}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: CARD_GAP,
            paddingLeft: carouselLeft,
            paddingRight,
            paddingBottom: SHADOW_SPACE,
          }}
          renderItem={({ item }) => (
            <ScenarioCard
              scenario={item}
              onStart={() =>
                navigation.navigate('Simulation', { scenarioId: item.id })
              }
            />
          )}
        />
      </ScrollView>

      <NavigationDrawer
        visible={menuOpen}
        activeRoute="SCENARIOS"
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    marginTop: 16, // est.
  },
  // Typography below is from Figma inspect.
  title: {
    ...androidTextFix,
    color: colors.screenTitle,
    fontFamily: fonts.bold, // 700
    fontSize: 20,
    lineHeight: 20,
    marginBottom: 4, // est.
  },
  subtitle: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold, // 700
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
    marginBottom: 14,
  },
  count: {
    ...androidTextFix,
    color: colors.placeholder, // #62748E
    // Figma: 900 (Black). Inter Black is not bundled yet; Bold is the
    // heaviest face available.
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 3, // to the card group
  },
});
