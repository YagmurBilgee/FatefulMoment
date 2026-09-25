import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const BADGE_SIZE = 80; // est.

/*
 * Layout measured from the "Check your email" frame (~0.66x export). All
 * values are estimates.
 */
export function CheckEmailScreen({
  navigation,
  route,
}: RootScreenProps<'CheckEmail'>) {
  return (
    <AuthScreenLayout onBack={navigation.goBack}>
      {/* Pending: check-mark asset; only the badge circle is drawn. */}
      <View style={styles.badge} />

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
