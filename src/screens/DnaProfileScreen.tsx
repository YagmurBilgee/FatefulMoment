import React, { ReactNode, useState } from 'react';
import {
  Image,
  ImageStyle,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useLandscapePadding,
  MenuButton,
  NavigationDrawer,
  RadarChart,
} from '../components';
import {
  DNA_DIMENSIONS,
  DNA_LABELS,
  DNA_MAX,
  DnaDimension,
  DnaProfileId,
  nextBrowsedProfile,
  selectDnaProfile,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts, monoFont } from '../theme/typography';

// Brave Visionary is cropped from the Figma screenshot (128×128, @2x); the
// others are the provided portraits scaled to 192×192 (64pt @3x).
const AVATARS: Record<DnaProfileId, number> = {
  'brave-visionary': require('../assets/images/avatar-brave-visionary.png'),
  'pragmatic-strategist': require('../assets/images/avatar-pragmatic-strategist.png'),
  'empathetic-leader': require('../assets/images/avatar-empathetic-leader.png'),
};

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
/** Figma: between stacked cards in each column. */
const CARD_GAP = 16;

// Drawer DNA icon, 48×48px @3x.
const dnaIcon = require('../assets/images/icon-drawer-dna.png');
const DNA_ICON_SIZE = 11; // est., one header line
// Figma exports @3x, already coloured: 33×33px and 36×36px.
const patternIcon = require('../assets/images/icon-pattern-detection.png');
const blindSpotIcon = require('../assets/images/icon-blind-spot.png');

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
// Figma radar canvas and its offset inside the matrix section.
const RADAR_WIDTH = 149;
const RADAR_HEIGHT = 115;
const RADAR_TOP = 8.68;
const RADAR_LEFT = 22;

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
      <View style={styles.metricBottom}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {DNA_LABELS[dimension].toUpperCase()}
        </Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${(value / DNA_MAX) * 100}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

/** Card title row: an icon and an 8pt mono title (Figma). */
function CardHeader({
  icon,
  iconStyle,
  titleStyle,
  children,
}: {
  icon: number;
  iconStyle: StyleProp<ImageStyle>;
  titleStyle: StyleProp<TextStyle>;
  children: ReactNode;
}) {
  return (
    <View style={styles.cardHeader}>
      <Image source={icon} style={iconStyle} />
      <Text style={[styles.cardTitle, titleStyle]} numberOfLines={1}>
        {children}
      </Text>
    </View>
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
  // Fixed for the visit: a played path decides the archetype, a visit from
  // the drawer takes the next one in turn.
  const [profile] = useState(() =>
    route.params?.score
      ? selectDnaProfile(route.params.score)
      : nextBrowsedProfile(),
  );
  const score = profile.scores;
  const columnPadding = {
    paddingTop: TITLE_TO_CARDS,
    paddingBottom: insets.bottom + 12,
  };
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
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
              <Image
                source={AVATARS[profile.id]}
                style={styles.avatar}
                resizeMode="cover"
              />
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
            <CardHeader
              icon={dnaIcon}
              iconStyle={styles.matrixIcon}
              titleStyle={styles.matrixTitle}
            >
              PSYCHOLOGICAL MATRIX
            </CardHeader>
            <View style={styles.matrixBody}>
              <View style={styles.radar}>
                <RadarChart
                  values={DNA_DIMENSIONS.map(dimension => score[dimension])}
                  labels={DNA_DIMENSIONS.map(
                    dimension => DNA_LABELS[dimension],
                  )}
                  max={DNA_MAX}
                  width={RADAR_WIDTH}
                  height={RADAR_HEIGHT}
                />
              </View>
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
            <CardHeader
              icon={patternIcon}
              iconStyle={styles.patternIcon}
              titleStyle={styles.patternTitle}
            >
              PATTERN DETECTION
            </CardHeader>
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
            <CardHeader
              icon={blindSpotIcon}
              iconStyle={styles.blindSpotIcon}
              titleStyle={styles.blindSpotTitle}
            >
              BLIND SPOT — {profile.blindSpot.toUpperCase()}
            </CardHeader>
            <Text style={styles.blindSpotQuestion}>
              {profile.blindSpotQuestion}
            </Text>
            <Text style={styles.blindSpotBody}>{profile.blindSpotBody}</Text>
          </Card>
        </ScrollView>
      </View>

      {/* After the columns so it takes taps over their padding, before the
          drawer so the open drawer covers it. */}
      <View style={styles.menuButton}>
        <MenuButton expanded={menuOpen} onPress={() => setMenuOpen(true)} />
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
    gap: CARD_GAP,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // est.
  },
  // Figma: Menlo Regular 8/11, uppercase; widths follow the text.
  cardTitle: {
    ...androidTextFix,
    height: 11,
    fontFamily: monoFont,
    fontWeight: '400',
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0,
    textTransform: 'uppercase',
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
  matrixIcon: {
    width: DNA_ICON_SIZE,
    height: DNA_ICON_SIZE,
    tintColor: colors.dnaIcon,
  },
  matrixTitle: {
    width: 97,
    color: colors.screenTitle,
  },
  matrixBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: MATRIX_GAP,
  },
  radar: {
    marginTop: RADAR_TOP,
    marginLeft: RADAR_LEFT,
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
    // Figma: only a hairline top edge, no side or bottom border.
    borderTopWidth: 0.32,
    borderTopColor: colors.metricBorderTop,
    backgroundColor: colors.metricFill,
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
  // Figma sizes; widths are left to the text (Figma: 7 and 18, but
  // "COURAGE" needs ~20.6pt at these metrics).
  metricValue: {
    ...androidTextFix,
    height: 7,
    color: colors.primary,
    // Weight and style are baked into the face; see `archetype`.
    fontFamily: fonts.blackItalic,
    fontSize: 5.05,
    lineHeight: 6.73,
    letterSpacing: 0,
  },
  metricLabel: {
    ...androidTextFix,
    height: 7,
    color: colors.metricLabel,
    fontFamily: monoFont,
    fontWeight: '400',
    fontSize: 4.21,
    lineHeight: 6.31,
    letterSpacing: 0.42,
    textTransform: 'uppercase',
  },
  metricBottom: {
    gap: 4, // label to bar
  },
  // Figma: a 1.68pt bar with 1pt caps; the fill is clipped to the track.
  track: {
    height: 1.68,
    borderRadius: 1,
    backgroundColor: colors.metricTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  patternIcon: {
    width: 33 / 3,
    height: 33 / 3,
  },
  patternTitle: {
    color: colors.textSecondary,
  },
  patterns: {
    gap: 10, // est.
  },
  pattern: {
    flexDirection: 'row',
    gap: 6, // est.
  },
  patternIndex: {
    ...androidTextFix,
    width: 13,
    height: 15,
    color: colors.patternIndex,
    fontFamily: monoFont,
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 15,
  },
  // Same type as the archetype quote.
  patternText: {
    ...androidTextFix,
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 11,
  },
  blindSpotIcon: {
    width: 36 / 3,
    height: 36 / 3,
  },
  blindSpotTitle: {
    color: colors.error,
  },
  // The card's 6pt gap already sits between the question and the
  // paragraph, so neither needs a margin.
  blindSpotQuestion: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  // Pattern text size, with a looser line for the longer paragraph.
  blindSpotBody: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
});
