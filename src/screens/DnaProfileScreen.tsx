import React, { ReactNode, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { MenuButton } from '../components/MenuButton';
import { NavigationDrawer } from '../components/NavigationDrawer';
import {
  BASELINE_DNA,
  DNA_DIMENSIONS,
  DNA_LABELS,
  DNA_MAX,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/*
 * Copy for the archetype, pattern and blind-spot cards, from the Figma frame.
 * It is static for the demo and not derived from the score yet.
 */
const ARCHETYPE = 'BOLD_VISIONARY';
const ARCHETYPE_QUOTE = 'You see the big picture and walk towards it...';
const PATTERNS = [
  'You are not afraid to take action under pressure. While others hesitate, you have already taken a step. This positions you as a natural leader in crisis moments.',
  'You prioritize long-term impact over short-term costs. You see the big picture — but this sometimes makes it difficult for you to see the people in front of you.',
  'When ethics conflict with interests, your tendency is clear: you choose the interest. This pattern repeated in 5 out of 8 scenarios. It works in the short term — but creates erosion of trust in the long term.',
];
const BLIND_SPOT_DIMENSION = 'ETHICS';
const BLIND_SPOT_QUESTION = 'How much will you pay to win?';
const BLIND_SPOT_BODY =
  'Your vision and courage are strong — but your ethics score is your lowest dimension. While reaching big goals, you often overlook how those around you feel and what they sacrifice. Your leadership capacity is high, but the mark you leave is not always positive.';

const COLUMN_GAP = 16; // est.

function Card({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>{children}</View>
  );
}

function SectionLabel({
  children,
  color,
}: {
  children: string;
  color?: string;
}) {
  return (
    <Text style={[styles.sectionLabel, color ? { color } : null]}>
      {children}
    </Text>
  );
}

/**
 * Landscape DNA profile: archetype and psychological matrix on the left,
 * pattern detection and blind spot on the right. Each column scrolls on its
 * own so nothing is clipped on short landscape screens. Bars are plain Views.
 *
 * Card spacing and type sizes are estimates.
 */
export function DnaProfileScreen({ route }: RootScreenProps<'DnaProfile'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const score = route.params.score ?? BASELINE_DNA;
  const columnPadding = { paddingTop: 12, paddingBottom: insets.bottom + 12 };
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <LandscapeHeader
        left={
          <>
            <MenuButton expanded={menuOpen} onPress={() => setMenuOpen(true)} />
            <Text style={styles.headerTitle} accessibilityRole="header">
              DNA
            </Text>
          </>
        }
      />

      <View style={[styles.columns, padding]}>
        <ScrollView
          style={styles.column}
          contentContainerStyle={[styles.columnContent, columnPadding]}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <SectionLabel>ARCHETYPE</SectionLabel>
            <Text style={styles.archetype}>{ARCHETYPE}</Text>
            <Text style={styles.quote}>“{ARCHETYPE_QUOTE}”</Text>
          </Card>

          <Card>
            <SectionLabel>PSYCHOLOGICAL MATRIX</SectionLabel>
            {route.params.score ? null : (
              <Text style={styles.note}>
                Neutral baseline. Play a scenario to build your profile.
              </Text>
            )}
            <View style={styles.matrix}>
              {DNA_DIMENSIONS.map(dimension => (
                <View
                  key={dimension}
                  style={styles.row}
                  accessible
                  accessibilityLabel={`${DNA_LABELS[dimension]} ${score[dimension]} of ${DNA_MAX}`}
                >
                  <Text style={styles.rowLabel}>{DNA_LABELS[dimension]}</Text>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${(score[dimension] / DNA_MAX) * 100}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.valueTag}>
                    <Text style={styles.valueText}>{score[dimension]}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>

        <ScrollView
          style={styles.column}
          contentContainerStyle={[styles.columnContent, columnPadding]}
          showsVerticalScrollIndicator={false}
        >
          <Card>
            <SectionLabel>PATTERN DETECTION</SectionLabel>
            <View style={styles.patterns}>
              {PATTERNS.map((pattern, index) => (
                <View key={pattern} style={styles.pattern}>
                  <Text style={styles.patternIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <Text style={styles.patternText}>{pattern}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card accent>
            <View style={styles.blindSpotTag}>
              <Text style={styles.blindSpotTagText}>
                BLIND SPOT - {BLIND_SPOT_DIMENSION}
              </Text>
            </View>
            <Text style={styles.blindSpotQuestion}>{BLIND_SPOT_QUESTION}</Text>
            <Text style={styles.blindSpotBody}>{BLIND_SPOT_BODY}</Text>
          </Card>
        </ScrollView>
      </View>

      <NavigationDrawer
        visible={menuOpen}
        activeRoute="DNA"
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
  headerTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20, // est.
    lineHeight: 25,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: COLUMN_GAP,
  },
  column: {
    flex: 1,
  },
  columnContent: {
    gap: 10, // est.
  },
  card: {
    // Compact so the matrix fits a ~330pt tall landscape viewport unscrolled.
    padding: 12, // est.
    gap: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.headerSeparator,
    backgroundColor: colors.secondaryButtonFill,
  },
  cardAccent: {
    borderColor: colors.error,
  },
  sectionLabel: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.semiBold, // est.
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
  archetype: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold, // est.
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0.5,
  },
  quote: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    ...androidTextFix,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  matrix: {
    gap: 6, // est.
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    ...androidTextFix,
    width: 64,
    color: colors.white,
    fontFamily: fonts.medium, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  track: {
    flex: 1,
    height: 6, // est.
    borderRadius: 3,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  valueTag: {
    minWidth: 36,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: colors.primaryButtonFill,
  },
  valueText: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.semiBold, // est.
    fontSize: 12,
    lineHeight: 16,
  },
  patterns: {
    gap: 10,
  },
  pattern: {
    flexDirection: 'row',
    gap: 10,
  },
  patternIndex: {
    ...androidTextFix,
    width: 20,
    color: colors.primary,
    fontFamily: fonts.bold, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  patternText: {
    ...androidTextFix,
    flex: 1,
    color: colors.white,
    fontFamily: fonts.regular, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  blindSpotTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  blindSpotTagText: {
    ...androidTextFix,
    color: colors.error,
    fontFamily: fonts.semiBold, // est.
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
  },
  blindSpotBody: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 13,
    lineHeight: 18,
  },
  blindSpotQuestion: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.semiBold, // est.
    fontSize: 16,
    lineHeight: 22,
  },
});
