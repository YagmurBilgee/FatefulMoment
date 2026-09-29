import React from 'react';
import { StyleSheet } from 'react-native';
import Video, { type ReactVideoSource } from 'react-native-video';

/** Local clips, by the ids the scenario data refers to. */
export const VIDEOS: Record<string, ReactVideoSource> = {
  'iraq-war': { uri: require('../assets/images/iraq-war.mp4') },
  'iraq-war-2': { uri: require('../assets/images/irac-war-2.mp4') },
  'iraq-war-3': { uri: require('../assets/images/iraq-war-3.mp4') },
};

/** Scrim opacity over a clip's last frame held behind the decisions. */
export const DEFAULT_BACKDROP_DIM = 0.85;

/**
 * Clips whose last frame is already dark take a lighter scrim, so the
 * scene stays visible. `iraq-war` fades out to a mean luma of ~0.06.
 */
export const BACKDROP_DIM: Record<string, number> = {
  'iraq-war': 0.2,
};

type ScenarioVideoProps = {
  source: ReactVideoSource;
  /** Called once when the clip has played to the end, or fails to play. */
  onEnd: () => void;
};

/**
 * Full-screen scenario clip. Plays once from start to finish with no
 * controls; the screen moves on to the decisions from `onEnd`. A clip that
 * cannot play also ends, so the player is never stuck on a black screen.
 */
export function ScenarioVideo({ source, onEnd }: ScenarioVideoProps) {
  return (
    <Video
      source={source}
      style={styles.video}
      resizeMode="cover"
      repeat={false}
      controls={false}
      onEnd={onEnd}
      onError={onEnd}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFill,
  },
});
