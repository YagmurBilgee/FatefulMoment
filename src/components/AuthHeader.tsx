import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const logo = require('../assets/images/fateful-moment-logo.png');

const LOGO_SIZE = 148;

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Logo, title and subtitle shared by the auth screens. Offsets are relative to
 * the top safe area.
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
    marginTop: 38,
  },
  title: {
    ...androidTextFix,
    marginTop: 36,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: 0,
    textAlign: 'center',
  },
  subtitle: {
    ...androidTextFix,
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    textAlign: 'center',
  },
});
