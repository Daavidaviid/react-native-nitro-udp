'use client';

import 'intl-pluralrules';

import type { LanguageDetectorAsyncModule } from 'i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { mmkvStorage } from '@/app_modules/storage/mmkvStorage';
import { checkIfIsServer } from '@/app_modules/web/checkIfIsServer';

import { findBestAvailableLocale } from './findBestAvailableLocale';
import { locales } from './locales';

export const defaultLanguage = findBestAvailableLocale();

export const currentLanguage = i18n.language || defaultLanguage;

const useLanguageStorage: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    if (checkIfIsServer()) return;

    const lang = mmkvStorage.getItem('language');

    if (lang) {
      return callback(lang);
    }
  },
  init: () => null,
  cacheUserLanguage: async (language: string) => {
    if (checkIfIsServer()) return;
    mmkvStorage.setItem('language', language);
  },
};

i18n
  .use(useLanguageStorage)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    resources: locales,
    react: {
      useSuspense: false,
    },
  });

export const i18next = i18n;
