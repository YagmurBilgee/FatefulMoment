import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import {
  AuthHeader,
  AuthScreenLayout,
  FMTextInput,
  PrimaryButton,
} from '../components';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { INVALID_EMAIL_MESSAGE, isValidEmail } from '../utils/validation';

export const RESET_BUTTON_LABEL = 'Send reset link';

const mailIcon = require('../assets/images/mail-input.png');

// No email is actually sent (no backend).
export function ResetPasswordScreen({
  navigation,
}: RootScreenProps<'ResetPassword'>) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();

  const canSubmit = email.trim() !== '';

  const validateEmail = () => {
    const valid = isValidEmail(email);
    setEmailError(valid ? undefined : INVALID_EMAIL_MESSAGE);
    return valid;
  };

  const submit = () => {
    if (!canSubmit) {
      return;
    }
    Keyboard.dismiss();
    if (validateEmail()) {
      navigation.navigate('CheckEmail', { email: email.trim() });
    }
  };

  return (
    <AuthScreenLayout showBack>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email to receive a reset link"
      />

      <View style={styles.form}>
        <FMTextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
            setEmailError(undefined);
          }}
          onBlur={() => {
            if (email.trim() !== '') {
              validateEmail();
            }
          }}
          error={emailError}
          leftIcon={mailIcon}
          placeholder="Your email address"
          accessibilityLabel="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={submit}
        />
      </View>

      <View style={styles.submit}>
        <PrimaryButton
          label={RESET_BUTTON_LABEL}
          onPress={submit}
          disabled={!canSubmit}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 32,
    gap: 16,
  },
  submit: {
    marginTop: 24,
  },
});
