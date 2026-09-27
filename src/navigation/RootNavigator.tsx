import React from 'react';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type { DnaScore } from '../data/simulation';
import { CheckEmailScreen } from '../screens/CheckEmailScreen';
import { CreateAccountScreen } from '../screens/CreateAccountScreen';
import { DnaProfileScreen } from '../screens/DnaProfileScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ScenariosScreen } from '../screens/ScenariosScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SimulationScreen } from '../screens/SimulationScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { MockProfile } from '../services/mockAuth';
import { colors } from '../theme/colors';

/** Signed-out screens. */
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  CreateAccount: undefined;
  ResetPassword: undefined;
  CheckEmail: { email: string };
};

/** Signed-in screens; entered with `navigation.reset` so Back cannot leave. */
export type MainStackParamList = {
  Scenarios: { user: MockProfile };
  Simulation: { scenarioId: string };
  /** `score` is absent when the profile is opened before playing. */
  DnaProfile: { score?: DnaScore };
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

const Stack = createNativeStackNavigator<RootStackParamList>();

// Dark background everywhere so transitions never flash white.
const theme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

/*
 * One stack with two groups keeps a single dark container. The screens that
 * start each group (Welcome after Sign Out, Scenarios after sign-in) are only
 * reached via `navigation.reset`; they fade in so the Auth <-> Main switch
 * stays clean once the Main group is locked to landscape.
 */
export function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Group>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen
            name="Scenarios"
            component={ScenariosScreen}
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen name="Simulation" component={SimulationScreen} />
          <Stack.Screen name="DnaProfile" component={DnaProfileScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
