import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_LANGUAGE,
  DICTIONARIES,
  Language,
  Localized,
  TranslationKey,
} from '../locales';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Dictionary lookup; `params` fill `{name}` placeholders. */
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  /** Picks the current language from copy kept with the content data. */
  localize: (text: Localized) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * App language (English by default, or Turkish). Changing it re-renders
 * every screen using `useTranslation` in place, with no reload, so
 * navigation and simulation state are kept. Held in memory only: there is
 * no storage, so it resets to English when the app restarts.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = DICTIONARIES[language];
    return {
      language,
      setLanguage,
      t: (key, params) =>
        params
          ? dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) =>
              name in params ? params[name] : match,
            )
          : dictionary[key],
      localize: text => text[language],
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useTranslation must be used inside LanguageProvider');
  }
  return value;
}
