import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout, PrimaryButton } from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const BADGE_SIZE = 80; // est.
const BADGE_ICON_SIZE = 40; // Figma @3x export, 120px

const badgeIcon = require('../assets/images/check-badge.png');

/*
 * Layout measured from the "Check your email" frame (~0.66x export). All
 * values are estimates.
 */
export function CheckEmailScreen({
  navigation,
  route,
}: RootScreenProps<'CheckEmail'>) {
  return (
    <AuthScreenLayout showBack>
      <View style={styles.badge}>
        <Image source={badgeIcon} style={styles.badgeIcon} />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        Check Your Email
      </Text>
      <Text style={styles.body}>
        We've sent password reset{'\n'}instructions to{' '}
        <Text style={styles.email}>{route.params.email}</Text>
      </Text>

      <View style={styles.submit}>
        <PrimaryButton
          label="Back to Sign in"
          onPress={() => navigation.popTo('SignIn')}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignSelf: 'center',
    marginTop: 167, // est.
    backgroundColor: colors.primaryButtonFill, // est.
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    width: BADGE_ICON_SIZE,
    height: BADGE_ICON_SIZE,
  },
  title: {
    ...androidTextFix,
    marginTop: 24, // est.
    color: colors.white,
    fontFamily: fonts.bold, // est.: Inter Bold 24/30
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: {
    ...androidTextFix,
    marginTop: 8, // est.
    color: colors.textSecondary, // est.
    fontFamily: fonts.regular, // est.: Inter Regular 16/24
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  email: {
    color: colors.white, // est.
    fontFamily: fonts.semiBold, // est.
  },
  submit: {
    marginTop: 32, // est.
  },
});
