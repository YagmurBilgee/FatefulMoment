# Welcome screen — verification record

Reference: Figma "Sign in/up" frame, exported as `up.png` (375×812 @1x).
Devices: iPhone 17 simulator (iOS 26.5) and Pixel_6 emulator (Android 17, 420 dpi, font scale 1.0).
Last updated: 2026-09-25.

## Source status of values

| Value | Status |
| --- | --- |
| Background `#020618` (`colors/base/background`) | Figma token |
| Title: Inter Bold 20/25, letter spacing 0, `#FFFFFF` | Figma |
| Subtitle: Inter Regular 16/24, letter spacing 0, `#90A1B9` | Figma |
| Button labels: Inter Medium 16/24, letter spacing 0 | Figma |
| Email label `#00D3F3` (`colors/on-brand/primary/pri-500`) | Figma token |
| Apple / Google label `#FFFFFF` | Figma |
| Terms of Use / Privacy Policy `#00D3F3` | **Unverified**, and `up.png` samples `#00B8DB` |
| Legal text: Inter, weight/size/line height | Estimate (Regular 13/20), gray `#6A7282` estimate |
| "OR" label: Inter SemiBold 13, `#62748E` | Estimate |
| Button fills, border, radius, email glow | Measured/estimated from pixels |
| Icon size and icon-to-label gap | Icon size from @3x export; gap 12 is an estimate |

## Font integration

- Inter v4.1 from the official release (github.com/rsms/inter, `Inter-4.1.zip`,
  SHA-256 `9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e`).
- Files: `src/assets/fonts/Inter-{Regular,Medium,SemiBold,Bold}.ttf` and
  `Inter-LICENSE.txt` (SIL OFL 1.1). SemiBold is only used by the estimated "OR" style.
- iOS: `UIAppFonts` in `Info.plist` and the target's Copy Bundle Resources phase.
- Android: copies in `android/app/src/main/assets/fonts/`.
- Styles use PostScript names (`Inter-Medium`, etc.) without `fontWeight`,
  because Medium and SemiBold declare separate family names
  ("Inter Medium", "Inter SemiBold").

## Font weight verification

Method: each on-screen label was compared with the same text rendered by PIL
from the bundled TTF files at device pixel size. The table shows the closest
weight by ink coverage and the difference from it.

| Text | Expected | iOS | Android |
| --- | --- | --- | --- |
| Title | Bold | Bold, 0% | Bold, 5% |
| Subtitle | Regular | Regular, 3% | Regular, 2% |
| Email / Apple / Google labels | Medium | Medium, 2% | Medium, 3–5% |

The next closest weight differed by 9–18%. Text widths match `up.png` within
±2 pt (title 274 vs 272, subtitle 238 vs 237, buttons ±1).

## Remaining visual differences

1. Terms of Use / Privacy Policy color is unverified (see table above).
2. "OR" and legal text typography are estimates. On Android the first legal
   line is 305 dp wide vs 297 and line pitch is 21 vs 20.
3. The email button has a flat fill; the Figma glow/gradient is not implemented.
4. Icon-to-label gap: Figma measures 9 (Email) and 15 (Apple, Google); the app
   uses 12 for all three.
5. iOS launch screen and Android window background are still white; no design
   was provided for them.
