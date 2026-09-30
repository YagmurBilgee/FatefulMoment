import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout, PrimaryButton } from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const BADGE_SIZE = 80;
const BADGE_ICON_SIZE = 40;

const badgeIcon = require('../assets/images/check-badge.png');

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
    marginTop: 167,
    backgroundColor: colors.primaryButtonFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    width: BADGE_ICON_SIZE,
    height: BADGE_ICON_SIZE,
  },
  title: {
    ...androidTextFix,
    marginTop: 24,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: {
    ...androidTextFix,
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  email: {
    color: colors.white,
    fontFamily: fonts.semiBold,
  },
  submit: {
    marginTop: 32,
  },
});
