import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

// Figma @3x export, 60×60px.
const menuIcon = require('../assets/images/icon-menu-hamburger.png');

type MenuButtonProps = {
  /** Whether the drawer it controls is open. */
  expanded: boolean;
  onPress: () => void;
};

/** Top-left hamburger button that opens the navigation drawer. */
export function MenuButton({ expanded, onPress }: MenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      accessibilityState={{ expanded }}
      hitSlop={8}
      onPress={onPress}
      style={styles.button}
    >
      <Image source={menuIcon} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  icon: {
    width: 60 / 3,
    height: 60 / 3,
  },
});
