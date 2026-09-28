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
      onEnd: props.onEnd,
      onError: props.onError,
    });
  return { __esModule: true, default: Video };
});
