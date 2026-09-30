import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Animated, Image, Pressable, StyleSheet } from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { usePressScale } from '../hooks';

const SIZE = 40;
// Exported black; tinted to the icon color.
const ICON_SIZE = 16;

const arrowIcon = require('../assets/images/icon-back.png');

/** Circular top-left back button used on the auth screens. */
export function BackButton() {
  const navigation = useNavigation();
  const press = usePressScale();
  const { t } = useTranslation();
  const goBack = () => {
    // Nothing to return to, e.g. after a reset or a deep link.
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('goBack')}
        hitSlop={8}
        onPress={goBack}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={styles.button}
      >
        <Image source={arrowIcon} style={styles.icon} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.inputFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    tintColor: colors.backButtonIcon,
  },
});
