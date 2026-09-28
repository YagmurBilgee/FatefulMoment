import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { androidTextFix, fonts, monoFont } from '../theme/typography';

const MARQUEE_TEXT = 'THIS IS THE FATEFUL MOMENT...';

// Figma inspect: 289×48 with the default 24pt screen margin inside on the
// right. A wider margin (notch) widens the pill instead of squeezing it.
const PILL_WIDTH = 289;
const PILL_HEIGHT = 48;
const PILL_PADDING_LEFT = 16; // est.
const DEFAULT_EDGE_PADDING = 24;
const GAP = 12; // est.
// Figma has 13.98pt; enlarged to match the hamburger icon's visual weight.
// The export is 42px (14pt @3x), so it is upscaled slightly.
const PLAYLIST_ICON = 20;
const MARQUEE_SPEED = 30; // pt per second
// Room for the text to lay out at its natural width; only the visible
// MARQUEE_WIDTH window is shown, so this just has to exceed the text.
const MARQUEE_TRACK_WIDTH = 1000;

// Figma @3x exports; point size = pixel size / 3.
const icons = {
  prev: require('../assets/images/icon-player-prev.png'), // 48×42
  next: require('../assets/images/icon-player-next.png'), // 48×42
  playlist: require('../assets/images/icon-player-playlist.png'), // 42×42
  // 186×165 including its glow; the ring is 96px (32pt) wide at (45, 24)px.
  play: require('../assets/images/icon-player-play.png'),
};
const PLAY_RING = 32;

// The marquee takes whatever the pill has left after the fixed items.
const MARQUEE_WIDTH =
  PILL_WIDTH -
  PILL_PADDING_LEFT -
  DEFAULT_EDGE_PADDING -
  (48 / 3) * 2 - // prev + next
  PLAY_RING -
  PLAYLIST_ICON -
  GAP * 4;

/** Scrolls its text from right to left forever (native driver). */
function Marquee({ text }: { text: string }) {
  const [textWidth, setTextWidth] = useState(0);
  const offset = useRef(new Animated.Value(MARQUEE_WIDTH)).current;

  useEffect(() => {
    if (textWidth === 0) {
      return;
    }
    const distance = MARQUEE_WIDTH + textWidth;
    offset.setValue(MARQUEE_WIDTH);
    const loop = Animated.loop(
      Animated.timing(offset, {
        toValue: -textWidth,
        duration: (distance / MARQUEE_SPEED) * 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [offset, textWidth]);

  return (
    <View style={styles.marquee}>
      <Animated.View
        style={[styles.marqueeTrack, { transform: [{ translateX: offset }] }]}
      >
        <Text
          numberOfLines={1}
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          style={styles.marqueeText}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

/**
 * Top-right audio / status pill of the landscape header. Playback is not
 * implemented; the controls are visual only.
 */
type AudioStatusPillProps = {
  /**
   * Inner right padding. The pill runs flush to the screen edge, so its
   * content keeps the screen margin (and clears a notch) on the inside.
   */
  edgePadding: number;
};

export function AudioStatusPill({ edgePadding }: AudioStatusPillProps) {
  const { t } = useTranslation();
  return (
    <View
      style={[
        styles.pill,
        {
          width: PILL_WIDTH - DEFAULT_EDGE_PADDING + edgePadding,
          paddingRight: edgePadding,
        },
      ]}
      accessible
      accessibilityLabel={`${t('standby')}. ${MARQUEE_TEXT}`}
    >
      <Image source={icons.prev} style={styles.skip} />
      {/* The ring fills this slot; the glow spills outside it. */}
      <View style={styles.playSlot}>
        <Image source={icons.play} style={styles.playImage} />
      </View>
      <Image source={icons.next} style={styles.skip} />
      <View style={styles.texts}>
        <Text style={styles.status}>{t('standby')}</Text>
        <Marquee text={MARQUEE_TEXT} />
      </View>
      <Image
        source={icons.playlist}
        resizeMode="contain"
        style={styles.playlist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: PILL_HEIGHT,
    paddingLeft: PILL_PADDING_LEFT,
    // Rounded on the left only; the right side is square and touches the
    // screen edge.
    borderTopLeftRadius: PILL_HEIGHT / 2,
    borderBottomLeftRadius: PILL_HEIGHT / 2,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
    backgroundColor: colors.secondaryButtonFill,
  },
  skip: {
    width: 48 / 3,
    height: 42 / 3,
  },
  playSlot: {
    width: PLAY_RING,
    height: PLAY_RING,
  },
  playImage: {
    position: 'absolute',
    left: -45 / 3,
    top: -24 / 3,
    width: 186 / 3,
    height: 165 / 3,
  },
  playlist: {
    width: PLAYLIST_ICON,
    height: PLAYLIST_ICON,
  },
  texts: {
    gap: 2, // est.
  },
  // Typography below is from Figma inspect.
  status: {
    ...androidTextFix,
    color: colors.standbyText,
    fontFamily: monoFont,
    fontSize: 9,
    lineHeight: 13.5,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  marquee: {
    width: MARQUEE_WIDTH,
    height: 15, // marquee line height
    overflow: 'hidden',
  },
  marqueeTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: MARQUEE_TRACK_WIDTH,
    // Row + flex-start: the text takes its natural width, not the track's.
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marqueeText: {
    ...androidTextFix,
    color: colors.marqueeText,
    fontFamily: fonts.bold, // 700
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
