import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LandscapeHeader,
  useLandscapePadding,
  MenuButton,
  NavigationDrawer,
  ScenarioCard,
} from '../components';
import { useTranslation } from '../context/LanguageContext';
import { Scenario, SCENARIOS } from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { useScenarioProgress } from '../state/ScenarioProgress';
import { colors } from '../theme/colors';
import { androidTextFix, fontSecondaryBold, fonts } from '../theme/typography';

const CARD_GAP = 16;
// Room below the 176pt cards so their drop shadow (20pt offset + 25pt blur
// - 5pt spread) is not clipped by the list.
const SHADOW_SPACE = 40;

// The two scenarios repeat to fill the carousel.
const CAROUSEL = [...SCENARIOS, ...SCENARIOS];

/**
 * Landscape Scenarios (Home V2) screen: header, then a horizontal carousel
 * of scenario cards. Only Iraq War is playable in the demo.
 */
export function ScenariosScreen({ navigation }: RootScreenProps<'Scenarios'>) {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const { completedScenarioIds } = useScenarioProgress();
  const { paddingLeft, paddingRight } = useLandscapePadding();
  const { t } = useTranslation();

  const showComingSoon = () =>
    Alert.alert(t('comingSoonTitle'), t('comingSoonMessage'));

  // Sign-in focus can outlive the auth screens on iOS and leave the
  // keyboard's AutoFill bar showing here; drop it whenever Home is shown.
  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
    }, []),
  );

  // Only the first card opens the simulation. The repeats that fill the
  // carousel show "coming soon" from Start or anywhere on the card, even
  // when they repeat a playable scenario.
  const isPlayable = (scenario: Scenario, index: number) =>
    index === 0 && scenario.playable;

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
            {t('scenariosTitle')}
          </Text>
          <Text style={styles.subtitle}>{t('scenariosSubtitle')}</Text>
          <Text style={styles.count}>{t('scenarioCount')}</Text>
        </View>

        <FlatList
          horizontal
          data={CAROUSEL}
          keyExtractor={(scenario, index) => `${scenario.id}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: CARD_GAP,
            // Same margin as the title block, so both share one left edge.
            paddingLeft,
            paddingRight,
            paddingBottom: SHADOW_SPACE,
          }}
          renderItem={({ item, index }) => {
            const playable = isPlayable(item, index);
            return (
              <ScenarioCard
                scenario={item}
                isCompleted={playable && completedScenarioIds.includes(item.id)}
                onStart={
                  playable
                    ? () =>
                        navigation.navigate('Simulation', {
                          scenarioId: item.id,
                        })
                    : showComingSoon
                }
                onCardPress={playable ? undefined : showComingSoon}
              />
            );
          }}
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
    marginTop: 16,
  },
  title: {
    ...androidTextFix,
    color: colors.screenTitle,
    fontFamily: fonts.bold, // 700
    fontSize: 20,
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fontSecondaryBold, // Helvetica Neue 700
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    marginBottom: 14,
  },
  count: {
    ...androidTextFix,
    color: colors.placeholder, // #62748E
    // Inter Black is not bundled; Bold is the heaviest face.
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 3, // to the card group
  },
});
