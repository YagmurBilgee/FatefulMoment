/* global jest */
// Without native insets SafeAreaProvider renders nothing; use the library mock.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
