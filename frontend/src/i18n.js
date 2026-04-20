import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';
import hiTranslation from './locales/hi.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ta: {
    translation: taTranslation
  },
  hi: {
    translation: hiTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Get language from localStorage or default to English
    fallbackLng: 'en',
    keySeparator: '.', // Use dots to navigate nested keys
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
