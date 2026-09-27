import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';
import { BackButton } from './BackButton';

type MainScreenLayoutProps = {
  title: string;
  children: ReactNode;
  showBack?: boolean;
};

/**
 * Temporary page shell for the signed-in screens. Pads all four safe-area
 * edges so it keeps working when these screens move to landscape (notch on
 * the side). Final layout will follow the landscape Figma frames.
 */
export function MainScreenLayout({
  title,
  children,
  showBack = false,
}: MainScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingLeft: insets.left + 24,
          paddingRight: insets.right + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {showBack ? <BackButton /> : null}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    ...androidTextFix,
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
  },
});
