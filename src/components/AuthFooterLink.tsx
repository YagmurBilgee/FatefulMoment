import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

type AuthFooterLinkProps = {
  prompt: string;
  linkLabel: string;
  onPress: () => void;
};

/**
 * Bottom prompt such as "No account yet? Sign up".
 *
 * The link is a sibling Text, not nested inside the prompt, so assistive
 * technologies expose it as its own pressable element.
 */
export function AuthFooterLink({
  prompt,
  linkLabel,
  onPress,
}: AuthFooterLinkProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt} </Text>
      <Text
        style={[styles.prompt, styles.link]}
        accessibilityRole="link"
        onPress={onPress}
      >
        {linkLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 24,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  prompt: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    textDecorationLine: 'underline',
  },
});
