import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton, AuthHeader } from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

// Icons are Figma @3x PNG exports; point size = pixel size / 3.
const icons = {
  mail: {
    source: require('../assets/images/mail-icon.png'),
    width: 65 / 3,
    height: 53 / 3,
  },
  apple: {
    source: require('../assets/images/apple-icon.png'),
    width: 54 / 3,
    height: 66 / 3,
  },
  google: {
    source: require('../assets/images/google-icon.png'),
    width: 66 / 3,
    height: 66 / 3,
  },
};

/*
 * Measurements come from the 375×812 up.png export (1x), relative to the
 * iPhone X safe area (top 44, bottom 34). Values marked "est." are derived
 * from pixels and still need confirmation from Figma inspect.
 */
// Font family is Inter (confirmed). Title, subtitle and button styles are
// confirmed from Figma; "OR" and legal text styles are estimates.

export function WelcomeScreen({ navigation }: RootScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <AuthHeader
          title="Welcome to Fateful Moment"
          subtitle="Sign in to continue your journey"
        />

        <View style={styles.primaryAction}>
          <AuthButton
            label="Continue with Email"
            icon={icons.mail}
            variant="primary"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Pending: Apple and Google sign-in behavior is not defined yet. */}
        <AuthButton
          label="Continue with Apple"
          icon={icons.apple}
          variant="secondary"
        />
        <View style={styles.buttonGap} />
        <AuthButton
          label="Continue with Google"
          icon={icons.google}
          variant="secondary"
        />
      </View>

      {/* Pending: Terms of Use and Privacy Policy destinations. */}
      <Text style={styles.legal}>
        By continuing you agree to the{' '}
        <Text style={styles.legalLink}>Terms of Use</Text> and{'\n'}
        <Text style={styles.legalLink}>Privacy Policy</Text>.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  primaryAction: {
    marginTop: 47, // est.
  },
  dividerRow: {
    height: 21,
    marginVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerLabel: {
    ...androidTextFix,
    marginHorizontal: 16,
    color: colors.textDivider,
    fontFamily: fonts.semiBold, // est.
    fontSize: 13, // est.
  },
  buttonGap: {
    height: 16,
  },
  legal: {
    ...androidTextFix,
    marginTop: 24,
    marginBottom: 14, // est.
    color: colors.textMuted,
    fontFamily: fonts.regular, // est.
    fontSize: 13, // est.
    lineHeight: 20, // est.
    textAlign: 'center',
  },
  legalLink: {
    color: colors.legalLink, // unverified
  },
});
