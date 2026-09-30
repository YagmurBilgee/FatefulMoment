import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '../context/LanguageContext';
import { LANGUAGES, TranslationKey } from '../locales';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useScenarioProgress } from '../state/ScenarioProgress';
import { colors } from '../theme/colors';
import { androidTextFix, fonts } from '../theme/typography';

const DRAWER_WIDTH = 256;
const ITEM_WIDTH = 208;
const ITEM_HEIGHT = 45.5;
const ITEM_GAP = 16;
const HAIRLINE = 0.76;
const DOT_SIZE = 6;
const ICON_BOX = 20;
// Button list offset from the panel's top edge. Fixed, not added to the top
// inset, which is 0 in landscape anyway.
const LIST_TOP = 103.23;
// (256 - 208) / 2: the buttons sit 24pt from both panel edges.
const LIST_SIDE = (DRAWER_WIDTH - ITEM_WIDTH) / 2;

// White on transparent so they can be tinted.
const ICONS = {
  SCENARIOS: {
    source: require('../assets/images/icon-drawer-scenarios.png'),
    size: 60 / 3,
  },
  DNA: {
    source: require('../assets/images/icon-drawer-dna.png'),
    size: 48 / 3,
  },
  SETTINGS: {
    source: require('../assets/images/icon-drawer-settings.png'),
    size: 60 / 3,
  },
} satisfies Record<string, { source: ImageSourcePropType; size: number }>;

const DURATION = 240;
// Extra travel so the shadow is off screen too when closed.
const SHADOW_RADIUS = 16;

export type DrawerRoute = 'SCENARIOS' | 'DNA' | 'SETTINGS';

const TITLES: Record<DrawerRoute, TranslationKey> = {
  SCENARIOS: 'drawerScenarios',
  DNA: 'drawerDna',
  SETTINGS: 'drawerSettings',
};

type NavigationDrawerProps = {
  visible: boolean;
  /** Item for the screen the drawer is opened from. */
  activeRoute: DrawerRoute;
  onClose: () => void;
};

type ItemProps = {
  route: DrawerRoute;
  active?: boolean;
  expanded?: boolean;
  onPress: () => void;
};

/**
 * 20×20 icon slot. If the image fails to load the slot stays empty, so the
 * label does not shift.
 */
function DrawerIcon({ route, color }: { route: DrawerRoute; color: string }) {
  const [failed, setFailed] = useState(false);
  const { source, size } = ICONS[route];
  return (
    <View style={styles.iconBox}>
      {failed ? null : (
        <Image
          source={source}
          resizeMode="contain"
          onError={() => setFailed(true)}
          style={{ width: size, height: size, tintColor: color }}
        />
      )}
    </View>
  );
}

function DrawerItem({ route, active = false, expanded, onPress }: ItemProps) {
  const { t } = useTranslation();
  const label = t(TITLES[route]);
  const color = active ? colors.primary : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, expanded }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active ? styles.itemActive : styles.itemInactive,
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.itemLead}>
        <DrawerIcon route={route} color={color} />
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      {active ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

/**
 * Left navigation drawer for the landscape screens. Render it last inside the
 * screen root so it overlays the header too. It slides in over a dimmed
 * backdrop; tapping the backdrop or Android Back closes it.
 */
export function NavigationDrawer({
  visible,
  activeRoute,
  onClose,
}: NavigationDrawerProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { resetProgress } = useScenarioProgress();
  const { language, setLanguage, t } = useTranslation();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  // Stays mounted until the close animation has finished.
  const [mounted, setMounted] = useState(visible);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // The panel grows by the left inset so the 256pt design width sits beside
  // a notch rather than under it.
  const width = DRAWER_WIDTH + insets.left;

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      setSettingsOpen(false);
    }
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: DURATION,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
      }
    });
    return () => animation.stop();
  }, [visible, progress]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [visible, onClose]);

  if (!mounted) {
    return null;
  }

  const openScenarios = () => {
    onClose();
    if (activeRoute === 'SCENARIOS') {
      return;
    }
    // Scenarios is the root of the signed-in stack; return to it.
    const scenarios = navigation
      .getState()
      .routes.find(route => route.name === 'Scenarios');
    if (scenarios) {
      navigation.popTo(
        'Scenarios',
        scenarios.params as RootStackParamList['Scenarios'],
      );
    } else {
      // Nothing to pop back to (e.g. a stack restored by Fast Refresh with
      // only this screen): make Scenarios the root instead.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Scenarios', params: {} }],
      });
    }
  };

  const openDna = () => {
    onClose();
    if (activeRoute !== 'DNA') {
      navigation.navigate('DnaProfile', {});
    }
  };

  const signOut = () => {
    onClose();
    resetProgress();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-(width + SHADOW_RADIUS), 0],
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('closeMenu')}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.panel,
          {
            width,
            paddingLeft: insets.left + LIST_SIDE,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.items}>
          <DrawerItem
            route="SCENARIOS"
            active={activeRoute === 'SCENARIOS'}
            onPress={openScenarios}
          />
          <DrawerItem
            route="DNA"
            active={activeRoute === 'DNA'}
            onPress={openDna}
          />
          <DrawerItem
            route="SETTINGS"
            active={activeRoute === 'SETTINGS'}
            expanded={settingsOpen}
            onPress={() => setSettingsOpen(open => !open)}
          />
          {/* Placeholder until Settings is designed. */}
          {settingsOpen ? (
            <View style={styles.settings}>
              <Text style={styles.settingsLabel}>{t('language')}</Text>
              <View style={styles.languages} accessibilityRole="radiogroup">
                {LANGUAGES.map(({ code, label }) => {
                  const selected = code === language;
                  return (
                    <Pressable
                      key={code}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      accessibilityState={{ checked: selected }}
                      onPress={() => setLanguage(code)}
                      style={[
                        styles.language,
                        selected && styles.languageSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageLabel,
                          selected && styles.languageLabelSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('signOut')}
                onPress={signOut}
                style={styles.signOut}
              >
                <Text style={styles.signOutLabel}>{t('signOut')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.drawerBackdrop,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    paddingTop: LIST_TOP,
    paddingRight: LIST_SIDE,
    backgroundColor: colors.drawerBackground,
    borderRightWidth: HAIRLINE,
    borderRightColor: colors.drawerBorder,
    // Lifts the panel off the landscape screen behind it.
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: SHADOW_RADIUS,
    elevation: 16,
  },
  items: {
    gap: ITEM_GAP,
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  itemActive: {
    backgroundColor: colors.drawerItemActiveFill,
    borderWidth: HAIRLINE,
    borderColor: colors.primary,
  },
  itemInactive: {
    backgroundColor: colors.drawerItemFill,
    borderTopWidth: HAIRLINE,
    borderTopColor: colors.drawerItemBorder,
  },
  itemPressed: {
    opacity: 0.8,
  },
  itemLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Color is set per state.
  label: {
    ...androidTextFix,
    fontFamily: fonts.bold, // 700
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    textAlignVertical: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  // Settings panel, styled after the drawer items.
  settings: {
    width: ITEM_WIDTH,
    marginTop: -ITEM_GAP / 2,
    paddingHorizontal: 4,
    gap: 8,
  },
  settingsLabel: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  languages: {
    flexDirection: 'row',
    gap: 8,
  },
  language: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    borderWidth: HAIRLINE,
    borderColor: colors.drawerItemBorder,
    backgroundColor: colors.drawerItemFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageSelected: {
    borderColor: colors.primary, // #00D3F3
    backgroundColor: colors.drawerItemActiveFill,
  },
  languageLabel: {
    ...androidTextFix,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  languageLabelSelected: {
    color: colors.primary,
  },
  signOut: {
    paddingVertical: 8,
  },
  signOutLabel: {
    ...androidTextFix,
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
