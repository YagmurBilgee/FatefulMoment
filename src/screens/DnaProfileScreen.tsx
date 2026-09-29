import React, { ReactNode, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLandscapePadding } from '../components/LandscapeHeader';
import { MenuButton } from '../components/MenuButton';
import { NavigationDrawer } from '../components/NavigationDrawer';
import { RadarChart } from '../components/RadarChart';
import {
  DNA_DIMENSIONS,
  DNA_LABELS,
  DNA_MAX,
  DnaDimension,
  selectDnaProfile,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts, monoFont } from '../theme/typography';

// Placeholder cropped from the Figma screenshot (128×128, @2x); the same
// portrait stands in for every archetype until the exports are provided.
const avatar = require('../assets/images/avatar-brave-visionary.png');

// Lucide icons (ISC licence) exported at @3x, tinted in code.
const METRIC_ICONS: Record<DnaDimension, number> = {
  vision: require('../assets/images/icon-dna-vision.png'),
  courage: require('../assets/images/icon-dna-courage.png'),
  risk: require('../assets/images/icon-dna-risk.png'),
  control: require('../assets/images/icon-dna-control.png'),
  empathy: require('../assets/images/icon-dna-empathy.png'),
  ethics: require('../assets/images/icon-dna-ethics.png'),
};

const COLUMN_GAP = 16; // est.

// Figma: the "Karar DNAsı" text box, positioned on the screen frame.
const TITLE_TOP = 33.04;
const TITLE_LEFT = 66;
const TITLE_HEIGHT = 28;
/** Figma width of the left column's cards. */
const LEFT_COLUMN_WIDTH = 355.5;
/** Title bottom to the first card. */
const TITLE_TO_CARDS = 16; // est.
// Not in the Figma frame: keeps the drawer reachable, left of the title.
const MENU_BUTTON_SIZE = 40;
const MENU_BUTTON_LEFT = 18; // est.

// Psychological matrix: radar on the left, a 2×3 grid of metric cards on
// the right (Figma), inside a card as wide as the archetype card.
const CARD_PADDING = 12; // est.
const MATRIX_GAP = 12; // est.
const METRIC_WIDTH = 62; // est.
const METRIC_HEIGHT = 40; // est.
const METRIC_GAP = 8; // est.
const GRID_WIDTH = 2 * METRIC_WIDTH + METRIC_GAP;
const GRID_HEIGHT = 3 * METRIC_HEIGHT + 2 * METRIC_GAP;
const RADAR_WIDTH =
  LEFT_COLUMN_WIDTH - 2 * (1 + CARD_PADDING) - MATRIX_GAP - GRID_WIDTH;

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

/** One score of the matrix grid: icon, value, label and bar. */
function MetricCard({
  dimension,
  value,
}: {
  dimension: DnaDimension;
  value: number;
}) {
  return (
    <View
      style={styles.metric}
      accessible
      accessibilityLabel={`${DNA_LABELS[dimension]} ${value} of ${DNA_MAX}`}
    >
      <View style={styles.metricTop}>
        <Image source={METRIC_ICONS[dimension]} style={styles.metricIcon} />
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel} numberOfLines={1}>
        {DNA_LABELS[dimension].toUpperCase()}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(value / DNA_MAX) * 100}%` }]} />
      </View>
    </View>
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
 * Landscape DNA profile: the "Karar DNAsı" title on top, archetype and
 * psychological matrix on the left, pattern detection and blind spot on
 * the right. Each column scrolls on its
 * own so nothing is clipped on short landscape screens. The profile (copy
 * and scores) is picked from the simulation path; the radar and the bars
 * both draw its scores.
 *
 * The title and archetype card follow Figma inspect values; the other
 * cards' spacing and type sizes are estimates.
 */
export function DnaProfileScreen({ route }: RootScreenProps<'DnaProfile'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const profile = selectDnaProfile(route.params);
  const score = profile.scores;
  const columnPadding = {
    paddingTop: TITLE_TO_CARDS,
    paddingBottom: insets.bottom + 12,
  };
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <View style={styles.menuButton}>
        <MenuButton expanded={menuOpen} onPress={() => setMenuOpen(true)} />
      </View>
      <View style={styles.titleBox}>
        <Text style={styles.title} accessibilityRole="header">
          Karar DNAsı
        </Text>
      </View>

      <View
        style={[
          styles.columns,
          { paddingLeft: TITLE_LEFT, paddingRight: padding.paddingRight },
        ]}
      >
        <ScrollView
          style={styles.leftColumn}
          contentContainerStyle={[styles.columnContent, columnPadding]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.archetypeCard}>
            <View style={styles.avatarBox}>
              <Image source={avatar} style={styles.avatar} resizeMode="cover" />
            </View>
            <View style={styles.archetypeText}>
              <Text style={styles.archetype} numberOfLines={1}>
                {profile.archetype}
              </Text>
              <View style={styles.quoteBox}>
                <Text style={styles.quote} numberOfLines={3}>
                  "{profile.quote}"
                </Text>
              </View>
            </View>
          </View>

          <Card>
            <SectionLabel>PSYCHOLOGICAL MATRIX</SectionLabel>
            <View style={styles.matrixBody}>
              <RadarChart
                values={DNA_DIMENSIONS.map(dimension => score[dimension])}
                labels={DNA_DIMENSIONS.map(dimension => DNA_LABELS[dimension])}
                max={DNA_MAX}
                width={RADAR_WIDTH}
                height={GRID_HEIGHT}
              />
              {/* Row by row: Vision | Courage, Risk | Control,
                  Empathy | Ethics. */}
              <View style={styles.metricGrid}>
                {DNA_DIMENSIONS.map(dimension => (
                  <MetricCard
                    key={dimension}
                    dimension={dimension}
                    value={score[dimension]}
                  />
                ))}
              </View>
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
              {profile.patterns.map((pattern, index) => (
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
                BLIND SPOT — {profile.blindSpot.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.blindSpotQuestion}>
              {profile.blindSpotQuestion}
            </Text>
            <Text style={styles.blindSpotBody}>{profile.blindSpotBody}</Text>
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
  menuButton: {
    position: 'absolute',
    top: TITLE_TOP + (TITLE_HEIGHT - MENU_BUTTON_SIZE) / 2,
    left: MENU_BUTTON_LEFT,
    zIndex: 1,
  },
  titleBox: {
    position: 'absolute',
    top: TITLE_TOP,
    left: TITLE_LEFT,
    width: 119,
    height: TITLE_HEIGHT,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 0,
    gap: 8,
  },
  title: {
    ...androidTextFix,
    color: colors.screenTitle,
    fontFamily: fonts.bold,
    // Inter Bold 20 sets "Karar DNAsı" at 119pt, the Figma box width;
    // the 20pt line fills the box between its 4pt paddings.
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: COLUMN_GAP,
    paddingTop: TITLE_TOP + TITLE_HEIGHT,
  },
  leftColumn: {
    width: LEFT_COLUMN_WIDTH,
    flexGrow: 0,
  },
  column: {
    flex: 1,
  },
  columnContent: {
    gap: 10, // est.
  },
  card: {
    // Compact so the matrix fits a ~330pt tall landscape viewport unscrolled.
    padding: CARD_PADDING,
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
  archetypeCard: {
    width: LEFT_COLUMN_WIDTH,
    height: 82,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dnaCardBorder,
    backgroundColor: colors.dnaCardFill,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.avatarBorder,
    backgroundColor: colors.avatarFill,
    overflow: 'hidden',
  },
  avatar: {
    width: 64,
    height: 64,
  },
  archetypeText: {
    width: 261.5,
    height: 64,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  archetype: {
    ...androidTextFix,
    width: 261.5,
    height: 24,
    color: colors.archetypeTitle,
    // Inter Black Italic is its own face (weight 900, italic). On iOS the
    // weight and style also pick SF Black Italic if the face is missing
    // from the build; Android would synthesise them on top of the face.
    fontFamily: fonts.blackItalic,
    ...Platform.select({
      ios: { fontWeight: '900' as const, fontStyle: 'italic' as const },
      default: {},
    }),
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  quoteBox: {
    width: 261.5,
    height: 33,
    paddingHorizontal: 4,
    borderLeftWidth: 1,
    borderLeftColor: colors.quoteRule,
  },
  quote: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    // Three 11pt lines fill the 33pt box; at 10pt every profile's quote
    // wraps to three lines or fewer in the 253.5pt text width.
    fontSize: 10,
    lineHeight: 11,
  },
  matrixBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MATRIX_GAP,
  },
  metricGrid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: METRIC_GAP,
  },
  metric: {
    width: METRIC_WIDTH,
    height: METRIC_HEIGHT,
    paddingHorizontal: 6, // est.
    paddingVertical: 5, // est.
    justifyContent: 'space-between',
    borderRadius: 8, // est.
    borderWidth: 1,
    borderColor: colors.dnaCardBorder,
    backgroundColor: colors.dnaCardFill,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricIcon: {
    width: 10, // est.
    height: 10,
    tintColor: colors.textSecondary,
  },
  metricValue: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.blackItalic, // est.
    fontSize: 9, // est.
    lineHeight: 11,
  },
  metricLabel: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: monoFont,
    fontSize: 6.5, // est.
    lineHeight: 8,
    letterSpacing: 0.5,
  },
  track: {
    height: 3, // est.
    borderRadius: 1.5,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1.5,
    backgroundColor: colors.primary,
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
