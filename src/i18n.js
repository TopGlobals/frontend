import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';

const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('cryovigil_locale') : null;
const initialLocale = savedLocale && ['en', 'es'].includes(savedLocale) ? savedLocale : 'en';

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { en, es },
});

export default i18n;
