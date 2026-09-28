import { en } from './en';
import { tr } from './tr';

export type Language = 'en' | 'tr';

export const DEFAULT_LANGUAGE: Language = 'en';

/** Selector options, each named in its own language. */
export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English (EN)' },
  { code: 'tr', label: 'Türkçe (TR)' },
];

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;

export const DICTIONARIES: Record<Language, Dictionary> = { en, tr };

/**
 * Copy kept with the content data (scenario titles, decision options),
 * one string per language.
 */
export type Localized = Record<Language, string>;
