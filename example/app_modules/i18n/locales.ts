import en from './dictionaries/en.json';

export const locales = {
  en: { translation: en },
  // fr: { translation: fr },
  // es: { translation: es },
  // 'pt-BR': { translation: pt_BR },
};

export type Locales = typeof locales;
