/* global jest */
// Without native insets SafeAreaProvider renders nothing; use the library mock.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// The native video player cannot run in Jest. Stand in a plain View that
// keeps the callbacks, so a test can end the clip with `props.onEnd()`.
jest.mock('react-native-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Video = props =>
    React.createElement(View, {
      testID: 'scenario-video',
      source: props.source,
      onEnd: props.onEnd,
      onError: props.onError,
    });
  return { __esModule: true, default: Video };
});

// The preset's native animation mock ends every animation after 16 ms, so
// a 15 s countdown would time out at once. End timing animations after
// their real duration instead (frames are sampled at 60 fps), and let
// stopAnimation cancel them.
{
  const animated = require('react-native').NativeModules.NativeAnimatedModule;
  const running = new Map();
  animated.startAnimatingNode = jest.fn((id, _tag, config, endCallback) => {
    const ms =
      config.type === 'frames' ? (config.frames.length * 1000) / 60 : 16;
    running.set(
      id,
      setTimeout(() => {
        running.delete(id);
        endCallback({ finished: true });
      }, ms),
    );
  });
  animated.stopAnimation = jest.fn(id => {
    clearTimeout(running.get(id));
    running.delete(id);
  });
}
