import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthHeader } from '../components/AuthHeader';
import { BackButton } from '../components/BackButton';
import { FMTextInput } from '../components/FMTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { mockSignIn } from '../services/mockAuth';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { isValidEmail } from '../utils/validation';

// Copy from the Figma "Error Cases" frames.
export const INVALID_EMAIL_MESSAGE = 'Please enter a valid email address.';
export const WRONG_PASSWORD_MESSAGE =
  'Your password is wrong. Please try again.';

/*
 * Layout measured from the Sign in frames (~0.66x exports), relative to the
 * safe area. All spacing values are estimates.
 */
export function SignInScreen({ navigation }: RootScreenProps<'SignIn'>) {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInputInstance>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !loading;

  const validateEmail = () => {
    const valid = isValidEmail(email);
    setEmailError(valid ? undefined : INVALID_EMAIL_MESSAGE);
    return valid;
  };

  const submit = async () => {
    if (!canSubmit) {
      return;
    }
    Keyboard.dismiss();
    if (!validateEmail()) {
      return;
    }
    setLoading(true);
    const result = await mockSignIn(email, password);
    setLoading(false);
    if (!result.ok) {
      setPasswordError(WRONG_PASSWORD_MESSAGE);
    }
    // Pending: the design does not define a destination after sign-in.
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.backButton}>
            <BackButton onPress={navigation.goBack} />
          </View>

          <AuthHeader
            title="Welcome to Fateful Moment"
            subtitle="Sign in with Email"
          />

          <View style={styles.emailField}>
            <FMTextInput
              value={email}
              onChangeText={text => {
                setEmail(text);
                setEmailError(undefined);
                setPasswordError(undefined);
              }}
              onBlur={() => {
                if (email.trim() !== '') {
                  validateEmail();
                }
              }}
              error={emailError}
              placeholder="Your email address"
              accessibilityLabel="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View style={styles.passwordField}>
            <FMTextInput
              ref={passwordRef}
              password
              value={password}
              onChangeText={text => {
                setPassword(text);
                setPasswordError(undefined);
              }}
              error={passwordError}
              placeholder="Your password"
              accessibilityLabel="Password"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
            />
          </View>

          <View style={styles.submit}>
            <PrimaryButton
              label="Sign In"
              onPress={submit}
              disabled={!canSubmit}
              loading={loading}
            />
          </View>

          {/* Pending: Reset Password screen is not implemented yet. */}
          <Text
            style={styles.forgot}
            accessibilityRole="link"
            onPress={() => {}}
          >
            Forgot password?
          </Text>
        </View>

        <Text style={styles.footer}>
          No account yet?{' '}
          {/* Pending: Create Account screen is not implemented yet. */}
          <Text
            style={styles.footerLink}
            accessibilityRole="link"
            onPress={() => {}}
          >
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  backButton: {
    position: 'absolute',
    top: 19, // est.
    left: 0,
    zIndex: 1,
  },
  emailField: {
    marginTop: 32, // est.
  },
  passwordField: {
    marginTop: 32, // est. — also holds the email error message
  },
  submit: {
    marginTop: 48, // est. — also holds the password error message
  },
  forgot: {
    ...androidTextFix,
    alignSelf: 'center',
    marginTop: 40, // est.
    color: colors.secondaryLink,
    fontFamily: fonts.regular, // est.: Inter Regular 14/20
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    ...androidTextFix,
    marginTop: 24,
    marginBottom: 28, // est.
    color: colors.textSecondary, // est.
    fontFamily: fonts.regular, // est.: Inter Regular 14/20
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary, // est.
    fontFamily: fonts.semiBold, // est.
    textDecorationLine: 'underline',
  },
});
