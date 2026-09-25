import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

/*
 * Measured from the Sign in frames (~0.66x exports). All values are
 * estimates until confirmed in Figma inspect.
 */
const HEIGHT = 56; // est.
const RADIUS = 16; // est.
const PADDING_X = 16; // est.
const ICON_SIZE = 20; // est.

export type FMTextInputProps = Omit<TextInputProps, 'style' | 'ref'> & {
  ref?: React.Ref<TextInputInstance>;
  /** Shown below the field with a red border; `undefined` means no error. */
  error?: string;
  /** Adds a show/hide toggle and starts with the value hidden. */
  password?: boolean;
  /** Optional leading icon, e.g. the mail icon on Reset Password. */
  leftIcon?: ImageSourcePropType;
};

/*
 * Pending: eye / eye-slash icon assets from Figma. Until they are provided the
 * toggle keeps its touch target and accessibility label but draws no glyph.
 */
const visibilityIcons: {
  show?: ImageSourcePropType;
  hide?: ImageSourcePropType;
} = {};

/**
 * Text field with the auth flow states: empty, focused or filled (cyan
 * border), and error (red border + message).
 *
 * The error message is positioned below the field without affecting layout,
 * matching Figma where fields do not move when an error appears. Leave at
 * least 24pt below the field for it.
 */
export function FMTextInput({
  error,
  password = false,
  leftIcon,
  value,
  onFocus,
  onBlur,
  ref,
  ...rest
}: FMTextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const hasError = error !== undefined;
  const highlighted = focused || Boolean(value);

  const toggleIcon = hidden ? visibilityIcons.show : visibilityIcons.hide;

  return (
    <View>
      <View
        style={[
          styles.field,
          highlighted && styles.fieldHighlighted,
          hasError && styles.fieldError,
        ]}
      >
        {leftIcon ? <Image source={leftIcon} style={styles.leftIcon} /> : null}
        <TextInput
          {...rest}
          ref={ref}
          value={value}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          secureTextEntry={password && hidden}
          autoCapitalize={password ? 'none' : rest.autoCapitalize}
          autoCorrect={password ? false : rest.autoCorrect}
          aria-invalid={hasError}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={12}
            onPress={() => setHidden(h => !h)}
            style={styles.toggle}
          >
            {toggleIcon ? (
              <Image source={toggleIcon} style={styles.toggleIcon} />
            ) : null}
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: HEIGHT,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.inputFill,
    paddingHorizontal: PADDING_X - 1, // keep text inset constant with border
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldHighlighted: {
    borderColor: colors.focusBorder,
  },
  fieldError: {
    borderColor: colors.error,
  },
  leftIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginRight: 12, // est.
  },
  input: {
    ...androidTextFix,
    flex: 1,
    height: '100%',
    padding: 0,
    color: colors.white,
    fontFamily: fonts.regular, // est.: Inter Regular 16
    fontSize: 16,
  },
  toggle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginLeft: 12, // est.
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  error: {
    ...androidTextFix,
    position: 'absolute',
    top: HEIGHT + 8, // est.
    left: 0,
    right: 0,
    color: colors.error,
    fontFamily: fonts.medium, // est.: Inter 10
    fontSize: 10,
    lineHeight: 14,
  },
});
