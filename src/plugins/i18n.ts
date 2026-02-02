import { createI18n } from 'vue-i18n'
import en from '../locales/en'
import pt from '../locales/pt'

const messages = {
  en,
  pt,
}

function getBrowserLocale (options: string[]): string | undefined {
  const defaultLocale = 'en'

  // Check localStorage first
  const storedLocale = localStorage.getItem('user_locale')
  if (storedLocale && options.includes(storedLocale)) {
    return storedLocale
  }

  // Check browser language
  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.language.split('-')[0]
    if (options.includes(browserLocale)) {
      return browserLocale
    }
  }

  return defaultLocale
}

const startingLocale = getBrowserLocale(Object.keys(messages))

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: startingLocale,
  fallbackLocale: 'en',
  messages,
})

export default i18n
