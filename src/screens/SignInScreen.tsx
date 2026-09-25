import React, { useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';

import { AuthFooterLink } from '../components/AuthFooterLink';
import { AuthHeader } from '../components/AuthHeader';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FMTextInput } from '../components/FMTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { mockSignIn } from '../services/mockAuth';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { INVALID_EMAIL_MESSAGE, isValidEmail } from '../utils/validation';

// Copy from the Figma "Error Cases" frames. Also shown for unknown emails.
export const WRONG_PASSWORD_MESSAGE =
  'Your password is wrong. Please try again.';

/*
 * Layout measured from the Sign in frames (~0.66x exports), relative to the
 * safe area. All spacing values are estimates.
 */
export function SignInScreen({ navigation }: RootScreenProps<'SignIn'>) {
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
      return;
    }
    // Replace the auth stack so Back cannot return to Sign In.
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { user: result.user } }],
    });
  };

  return (
    <AuthScreenLayout
      onBack={navigation.goBack}
      footer={
        <AuthFooterLink
          prompt="No account yet?"
          linkLabel="Sign up"
          onPress={() => navigation.navigate('CreateAccount')}
        />
      }
    >
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

      <Text
        style={styles.forgot}
        accessibilityRole="link"
        onPress={() => navigation.navigate('ResetPassword')}
      >
        Forgot password?
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
});
