import { Platform } from 'react-native';

/**
 * Inter font faces.
 *
 * Each weight is referenced by its PostScript name, which matches the
 * bundled file name, so the same value resolves on iOS (PostScript name)
 * and Android (assets/fonts file name). Do not combine with fontWeight.
 */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  /** Weight 900, italic; the only italic face bundled. */
  blackItalic: 'Inter-BlackItalic',
} as const;

/**
 * Secondary face, Helvetica Neue Bold. Helvetica Neue ships with iOS; Android has no Helvetica,
 * so Inter Bold stands in. Weight is baked into the face; do not combine
 * with fontWeight.
 */
export const fontSecondaryBold = Platform.select({
  ios: 'HelveticaNeue-Bold',
  default: fonts.bold,
});

/**
 * Monospace face for small status labels. Menlo ships with
 * iOS; Android falls back to its system monospace font.
 */
export const monoFont = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
});

// Removes Android's extra font padding so text boxes match iOS metrics.
export const androidTextFix = Platform.select({
  android: { includeFontPadding: false },
  default: {},
});
