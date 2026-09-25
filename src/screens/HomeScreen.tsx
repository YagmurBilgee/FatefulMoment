import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import type { RootScreenProps } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/**
 * Placeholder destination after sign-in. Not part of the Figma design; it
 * only shows the mock profile until the real home screen is designed.
 */
export function HomeScreen({ navigation, route }: RootScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const { user } = route.params;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.profile}>
        <Text style={styles.title} accessibilityRole="header">
          Welcome back, {user.name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <PrimaryButton
        label="Sign Out"
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  profile: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...androidTextFix,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
  },
  email: {
    ...androidTextFix,
    marginTop: 8,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
