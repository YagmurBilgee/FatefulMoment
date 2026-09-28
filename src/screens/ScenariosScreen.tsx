import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryCard } from '../components/CategoryCard';
import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { MenuButton } from '../components/MenuButton';
import { NavigationDrawer } from '../components/NavigationDrawer';
import { CATEGORIES, isCategoryAvailable } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const CARD_GAP = 16; // Figma token

// Figma copy; the total is a design figure, not derived from local data.
const SCENARIO_COUNT_LABEL = '30 Scenarios';

/**
 * Landscape Scenarios screen: header, then a horizontal carousel of category
 * cards. Only History & War is open in the demo.
 */
export function ScenariosScreen({ navigation }: RootScreenProps<'Scenarios'>) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const { paddingLeft, paddingRight } = useLandscapePadding();

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
          data={CATEGORIES}
          keyExtractor={category => category.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: CARD_GAP,
            paddingLeft,
            paddingRight,
          }}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              available={isCategoryAvailable(item.id)}
              onPress={() =>
                navigation.navigate('CategoryDetail', { categoryId: item.id })
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
    marginBottom: 20, // est.
    gap: 4, // est.
  },
  // Typography below is from Figma inspect.
  title: {
    ...androidTextFix,
    color: colors.screenTitle,
    fontFamily: fonts.bold, // 700
    fontSize: 20,
    lineHeight: 20,
  },
  subtitle: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold, // 700
    fontSize: 12,
    lineHeight: 16,
  },
  count: {
    ...androidTextFix,
    color: colors.placeholder, // #62748E
    // Figma: 900 (Black). Inter Black is not bundled yet; Bold is the
    // heaviest face available.
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
});
