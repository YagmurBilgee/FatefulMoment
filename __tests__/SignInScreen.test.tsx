/**
 * @format
 */

import React from 'react';
import { Alert } from 'react-native';
import ReactTestRenderer, { ReactTestInstance } from 'react-test-renderer';

import App from '../App';
import { MOCK_USER } from '../src/services/mockAuth';
import { en } from '../src/locales/en';
import { WRONG_PASSWORD_MESSAGE } from '../src/screens/SignInScreen';
import { SELECT_HOLD_MS } from '../src/screens/SimulationScreen';
import { VIDEOS } from '../src/components/ScenarioVideo';
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

// Iraq War options; the decision screen shows no question text (Figma),
// so the options identify it. The review offers the same cards again.
const DECISION_1 = 'Wait for Signal from Moscow';
const DECISION_2 =
  'Naval Quarantine: Blockade Cuba and stop Soviet ships while negotiating in secret.';

const video = () =>
  root.findAll(
    n =>
      typeof n.type === 'string' &&
      n.props.testID === 'scenario-video' &&
      n.props.onEnd,
  );

/** Plays the (mocked) scenario clip to its end. */
const endVideo = () =>
  act(async () => {
    video()[0].props.onEnd();
  });

// Runs the (fake) clock forward so animations and timeouts such as the
// card glow hold and the step fades finish.
const wait = (ms: number) =>
  act(async () => {
    jest.advanceTimersByTime(ms);
  });

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

test('Home lists both scenarios active until one is completed', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  expect(hasText('Iraq War')).toBe(true);
  expect(hasText('Cuban Missile Crisis (1962)')).toBe(true);
  expect(hasText('1:37 min')).toBe(true);
  expect(hasText('1:25 min')).toBe(true);
  expect(hasText('Apollo 13')).toBe(false);

  // Stacked screens stay mounted and the carousel repeats each card, so
  // take the first match; `top` picks the topmost screen's control.
  const startButton = (title: string) =>
    root.findAll(
      n => n.props.accessibilityLabel === `Start ${title}` && n.props.onPress,
    )[0];
  const top = (label: string) => {
    const matches = root.findAll(
      n => n.props.accessibilityLabel === label && n.props.onPress,
    );
    return matches[matches.length - 1];
  };
  expect(startButton('Iraq War').props.disabled).toBe(false);
  expect(startButton('Cuban Missile Crisis (1962)').props.disabled).toBe(false);

  await act(async () => {
    startButton('Iraq War').props.onPress();
  });
  expect(hasText('Scenario Briefing')).toBe(true);
  await act(async () => {
    byLabel('Start Simulation').props.onPress();
  });
  // Video phase: the clip and Back only; nothing moves on until it ends.
  expect(video()).toHaveLength(1);
  expect(video()[0].props.source).toBe(VIDEOS['iraq-war']);
  expect(top('Skip video')).toBeUndefined();
  expect(hasText(DECISION_1)).toBe(false);
  await wait(30000);
  expect(hasText(DECISION_1)).toBe(false);
  await endVideo();
  expect(hasText(DECISION_1)).toBe(true);
  expect(hasText('Signal US Ships with Sonar')).toBe(true);
  // The intro clip is gone after the cross-fade.
  await wait(1300);
  expect(video()).toHaveLength(0);
  await act(async () => {
    top(DECISION_1).props.onPress();
  });
  // The picked card glows, then its consequence clip plays; the next
  // question waits for the clip to end.
  await wait(SELECT_HOLD_MS + 1200);
  expect(video()).toHaveLength(1);
  expect(video()[0].props.source).toBe(VIDEOS['iraq-war-2']);
  expect(hasText('Unselected Options')).toBe(false);
  await endVideo();
  // Consequence review: the same cards, the first pick locked and badged,
  // no timer.
  expect(hasText('Unselected Options')).toBe(true);
  expect(hasText('Your Choice')).toBe(true);
  expect(top(DECISION_1).props.disabled).toBe(true);
  expect(top(DECISION_1).props.accessibilityState.selected).toBe(true);
  expect(top(DECISION_2).props.disabled).toBe(false);
  await wait(1200 + 15000);
  expect(hasText('Unselected Options')).toBe(true);
  await act(async () => {
    top(DECISION_2).props.onPress();
  });
  await wait(SELECT_HOLD_MS + 1200);
  expect(video()).toHaveLength(1);
  expect(video()[0].props.source).toBe(VIDEOS['iraq-war-3']);
  // The cards are gone once the cross-fade into the clip completes.
  await wait(100);
  expect(hasText('Unselected Options')).toBe(false);
  expect(hasText('PSYCHOLOGICAL MATRIX')).toBe(false);
  await endVideo();
  expect(hasText('PSYCHOLOGICAL MATRIX')).toBe(true);

  await act(async () => {
    top('Open menu').props.onPress();
  });
  await act(async () => {
    top('SCENARIOS').props.onPress();
  });
  expect(hasText('PSYCHOLOGICAL MATRIX')).toBe(false);
  expect(startButton('Iraq War').props.disabled).toBe(true);
  expect(startButton('Cuban Missile Crisis (1962)').props.disabled).toBe(false);
});

test('running out of decision time moves on to the review', async () => {
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  await act(async () => {
    // The carousel repeats cards; only the first Iraq War is playable.
    root
      .findAll(
        n => n.props.accessibilityLabel === 'Start Iraq War' && n.props.onPress,
      )[0]
      .props.onPress();
  });
  await act(async () => {
    byLabel('Start Simulation').props.onPress();
  });
  await endVideo();
  expect(hasText(DECISION_1)).toBe(true);
  // Cross-fade, the full 15 s window, then the decision's clip fades in.
  await wait(1200 + 15000 + 1300);
  expect(hasText(DECISION_1)).toBe(false);
  expect(video()).toHaveLength(1);
  expect(video()[0].props.source).toBe(VIDEOS['iraq-war-2']);
  await endVideo();
  // Nothing was picked, so no card is badged and all five stay open.
  expect(hasText('Unselected Options')).toBe(true);
  expect(hasText('Your Choice')).toBe(false);
  expect(
    root
      .findAll(
        n => n.props.accessibilityLabel === DECISION_1 && n.props.onPress,
      )
      .pop()!.props.disabled,
  ).toBe(false);
});

test('Settings switches the language in place, keeping state', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  const first = (label: string) =>
    root.findAll(
      n => n.props.accessibilityLabel === label && n.props.onPress,
    )[0];
  expect(hasText('Scenarios')).toBe(true);

  await act(async () => {
    first('Open menu').props.onPress();
  });
  await act(async () => {
    first('SETTINGS').props.onPress();
  });
  expect(first('English (EN)').props.accessibilityState.checked).toBe(true);
  await act(async () => {
    first('Türkçe (TR)').props.onPress();
  });

  // Home, the drawer and the cards re-render in Turkish; the drawer and
  // its Settings panel stay open.
  expect(first('Türkçe (TR)').props.accessibilityState.checked).toBe(true);
  expect(hasText('Senaryolar')).toBe(true);
  expect(hasText('SENARYOLAR')).toBe(true);
  expect(hasText('Dil')).toBe(true);
  expect(hasText('Çıkış Yap')).toBe(true);
  expect(hasText('Irak Savaşı')).toBe(true);
  expect(hasText('Scenarios')).toBe(false);
  await act(async () => {
    first('Menüyü kapat').props.onPress();
  });
  await act(async () => {
    first('Küba Füze Krizi (1962) Başlat').props.onPress();
  });
  expect(alert).toHaveBeenCalledWith('Yakında Gelecek', expect.any(String));

  // The simulation follows the language too.
  await act(async () => {
    first('Irak Savaşı Başlat').props.onPress();
  });
  expect(hasText('Senaryo Brifingi')).toBe(true);
  await act(async () => {
    byLabel('Simülasyonu Başlat').props.onPress();
  });
  await endVideo();
  expect(hasText("Moskova'dan Sinyal Bekle")).toBe(true);
  expect(hasText(DECISION_1)).toBe(false);
  alert.mockRestore();
});

test('cards after the first show a coming soon alert and stay on Home', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await openSignIn();
  await type('Email address', MOCK_USER.email);
  await type('Password', MOCK_USER.password);
  await submit();
  // The carousel repeats each card; take the first.
  const first = (label: string) =>
    root.findAll(
      n => n.props.accessibilityLabel === label && n.props.onPress,
    )[0];

  await act(async () => {
    first('Start Cuban Missile Crisis (1962)').props.onPress();
  });
  await act(async () => {
    first('Cuban Missile Crisis (1962)').props.onPress();
  });
  // Card 3 repeats Iraq War but must not open the simulation.
  const card3 = root.findAll(
    n => n.props.accessibilityLabel === 'Start Iraq War' && n.props.onPress,
  )[1];
  await act(async () => {
    card3.props.onPress();
  });
  expect(alert).toHaveBeenCalledTimes(3);
  expect(alert).toHaveBeenCalledWith(en.comingSoonTitle, en.comingSoonMessage);
  expect(hasText('This scenario is coming soon.')).toBe(false);
  expect(hasText('30 Scenarios')).toBe(true);
  alert.mockRestore();
});
