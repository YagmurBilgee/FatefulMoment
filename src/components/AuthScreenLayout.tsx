import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { BackButton } from './BackButton';

type AuthScreenLayoutProps = {
  children: ReactNode;
  /** Renders the circular back button in the top-left corner. */
  showBack?: boolean;
  /** Pinned to the bottom of the screen (e.g. "No account yet? Sign up"). */
  footer?: ReactNode;
};

/**
 * Scrollable, keyboard-aware page used by the auth screens. Content scrolls
 * with the keyboard open, as in the Figma "Writing ..." frames.
 */
export function AuthScreenLayout({
  children,
  showBack = false,
  footer,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    // Android runs edge-to-edge, so the window is not resized for the
    // keyboard (adjustResize has no effect); pad on both platforms.
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {showBack ? (
            <View style={styles.backButton}>
              <BackButton />
            </View>
          ) : null}
          {children}
        </View>
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 19, // est.
    left: 0,
    zIndex: 1,
  },
});
