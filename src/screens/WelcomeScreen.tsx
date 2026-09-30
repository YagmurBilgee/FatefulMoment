import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton, AuthHeader } from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

// @3x assets; point size = pixel size / 3.
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
    marginTop: 47,
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
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  buttonGap: {
    height: 16,
  },
  legal: {
    ...androidTextFix,
    marginTop: 24,
    marginBottom: 14,
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  legalLink: {
    color: colors.legalLink,
  },
});
