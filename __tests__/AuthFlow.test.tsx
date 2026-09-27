/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';

import App from '../App';
import { RESET_BUTTON_LABEL } from '../src/screens/ResetPasswordScreen';
import {
  INVALID_EMAIL_MESSAGE,
  PASSWORD_RULES,
  SHORT_NAME_MESSAGE,
} from '../src/utils/validation';

const { act } = ReactTestRenderer;

let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
let root: ReactTestInstance;

const textOf = (children: unknown): string =>
  Array.isArray(children) ? children.map(textOf).join('') : String(children);

const hasText = (text: string) =>
  root.findAll(
    n => typeof n.type === 'string' && textOf(n.props.children) === text,
  ).length > 0;

// Screens below the top of the stack stay mounted; the top one renders last.
const byLabel = (label: string) =>
  root
    .findAll(
      n =>
        n.props.accessibilityLabel === label &&
        (n.props.onPress !== undefined || n.props.onChangeText !== undefined),
    )
    .at(-1)!;

// Text links have no accessibility label; find them by their text.
const link = (text: string) =>
  root
    .findAll(
      n =>
        n.props.accessibilityRole === 'link' &&
        n.props.onPress !== undefined &&
        textOf(n.props.children) === text,
    )
    .at(-1)!;

const press = async (node: ReactTestInstance) => {
  await act(async () => {
    node.props.onPress();
  });
};

const type = async (label: string, text: string) => {
  await act(async () => {
    byLabel(label).props.onChangeText(text);
  });
};

const blur = async (label: string) => {
  await act(async () => {
    byLabel(label).props.onBlur({});
  });
};

async function openSignIn() {
  await act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  root = renderer!.root;
  await press(byLabel('Continue with Email'));
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

test('Back button returns from Sign In to Welcome', async () => {
  await openSignIn();
  await press(byLabel('Go back'));
  expect(hasText('Sign in to continue your journey')).toBe(true);
});

test('Forgot password -> Reset -> Check Your Email -> Sign In', async () => {
  await openSignIn();
  await press(link('Forgot password?'));
  expect(hasText('Reset your password')).toBe(true);
  expect(byLabel(RESET_BUTTON_LABEL).props.accessibilityState.disabled).toBe(
    true,
  );

  await type('Email address', 'john');
  await press(byLabel(RESET_BUTTON_LABEL));
  expect(hasText(INVALID_EMAIL_MESSAGE)).toBe(true);

  await type('Email address', 'johndoe@mail.com');
  await press(byLabel(RESET_BUTTON_LABEL));
  expect(hasText('Check Your Email')).toBe(true);
  // The email is a nested bold Text inside the message.
  expect(hasText('johndoe@mail.com')).toBe(true);

  await press(byLabel('Back to Sign in'));
  expect(hasText('Sign in with Email')).toBe(true);
  expect(hasText('Check Your Email')).toBe(false);
});

test('Sign up opens Create Account and Sign in returns', async () => {
  await openSignIn();
  await press(link('Sign up'));
  expect(hasText('Create your Fateful Moment Account')).toBe(true);
  await press(link('Sign in'));
  expect(hasText('Sign in with Email')).toBe(true);
  expect(hasText('Create your Fateful Moment Account')).toBe(false);
});

test('Create Account validates name and password rules', async () => {
  await openSignIn();
  await press(link('Sign up'));
  const signUp = () => byLabel('Sign up').props.accessibilityState.disabled;

  await type('Full name', 'J D');
  await blur('Full name');
  expect(hasText(SHORT_NAME_MESSAGE)).toBe(false); // "J D" has 3 characters
  await type('Full name', 'JD');
  await blur('Full name');
  expect(hasText(SHORT_NAME_MESSAGE)).toBe(true);

  await type('Full name', 'John Doe');
  await type('Email address', 'johndoe@mail.com');
  await type('Password', 'Johd');
  expect(hasText(PASSWORD_RULES[0].label)).toBe(true);
  expect(signUp()).toBe(true);

  await type('Password', 'Johndoe1');
  expect(signUp()).toBe(false);
});

test('Sign up starts a mock session and opens Scenarios', async () => {
  await openSignIn();
  await press(link('Sign up'));
  await type('Full name', 'Jane Roe');
  await type('Email address', 'jane@mail.com');
  await type('Password', 'Janeroe1');
  await press(byLabel('Sign up'));
  expect(byLabel('Sign up').props.accessibilityState.busy).toBe(true);
  await act(async () => {
    jest.runAllTimers();
  });
  expect(hasText('Scenarios')).toBe(true);
  expect(hasText('30 Scenarios')).toBe(true);
});
