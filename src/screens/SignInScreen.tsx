import React, { useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';

import {
  AuthFooterLink,
  AuthHeader,
  AuthScreenLayout,
  FMTextInput,
  PrimaryButton,
} from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { mockSignIn } from '../services/mockAuth';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { INVALID_EMAIL_MESSAGE, isValidEmail } from '../utils/validation';

// Also shown for unknown emails.
export const WRONG_PASSWORD_MESSAGE =
  'Your password is wrong. Please try again.';

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
      routes: [{ name: 'Scenarios', params: { user: result.user } }],
    });
  };

  return (
    <AuthScreenLayout
      showBack
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

      <View style={styles.form}>
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
  form: {
    marginTop: 32, // AuthHeader has no bottom margin
    gap: 32,
  },
  submit: {
    marginTop: 48,
  },
  forgot: {
    ...androidTextFix,
    alignSelf: 'center',
    marginTop: 40,
    color: colors.secondaryLink,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
