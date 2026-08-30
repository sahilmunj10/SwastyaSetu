import { en } from './en';
import { mr } from './mr';
import { hi } from './hi';

export type LanguageCode = 'en' | 'mr' | 'hi';

export const translations = {
  en,
  mr,
  hi
};

export function getTranslation(lang: LanguageCode) {
  return translations[lang] || translations.en;
}
