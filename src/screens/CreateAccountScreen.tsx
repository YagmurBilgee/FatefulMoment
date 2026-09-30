import React, { useRef, useState } from 'react';
import {
  Image,
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
import { mockSignUp } from '../services/mockAuth';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import {
  INVALID_EMAIL_MESSAGE,
  isValidEmail,
  isValidFullName,
  PASSWORD_RULES,
  SHORT_NAME_MESSAGE,
} from '../utils/validation';

const ruleMetIcon = require('../assets/images/check-circle.png');
const ruleUnmetIcon = require('../assets/images/check-circle-grey.png');

export function CreateAccountScreen({
  navigation,
}: RootScreenProps<'CreateAccount'>) {
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const rules = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    met: rule.test(password),
  }));
  const passwordValid = rules.every(rule => rule.met);
  // Shown while typing the password, and kept while a rule is still unmet so the disabled button is explained.
  const showRules = passwordFocused || (password !== '' && !passwordValid);

  const canSubmit =
    name.trim() !== '' && email.trim() !== '' && passwordValid && !loading;

  const validateName = () => {
    const valid = isValidFullName(name);
    setNameError(valid ? undefined : SHORT_NAME_MESSAGE);
    return valid;
  };

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
    const nameOk = validateName();
    const emailOk = validateEmail();
    if (!nameOk || !emailOk) {
      return;
    }
    setLoading(true);
    const user = await mockSignUp(name, email);
    setLoading(false);
    // Start the mock session; Back cannot return to the auth screens.
    navigation.reset({
      index: 0,
      routes: [{ name: 'Scenarios', params: { user } }],
    });
  };

  return (
    <AuthScreenLayout
      showBack
      footer={
        <AuthFooterLink
          prompt="Already have an account?"
          linkLabel="Sign in"
          onPress={() => navigation.popTo('SignIn')}
        />
      }
    >
      <AuthHeader title="Create your Fateful Moment Account" />

      <View style={styles.form}>
        <FMTextInput
          value={name}
          onChangeText={text => {
            setName(text);
            setNameError(undefined);
          }}
          onBlur={() => {
            if (name !== '') {
              validateName();
            }
          }}
          error={nameError}
          placeholder="Full Name"
          accessibilityLabel="Full name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <FMTextInput
          ref={emailRef}
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <FMTextInput
          ref={passwordRef}
          password
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          placeholder="Your password"
          accessibilityLabel="Password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        {showRules ? (
          <View accessibilityLabel="Password requirements">
            {rules.map(rule => (
              <View
                key={rule.label}
                style={styles.rule}
                accessibilityState={{ checked: rule.met }}
              >
                <Image
                  source={rule.met ? ruleMetIcon : ruleUnmetIcon}
                  style={styles.ruleIcon}
                />
                <Text style={[styles.ruleText, rule.met && styles.ruleTextMet]}>
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={showRules ? styles.submitAfterRules : styles.submit}>
        <PrimaryButton
          label="Sign up"
          onPress={submit}
          disabled={!canSubmit}
          loading={loading}
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
  rule: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleIcon: {
    width: 40 / 3,
    height: 40 / 3,
    marginLeft: 1,
    marginRight: 10,
  },
  ruleText: {
    ...androidTextFix,
    color: colors.placeholder,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  ruleTextMet: {
    color: colors.textSecondary,
  },
  submit: {
    marginTop: 48,
  },
  submitAfterRules: {
    marginTop: 24,
  },
});
