import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '../components/BackButton';
import {
  LandscapeHeader,
  useLandscapePadding,
} from '../components/LandscapeHeader';
import { DecisionCard } from '../components/DecisionCard';
import {
  BRIEFING_IMAGES,
  ScenarioBriefing,
} from '../components/ScenarioBriefing';
import { ScenarioVideo, VIDEOS } from '../components/ScenarioVideo';
import { TensionTimer, UrgencyVignette } from '../components/TensionTimer';
import { useTranslation } from '../context/LanguageContext';
import {
  applyImpacts,
  BASELINE_DNA,
  DecisionOption,
  DnaImpact,
  findScenario,
  TIMEOUT_IMPACT,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { useScenarioProgress } from '../state/ScenarioProgress';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/** Video ↔ decisions cross-fade, both ways. */
const CROSS_FADE_MS = 1200;
/** A decision fading out before the next one when there is no clip. */
const STEP_FADE_MS = 300;
const DECISION_MS = 15000;
/** How long a picked card glows before the flow moves on. */
export const SELECT_HOLD_MS = 300;

// Figma "Options": rows of Option Cards, 12pt apart, the last row's bottom
// edge 76.5pt above the screen's bottom edge.
const OPTIONS_GAP = 12;
const OPTIONS_BOTTOM = 76.5;

type Phase = 'briefing' | 'video' | 'decision';

const fade = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.inOut(Easing.quad),
    useNativeDriver: true,
  });

/** The clip id if that clip is bundled; unknown ids play nothing. */
const playable = (id: string | undefined) =>
  id !== undefined && VIDEOS[id] !== undefined ? id : undefined;

/**
 * Landscape simulation, alternating full-screen clips and decisions:
 * - briefing: the scenario briefing card; Start Simulation plays the intro.
 * - video: a full-screen clip played to its end, with only the back button
 *   on top (Figma). Its end cross-fades into the next decision.
 * - decision: only the back button, five Option Cards in three rows (2, 2,
 *   1) and the 15 s tension timer (Figma). A picked card glows, then the
 *   decision cross-fades into its consequence clip (the option's, else the
 *   decision's); running out of time scores `TIMEOUT_IMPACT` and plays the
 *   decision's clip. Only when that clip ends does the next decision
 *   appear, or, after the last one, the DNA profile, which replaces this
 *   screen so Back from it returns to Scenarios. Without a clip the flow
 *   moves straight on.
 * - review: for a decision with a `reviewVideo`, its clip ends in a
 *   consequence review instead: the same five cards in the same places
 *   under an "Unselected Options" title, the first pick glowing, locked
 *   and badged "Your Choice" (none after a timeout), the others open and
 *   untimed. The second pick glows, the cards cross-fade into the review
 *   clip, and its end moves on as above.
 */
export function SimulationScreen({
  navigation,
  route,
}: RootScreenProps<'Simulation'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const scenario = findScenario(route.params.scenarioId);
  const { markCompleted } = useScenarioProgress();
  const { t } = useTranslation();

  const [phase, setPhase] = useState<Phase>('briefing');
  /** Decisions answered so far; drives which options are shown. */
  const [step, setStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string>();
  /** The decision on screen is its consequence review. */
  const [reviewing, setReviewing] = useState(false);
  /** The first pick, badged in the review; unset after a timeout. */
  const [choiceId, setChoiceId] = useState<string>();
  /** Clip on screen; `key` remounts it, so the same clip can play again. */
  const [clip, setClip] = useState<{ id: string; key: number }>();
  /** The decision layer stays mounted while it fades out. */
  const [decisionMounted, setDecisionMounted] = useState(false);

  const videoOpacity = useRef(new Animated.Value(1)).current;
  const decisionOpacity = useRef(new Animated.Value(0)).current;
  /** Share of the decision window left, 1 → 0. */
  const remaining = useRef(new Animated.Value(1)).current;
  const timer = useRef<Animated.CompositeAnimation | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Read by callbacks that outlive a render (timer, clip end), so they
  // always see the latest answers.
  const impacts = useRef<DnaImpact[]>([]);
  /** Decisions finished, their review included. */
  const answered = useRef(0);
  /** The current decision's review comes next. */
  const reviewPending = useRef(false);
  const clipCount = useRef(0);
  // Guards against a double end (end + error) and double decisions (tap +
  // timeout, or two quick taps).
  const videoEnded = useRef(false);
  const decided = useRef(false);

  useEffect(
    () => () => {
      timer.current?.stop();
      clearTimeout(holdTimeout.current);
    },
    [],
  );

  const header = (title = '') => (
    <LandscapeHeader
      left={
        <>
          <BackButton />
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
        </>
      }
    />
  );

  if (!scenario || !scenario.playable) {
    return (
      <View style={styles.root}>
        {header(t('scenarioUnavailable'))}
        <Text style={[styles.body, styles.unavailable, padding]}>
          {t('scenarioComingSoon')}
        </Text>
      </View>
    );
  }

  const decisions = scenario.decisions;
  const scene = BRIEFING_IMAGES[scenario.id];

  const finish = () => {
    markCompleted(scenario.id);
    navigation.replace('DnaProfile', {
      score: applyImpacts(BASELINE_DNA, impacts.current),
    });
  };

  const startTimer = () => {
    timer.current = Animated.timing(remaining, {
      toValue: 0,
      duration: DECISION_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    timer.current.start(({ finished }) => {
      if (finished) {
        decide(TIMEOUT_IMPACT);
      }
    });
  };

  /** Fades the next decision in, from a clip or from the previous one. */
  const showDecision = (fromVideo: boolean) => {
    const review = reviewPending.current;
    decided.current = false;
    remaining.setValue(1);
    decisionOpacity.setValue(0);
    setStep(answered.current);
    setReviewing(review);
    setSelectedId(undefined);
    setDecisionMounted(true);
    setPhase('decision');
    const duration = fromVideo ? CROSS_FADE_MS : STEP_FADE_MS;
    if (fromVideo) {
      // Only a completed fade releases the clip: an interrupted one means a
      // new clip has started on top of it.
      fade(videoOpacity, 0, duration).start(({ finished }) => {
        if (finished) {
          setClip(undefined);
        }
      });
    }
    fade(decisionOpacity, 1, duration).start(({ finished }) => {
      if (finished && !review) {
        startTimer();
      }
    });
  };

  const done = () =>
    !reviewPending.current && answered.current === decisions.length;

  /** After a clip or a decision: the review, next decision or profile. */
  const advance = (fromVideo: boolean) => {
    if (done()) {
      finish();
    } else {
      showDecision(fromVideo);
    }
  };

  /** Plays a clip; from a decision, the two cross-fade. */
  const playClip = (id: string, fromDecision: boolean) => {
    videoEnded.current = false;
    clipCount.current += 1;
    setClip({ id, key: clipCount.current });
    setPhase('video');
    if (!fromDecision) {
      videoOpacity.setValue(1);
      return;
    }
    videoOpacity.setValue(0);
    fade(videoOpacity, 1, CROSS_FADE_MS).start();
    fade(decisionOpacity, 0, CROSS_FADE_MS).start(({ finished }) => {
      if (finished) {
        setDecisionMounted(false);
      }
    });
  };

  const endVideo = () => {
    if (videoEnded.current) {
      return;
    }
    videoEnded.current = true;
    advance(true);
  };

  const decide = (impact: DnaImpact, option?: DecisionOption) => {
    if (decided.current) {
      return;
    }
    decided.current = true;
    timer.current?.stop();
    const node = decisions[answered.current];
    const review = reviewPending.current;
    const outcome = playable(
      review ? node.reviewVideo : option?.outcomeVideo ?? node.outcomeVideo,
    );
    const commit = () => {
      impacts.current = [...impacts.current, impact];
      if (!review && node.reviewVideo) {
        reviewPending.current = true;
        setChoiceId(option?.id);
      } else {
        reviewPending.current = false;
        answered.current += 1;
      }
      if (outcome) {
        playClip(outcome, true);
        return;
      }
      if (done()) {
        finish();
        return;
      }
      fade(decisionOpacity, 0, STEP_FADE_MS).start(() => advance(false));
    };
    if (!option) {
      commit(); // timed out
      return;
    }
    setSelectedId(option.id);
    holdTimeout.current = setTimeout(commit, SELECT_HOLD_MS);
  };

  if (phase === 'briefing') {
    const start = () => {
      const intro = playable(scenario.introVideo);
      if (intro) {
        playClip(intro, false);
      } else {
        advance(false);
      }
    };
    return (
      <View style={styles.root}>
        {header()}
        <View style={styles.briefingArea}>
          <ScenarioBriefing scenario={scenario} onStart={start} />
        </View>
      </View>
    );
  }

  const decision = decisions[step];
  const card = (index: number) => {
    const option = decision.options[index];
    if (!option) {
      return null;
    }
    const chosen = reviewing && choiceId === option.id;
    return (
      <DecisionCard
        option={option}
        selected={chosen || selectedId === option.id}
        dimmed={!chosen && selectedId !== undefined && selectedId !== option.id}
        disabled={chosen}
        badge={chosen ? t('yourChoice') : undefined}
        onPress={() => decide(option.impact, option)}
      />
    );
  };

  return (
    <View style={styles.root}>
      {/* The scene behind the decisions once a clip has faded. */}
      {scene ? (
        <Image source={scene} resizeMode="cover" style={styles.scene} />
      ) : null}

      {clip ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: videoOpacity }]}
        >
          <ScenarioVideo
            key={clip.key}
            source={VIDEOS[clip.id]}
            onEnd={endVideo}
          />
        </Animated.View>
      ) : null}

      {/* Mounted through both fades; only touchable in the decision phase. */}
      {decisionMounted && decision ? (
        <Animated.View
          pointerEvents={phase === 'decision' ? 'box-none' : 'none'}
          style={[StyleSheet.absoluteFill, { opacity: decisionOpacity }]}
        >
          <View style={styles.scrim} />
          {reviewing ? null : <UrgencyVignette remaining={remaining} />}

          <View style={[styles.options, padding]}>
            {/* Grows the column upward, so the cards keep their places. */}
            {reviewing ? (
              <Text style={styles.reviewTitle} accessibilityRole="header">
                {t('unselectedOptions')}
              </Text>
            ) : null}
            <View style={styles.row}>
              {card(0)}
              {card(1)}
            </View>
            <View style={styles.row}>
              {card(2)}
              {card(3)}
            </View>
            <View style={styles.row}>{card(4)}</View>
          </View>

          {reviewing ? null : (
            <View
              style={[styles.timer, padding, { bottom: insets.bottom + 12 }]}
            >
              <TensionTimer remaining={remaining} />
            </View>
          )}
        </Animated.View>
      ) : null}

      <View
        style={[
          styles.back,
          { top: insets.top + 16, left: padding.paddingLeft },
        ]}
      >
        <BackButton />
      </View>
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
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20, // est.
    lineHeight: 25,
  },
  unavailable: {
    marginTop: 24,
  },
  // Everything below the header separator down to the screen's bottom
  // edge; the card is centered in it both ways. No side padding, so the
  // card's 90% width is of the full screen and it centers on the screen.
  briefingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scene: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.decisionScrim,
  },
  // Figma "Options": Row 1 and Row 2 hold two cards, Row 3 one centered.
  options: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: OPTIONS_BOTTOM,
    gap: OPTIONS_GAP,
  },
  // Clears the "Your Choice" badge that rises above a first-row card.
  reviewTitle: {
    ...androidTextFix,
    marginBottom: 10,
    color: colors.textSecondary,
    fontFamily: fonts.medium, // est.
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: OPTIONS_GAP,
  },
  timer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  back: {
    position: 'absolute',
  },
  body: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
});
