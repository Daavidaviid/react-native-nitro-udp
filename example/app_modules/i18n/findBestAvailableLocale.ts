import * as Localization from 'expo-localization';

import { locales } from './locales';

export const DEFAULT_LOCALE = 'en';

export const findBestAvailableLocale = () => {
  const availableLanguages = Object.keys(locales);

  const bestLanguage = Localization.getLocales()
    .map(locale => locale.languageCode)
    .filter((languageCode): languageCode is string => !!languageCode)
    .find(languageCode => availableLanguages.includes(languageCode));

  return bestLanguage || DEFAULT_LOCALE;
};
