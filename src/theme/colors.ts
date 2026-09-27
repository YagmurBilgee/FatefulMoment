/**
 * Color tokens.
 *
 * Source legend:
 * - [Figma token]  confirmed from the Figma inspect panel
 * - [Figma]        value confirmed in Figma (token name not provided)
 * - [Measured]     sampled from the up.png export; matches a value in the
 *                  Figma "Selection colors" list but the element mapping is
 *                  not yet confirmed in Figma
 * - [Unverified]   assumed by the designer from appearance; awaiting a
 *                  per-element check in Figma
 * - [Estimated]    sampled from up.png only; not found in the visible
 *                  "Selection colors" list — needs verification in Figma
 */
export const colors = {
  background: '#020618', // [Figma token] colors/base/background
  white: '#FFFFFF', // [Figma token] colors/base/white

  textSecondary: '#90A1B9', // [Figma] welcome subtitle
  textMuted: '#6A7282', // [Estimated] legal footer text
  textDivider: '#62748E', // [Measured] "OR" label

  // [Figma token] colors/on-brand/primary/pri-500 — Email label
  primary: '#00D3F3',
  // [Unverified] Terms of Use / Privacy Policy; up.png samples #00B8DB
  legalLink: '#00D3F3',
  primaryButtonFill: 'rgba(0, 211, 243, 0.14)', // [Measured] #00D3F3 @ 14%
  primaryButtonBorder: '#38596D', // [Estimated] rendered border pixel

  secondaryButtonFill: 'rgba(17, 24, 39, 0.8)', // [Measured] #111827 @ 80%
  divider: 'rgba(255, 255, 255, 0.1)', // [Measured] #FFFFFF @ 10%

  // Sign in frames (5.png / 6.png at ~0.66x); thin strokes are blurred there
  inputFill: 'rgba(17, 24, 39, 0.8)', // [Measured] same as secondaryButtonFill
  placeholder: '#62748E', // [Measured] input placeholder
  focusBorder: '#00B8DB', // [Estimated] focused/filled input border
  error: '#FB2C36', // [Estimated] error border and message
  secondaryLink: '#00B8DB', // [Estimated] "Forgot password?"
  backButtonIcon: '#90A1B9', // [Estimated] back arrow tint

  // Landscape container frame (1.png, 812×375 @3x)
  headerSeparator: '#314158', // [Measured] 1pt line under the header bar

  // Scenarios (home) screen, from Figma inspect
  screenTitle: '#E2E8F0', // [Figma] "Scenarios" title
  cardTitle: '#F8FAFC', // [Figma] category card title
  marqueeText: '#F1F5F9', // [Figma] audio pill marquee
  standbyText: 'rgba(0, 211, 243, 0.8)', // [Figma] #00D3F3CC, "STANDBY"
} as const;
