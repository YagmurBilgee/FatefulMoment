/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';

import App from '../App';
import { MOCK_USER } from '../src/services/mockAuth';
import {
  INVALID_EMAIL_MESSAGE,
  WRONG_PASSWORD_MESSAGE,
} from '../src/screens/SignInScreen';

const { act } = ReactTestRenderer;

let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
let root: ReactTestInstance;

const byLabel = (label: string) =>
  root.find(
    n =>
      n.props.accessibilityLabel === label &&
      (n.props.onPress !== undefined || n.props.onChangeText !== undefined),
  );

const hasText = (text: string) =>
  root.findAll(n => typeof n.type === 'string' && n.props.children === text)
    .length > 0;

const signInButton = () => byLabel('Sign In');

async function openSignIn() {
  await act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  root = renderer!.root;
  await act(async () => {
    byLabel('Continue with Email').props.onPress();
  });
}

async function type(label: string, text: string) {
  await act(async () => {
    byLabel(label).props.onChangeText(text);
  });
}

async function submit() {
  await act(async () => {
    signInButton().props.onPress();
  });
  await act(async () => {
    jest.runAllTimers();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(async () => {
  await act(async () => {
    renderer?.unmount();
    jest.runOnlyPendingTimers();
  });
  renderer = undefined;
  jest.useRealTimers();
});

test('Continue with Email opens Sign In', async () => {
  await openSignIn();
  expect(hasText('Sign in with Email')).toBe(true);
});

test('Sign In is disabled until both fields are filled', async () => {
  await openSignIn();
  expect(signInButton().props.accessibilityState.disabled).toBe(true);
  await type('Email address', MOCK_USER.email);
  expect(signInButton().props.accessibilityState.disabled).toBe(true);
  await type('Password', 'x');
  expect(signInButton().props.accessibilityState.disabled).toBe(false);
});

test('invalid email shows an error on blur and clears on edit', async () => {
  await openSignIn();
  await type('Email address', 'johndoeQmail.com');
  await act(async () => {
    byLabel('Email address').props.onBlur({});
  });
  expect(hasText(INVALID_EMAIL_MESSAGE)).toBe(true);
  await type('Email address', 'johndoe@mail.com');
  expect(hasText(INVALID_EMAIL_MESSAGE)).toBe(false);
});

test('invalid email blocks submit', async () => {
  await openSignIn();
  await type('Email address', 'not-an-email');
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText(INVALID_EMAIL_MESSAGE)).toBe(true);
  expect(hasText(WRONG_PASSWORD_MESSAGE)).toBe(false);
});

test('wrong password shows the password error', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', 'wrong-password');
  await submit();
  expect(hasText(WRONG_PASSWORD_MESSAGE)).toBe(true);
});

test('mock credentials sign in without errors', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText(WRONG_PASSWORD_MESSAGE)).toBe(false);
  expect(hasText(INVALID_EMAIL_MESSAGE)).toBe(false);
  expect(signInButton().props.accessibilityState.busy).toBe(false);
});

test('password visibility toggles', async () => {
  await openSignIn();
  const secure = () =>
    root.findAll(
      n =>
        n.props.accessibilityLabel === 'Password' &&
        'secureTextEntry' in n.props,
    )[0].props.secureTextEntry;
  expect(secure()).toBe(true);
  await act(async () => {
    byLabel('Show password').props.onPress();
  });
  expect(secure()).toBe(false);
  expect(() => byLabel('Hide password')).not.toThrow();
});
