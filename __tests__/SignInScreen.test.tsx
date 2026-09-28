/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';

import App from '../App';
import { MOCK_USER } from '../src/services/mockAuth';
import { WRONG_PASSWORD_MESSAGE } from '../src/screens/SignInScreen';
import { INVALID_EMAIL_MESSAGE } from '../src/utils/validation';

const { act } = ReactTestRenderer;

let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
let root: ReactTestInstance;

const byLabel = (label: string) =>
  root.find(
    n =>
      n.props.accessibilityLabel === label &&
      (n.props.onPress !== undefined || n.props.onChangeText !== undefined),
  );

const textOf = (children: unknown): string =>
  Array.isArray(children) ? children.map(textOf).join('') : String(children);

const hasText = (text: string) =>
  root.findAll(
    n => typeof n.type === 'string' && textOf(n.props.children) === text,
  ).length > 0;

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

test('unknown email falls back to the wrong password error', async () => {
  await openSignIn();
  await type('Email address', 'someone@else.com');
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText(WRONG_PASSWORD_MESSAGE)).toBe(true);
});

test('mock credentials open Scenarios, and Sign Out returns to Welcome', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText('Scenarios')).toBe(true);
  await act(async () => {
    byLabel('Open menu').props.onPress();
  });
  await act(async () => {
    byLabel('SETTINGS').props.onPress();
  });
  await act(async () => {
    byLabel('Sign Out').props.onPress();
  });
  expect(hasText('Sign in to continue your journey')).toBe(true);
});

test('drawer opens DNA and returns to Scenarios', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  // Stacked screens stay mounted; the top screen renders last.
  const top = (label: string) => {
    const matches = root.findAll(
      n => n.props.accessibilityLabel === label && n.props.onPress,
    );
    return matches[matches.length - 1];
  };
  const selected = (label: string) =>
    top(label).props.accessibilityState.selected;

  await act(async () => {
    top('Open menu').props.onPress();
  });
  expect(selected('SCENARIOS')).toBe(true);
  expect(selected('DNA')).toBe(false);
  await act(async () => {
    top('DNA').props.onPress();
  });
  expect(hasText('PSYCHOLOGICAL MATRIX')).toBe(true);

  await act(async () => {
    top('Open menu').props.onPress();
  });
  expect(selected('DNA')).toBe(true);
  await act(async () => {
    top('SCENARIOS').props.onPress();
  });
  expect(hasText('PSYCHOLOGICAL MATRIX')).toBe(false);
  expect(hasText('Scenarios')).toBe(true);
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

test('Home lists Iraq War and Cuban Missile Crisis; only Iraq War starts', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText('Iraq War')).toBe(true);
  expect(hasText('Cuban Missile Crisis (1962)')).toBe(true);
  expect(hasText('1:37 min')).toBe(true);
  expect(hasText('1:25 min')).toBe(true);
  expect(hasText('Apollo 13')).toBe(false);

  // The carousel repeats each card, so take the first of each.
  const startButton = (title: string) =>
    root.findAll(
      n => n.props.accessibilityLabel === `Start ${title}` && n.props.onPress,
    )[0];
  expect(startButton('Cuban Missile Crisis (1962)').props.disabled).toBe(true);
  expect(startButton('Iraq War').props.disabled).toBe(false);

  await act(async () => {
    startButton('Iraq War').props.onPress();
  });
  expect(hasText('President of the United States · Decision 1 of 2')).toBe(
    true,
  );
});
