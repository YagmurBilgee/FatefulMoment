import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { AuthHeader } from '../components/AuthHeader';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FMTextInput } from '../components/FMTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { INVALID_EMAIL_MESSAGE, isValidEmail } from '../utils/validation';

// Figma labels this button "Sign In" in every frame; confirmed as a typo.
export const RESET_BUTTON_LABEL = 'Send reset link';

/*
 * Layout measured from the Reset Password frames (~0.66x exports). All
 * spacing values are estimates. No email is actually sent (no backend).
 */
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
    <AuthScreenLayout onBack={navigation.goBack}>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email to receive a reset link"
      />

      <View style={styles.field}>
        {/* Pending: the gray mail icon inside this field (Figma asset). */}
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
  field: {
    marginTop: 32, // est.
  },
  submit: {
    marginTop: 24, // est. — also holds the email error message
  },
});
