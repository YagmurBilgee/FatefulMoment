import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioStatusPill } from '../components/AudioStatusPill';
import { CategoryCard } from '../components/CategoryCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { CATEGORIES, isCategoryAvailable } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const CARD_GAP = 16; // Figma token
const SIDE_PADDING = 24;

// Figma copy; the total is a design figure, not derived from local data.
const SCENARIO_COUNT_LABEL = '30 Scenarios';

/**
 * Landscape Scenarios screen: header, then a horizontal carousel of category
 * cards. Only History & War is open in the demo.
 */
export function ScenariosScreen({ navigation }: RootScreenProps<'Scenarios'>) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  // In landscape the notch sits on one side; never go below the 24pt margin.
  const paddingLeft = Math.max(insets.left, SIDE_PADDING);
  const paddingRight = Math.max(insets.right, SIDE_PADDING);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingLeft, paddingRight }]}>
        {/* Pending: hamburger icon asset from Figma. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
          accessibilityState={{ expanded: menuOpen }}
          hitSlop={8}
          onPress={() => setMenuOpen(open => !open)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>≡</Text>
        </Pressable>
        <AudioStatusPill />
      </View>

      {/* Temporary menu; not in the Figma frames provided so far. */}
      {menuOpen ? (
        <View style={[styles.menu, { marginLeft: paddingLeft }]}>
          <PrimaryButton
            label="DNA Profile"
            onPress={() => {
              setMenuOpen(false);
              navigation.navigate('DnaProfile', {});
            }}
          />
          <PrimaryButton
            label="Sign Out"
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
            }
          />
        </View>
      ) : null}

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
            title={item.title}
            available={isCategoryAvailable(item.id)}
            onPress={() =>
              navigation.navigate('CategoryDetail', { categoryId: item.id })
            }
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  menuIcon: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 28,
    lineHeight: 32,
  },
  menu: {
    width: 220,
    marginTop: 12,
    gap: 12,
  },
  intro: {
    marginTop: 16, // est.
    marginBottom: 20, // est.
    gap: 4, // est.
  },
  title: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 24, // est.
    lineHeight: 30,
  },
  subtitle: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
  count: {
    ...androidTextFix,
    color: colors.textMuted,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
});
