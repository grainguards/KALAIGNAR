import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import enLocale from '../locales/en.json';
import taLocale from '../locales/ta.json';
import hiLocale from '../locales/hi.json';
import bnLocale from '../locales/bn.json';
import teLocale from '../locales/te.json';
import mrLocale from '../locales/mr.json';
import guLocale from '../locales/gu.json';
import knLocale from '../locales/kn.json';
import mlLocale from '../locales/ml.json';
import paLocale from '../locales/pa.json';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechLocale: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN', script: 'Latin' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN', script: 'Tamil' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN', script: 'Bengali' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN', script: 'Telugu' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN', script: 'Devanagari' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN', script: 'Gujarati' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN', script: 'Malayalam' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN', script: 'Gurmukhi' },
];

export const getSpeechLocale = (langCode: string): string => {
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  return match ? match.speechLocale : 'en-IN';
};

const localesMap: Record<string, any> = {
  en: enLocale,
  ta: taLocale,
  hi: hiLocale,
  bn: bnLocale,
  te: teLocale,
  mr: mrLocale,
  gu: guLocale,
  kn: knLocale,
  ml: mlLocale,
  pa: paLocale,
};

// Build an automatic reverse index from English text -> dot key path
// e.g. "Total Views" -> "dashboard.totalViews", "Save" -> "common.save"
const englishPhraseToKey: Record<string, string> = {};
function indexEnglishPhrases(obj: any, prefix = '') {
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      indexEnglishPhrases(obj[k], fullKey);
    } else if (typeof obj[k] === 'string') {
      const phrase = obj[k].trim();
      englishPhraseToKey[phrase] = fullKey;
      englishPhraseToKey[phrase.toLowerCase()] = fullKey;
    }
  }
}
indexEnglishPhrases(enLocale);

// Direct key aliases for common navigation and status terms
englishPhraseToKey['Home'] = 'nav.home';
englishPhraseToKey['Dashboard'] = 'nav.dashboard';
englishPhraseToKey['Products'] = 'nav.products';
englishPhraseToKey['Buyers'] = 'nav.buyers';
englishPhraseToKey['Profile'] = 'nav.profile';
englishPhraseToKey['Orders'] = 'nav.orders';
englishPhraseToKey['Marketplace'] = 'nav.marketplace';
englishPhraseToKey['Opportunities'] = 'nav.opportunities';
englishPhraseToKey['Messages'] = 'nav.messages';
englishPhraseToKey['Raw Materials'] = 'nav.rawMaterials';
englishPhraseToKey['Craft Map'] = 'nav.craftMap';
englishPhraseToKey['Add Product'] = 'nav.addProduct';
englishPhraseToKey['My Catalog'] = 'nav.myCatalog';
englishPhraseToKey['PUBLISHED'] = 'catalog.published';
englishPhraseToKey['DRAFT'] = 'catalog.draft';
englishPhraseToKey['UNLISTED'] = 'catalog.unlisted';
englishPhraseToKey['Stock:'] = 'catalog.stockLabel';
englishPhraseToKey['Artisan'] = 'roles.artisan';
englishPhraseToKey['Buyer'] = 'roles.buyer';
englishPhraseToKey['Govt'] = 'roles.govt';
englishPhraseToKey['Govt Official'] = 'roles.govt';

interface LangState {
  lang: string;
  setLang: (lang: string) => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: 'en',
  setLang: (lang: string) => set({ lang }),
}));

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params || !text) return text;
  return Object.entries(params).reduce((acc, [key, val]) => {
    return acc
      .replace(new RegExp(`\\{${key}\\}`, 'g'), String(val))
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }, text);
}

export function useTranslation() {
  const lang = useLangStore((state) => state.lang);
  const setLang = useLangStore((state) => state.setLang);

  useEffect(() => {
    AsyncStorage.getItem('preferredLanguage').then((saved) => {
      if (saved && localesMap[saved]) {
        setLang(saved);
      }
    });
  }, [setLang]);

  const t = (keyOrPhrase: string, params?: Record<string, string | number>): string => {
    if (!keyOrPhrase || typeof keyOrPhrase !== 'string') return '';

    const currentLocale = localesMap[lang] || localesMap['en'];
    const enLocaleObj = localesMap['en'];

    // 1. Direct key lookup (e.g. "common.save", "dashboard.totalViews")
    let result = getNestedValue(currentLocale, keyOrPhrase);

    // 2. If not found by key, check if this is an English phrase mapped to a key
    if (!result) {
      const mappedKey = englishPhraseToKey[keyOrPhrase] || englishPhraseToKey[keyOrPhrase.trim()] || englishPhraseToKey[keyOrPhrase.trim().toLowerCase()];
      if (mappedKey) {
        result = getNestedValue(currentLocale, mappedKey);
      }
    }

    // 3. Fallback to English locale if still not resolved in non-English language
    if (!result && lang !== 'en') {
      result = getNestedValue(enLocaleObj, keyOrPhrase);
      if (!result) {
        const mappedKey = englishPhraseToKey[keyOrPhrase] || englishPhraseToKey[keyOrPhrase.trim()];
        if (mappedKey) {
          result = getNestedValue(enLocaleObj, mappedKey);
        }
      }
    }

    // 4. Missing key handling: fallback to raw text but warn in DEV
    if (!result) {
      if (__DEV__ && lang !== 'en') {
        console.warn(`[i18n] Missing translation for key: "${keyOrPhrase}" in language: "${lang}"`);
      }
      result = keyOrPhrase;
    }

    // 5. String interpolation
    return interpolate(result, params);
  };

  const changeLanguage = async (newLang: string) => {
    if (localesMap[newLang]) {
      setLang(newLang);
      await AsyncStorage.setItem('preferredLanguage', newLang);

      // Best effort backend profile sync if user token exists
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          fetch('http://localhost:4000/api/auth/preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preferred_language: newLang }),
          }).catch(() => {});
        }
      } catch (e) {
        // Silently continue
      }
    }
  };

  return {
    t,
    lang,
    currentLanguage: lang,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getSpeechLocale: () => getSpeechLocale(lang),
  };
}
