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
import { SCENARIO_VIDEOS, ScenarioVideo } from '../components/ScenarioVideo';
import { TensionTimer, UrgencyVignette } from '../components/TensionTimer';
import {
  applyImpacts,
  BASELINE_DNA,
  DnaImpact,
  findScenario,
  TIMEOUT_IMPACT,
} from '../data/simulation';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { useScenarioProgress } from '../state/ScenarioProgress';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/** Video out, decisions in, once the clip has ended. */
const CROSS_FADE_MS = 1200;
/** A finished decision fading out before the next one fades in. */
const STEP_FADE_MS = 300;
const DECISION_MS = 15000;
/** How long a picked card glows before the flow moves on. */
export const SELECT_HOLD_MS = 450;

// Room kept clear at the top for the back button (16 + 40 + 12).
const TOP_SPACE = 68;
const GRID_GAP = 12; // est.

type Phase = 'briefing' | 'video' | 'decision';

/**
 * Landscape simulation. Phases:
 * - briefing: the scenario briefing card; Start Simulation plays the video.
 * - video: the full-screen scenario clip, played to its end, with only the
 *   back button on top (Figma). When it ends, the video slowly fades out
 *   while the darkened scene, the decision cards and the timer fade in. A
 *   scenario without a clip goes straight to the decisions.
 * - decision: five options (two left, two right, one bottom center) around
 *   the question, with a 15 s tension timer. Picking a card makes it glow
 *   for a moment; running out of time scores `TIMEOUT_IMPACT`. Either way
 *   the next decision fades in, and after the last decision the DNA profile
 *   replaces this screen, so Back from it returns to Scenarios.
 *
 * Decision layout values are estimates until the Figma frame is inspected.
 */
export function SimulationScreen({
  navigation,
  route,
}: RootScreenProps<'Simulation'>) {
  const insets = useSafeAreaInsets();
  const padding = useLandscapePadding();
  const scenario = findScenario(route.params.scenarioId);
  const [impacts, setImpacts] = useState<DnaImpact[]>([]);
  const [phase, setPhase] = useState<Phase>('briefing');
  const [selectedId, setSelectedId] = useState<string>();
  // The clip stays mounted through the cross-fade, then is released.
  const [videoMounted, setVideoMounted] = useState(true);
  const { markCompleted } = useScenarioProgress();

  const videoOpacity = useRef(new Animated.Value(1)).current;
  const decisionOpacity = useRef(new Animated.Value(0)).current;
  /** Share of the decision window left, 1 → 0. */
  const remaining = useRef(new Animated.Value(1)).current;
  const timer = useRef<Animated.CompositeAnimation | null>(null);
  const holdTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
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
        {header('Scenario unavailable')}
        <Text style={[styles.body, styles.unavailable, padding]}>
          This scenario is coming soon.
        </Text>
      </View>
    );
  }

  const step = impacts.length;
  const decision = scenario.decisions[step];
  const scene = BRIEFING_IMAGES[scenario.id];
  const video = SCENARIO_VIDEOS[scenario.id];

  const fadeInDecision = (duration: number) => {
    decided.current = false;
    remaining.setValue(1);
    Animated.timing(decisionOpacity, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        startTimer();
      }
    });
  };

  const commit = (impact: DnaImpact) => {
    const next = [...impacts, impact];
    if (next.length === scenario.decisions.length) {
      markCompleted(scenario.id);
      navigation.replace('DnaProfile', {
        score: applyImpacts(BASELINE_DNA, next),
      });
      return;
    }
    Animated.timing(decisionOpacity, {
      toValue: 0,
      duration: STEP_FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      setImpacts(next);
      setSelectedId(undefined);
      fadeInDecision(STEP_FADE_MS);
    });
  };

  const decide = (impact: DnaImpact, optionId?: string) => {
    if (decided.current) {
      return;
    }
    decided.current = true;
    timer.current?.stop();
    if (!optionId) {
      commit(impact); // timed out
      return;
    }
    setSelectedId(optionId);
    holdTimeout.current = setTimeout(() => commit(impact), SELECT_HOLD_MS);
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

  const endVideo = () => {
    if (videoEnded.current) {
      return;
    }
    videoEnded.current = true;
    decisionOpacity.setValue(0);
    setPhase('decision');
    Animated.timing(videoOpacity, {
      toValue: 0,
      duration: CROSS_FADE_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => setVideoMounted(false));
    fadeInDecision(CROSS_FADE_MS);
  };

  if (phase === 'briefing') {
    return (
      <View style={styles.root}>
        {header()}
        <View style={styles.briefingArea}>
          <ScenarioBriefing
            scenario={scenario}
            onStart={() =>
              SCENARIO_VIDEOS[scenario.id] ? setPhase('video') : endVideo()
            }
          />
        </View>
      </View>
    );
  }

  const card = (index: number) => {
    const option = decision.options[index];
    if (!option) {
      return null;
    }
    return (
      <DecisionCard
        option={option}
        selected={selectedId === option.id}
        dimmed={selectedId !== undefined && selectedId !== option.id}
        onPress={() => decide(option.impact, option.id)}
      />
    );
  };

  return (
    <View style={styles.root}>
      {/* The scene the video ends on, left behind once the video fades. */}
      {scene ? (
        <Image source={scene} resizeMode="cover" style={styles.scene} />
      ) : null}

      {video && videoMounted ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { opacity: videoOpacity }]}
        >
          <ScenarioVideo source={video} onEnd={endVideo} />
        </Animated.View>
      ) : null}

      {/* Mounted for the whole decision phase, which includes both fades,
          so nothing of it is reachable while the video plays. */}
      {phase === 'decision' ? (
        <Animated.View
          pointerEvents="box-none"
          style={[StyleSheet.absoluteFill, { opacity: decisionOpacity }]}
        >
          <View style={styles.scrim} />
          <UrgencyVignette remaining={remaining} />
          <View
            style={[
              styles.decision,
              padding,
              { paddingTop: insets.top + TOP_SPACE },
              { paddingBottom: insets.bottom + 12 },
            ]}
          >
            <View style={styles.grid}>
              <View style={styles.column}>
                {card(0)}
                {card(1)}
              </View>
              <View style={styles.question}>
                <Text style={styles.meta}>
                  Decision {step + 1} of {scenario.decisions.length}
                </Text>
                <Text style={styles.decisionTitle} accessibilityRole="header">
                  {decision.title}
                </Text>
                <Text style={styles.prompt}>{decision.prompt}</Text>
              </View>
              <View style={styles.column}>
                {card(2)}
                {card(3)}
              </View>
            </View>
            <View style={styles.bottomCard}>{card(4)}</View>
            <TensionTimer remaining={remaining} />
          </View>
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
  decision: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: GRID_GAP,
  },
  grid: {
    flexDirection: 'row',
    gap: 20, // est.
  },
  column: {
    width: '30%', // est.
    gap: GRID_GAP,
  },
  question: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomCard: {
    width: '30%',
    alignSelf: 'center',
  },
  back: {
    position: 'absolute',
  },
  meta: {
    ...androidTextFix,
    color: colors.primary,
    fontFamily: fonts.bold, // est.
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  decisionTitle: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold, // est.
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
  },
  body: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular, // est.
    fontSize: 14,
    lineHeight: 20,
  },
  prompt: {
    ...androidTextFix,
    color: colors.screenTitle,
    fontFamily: fonts.semiBold, // est.
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});
