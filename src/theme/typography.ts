import { Platform } from 'react-native';

/**
 * Inter font faces (Figma token: typography/font-family/font-primary).
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
} as const;

/**
 * Monospace face for small status labels (Figma: Menlo). Menlo ships with
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
