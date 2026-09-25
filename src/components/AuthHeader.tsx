import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const logo = require('../assets/images/fateful-moment-logo.png');

const LOGO_SIZE = 148; // est. — best fit of the logo asset against up.png

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Logo, title and subtitle shared by the auth screens. Offsets are relative to
 * the top safe area and were measured on the Welcome frame; the Sign in frame
 * places them at the same positions.
 */
export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View>
      <Image
        source={logo}
        style={styles.logo}
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    alignSelf: 'center',
    marginTop: 38, // est.
  },
  title: {
    ...androidTextFix,
    marginTop: 36, // est.
    color: colors.white,
    fontFamily: fonts.bold, // Figma: Inter Bold 20/25, letter spacing 0
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    ...androidTextFix,
    marginTop: 8, // est.
    color: colors.textSecondary,
    fontFamily: fonts.regular, // Figma: Inter Regular 16/24, letter spacing 0
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
  },
});
