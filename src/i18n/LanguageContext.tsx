import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  formatDate: (dateString: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'fnote_loza_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'am') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
    document.documentElement.lang = language;
    if (language === 'am') {
      document.body.classList.add('amharic-mode');
    } else {
      document.body.classList.remove('amharic-mode');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations.en;
    if (key in langDict) {
      return langDict[key];
    }
    // Fallback to english
    if (key in translations.en) {
      return translations.en[key];
    }
    return key;
  };

  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US', {
      maximumFractionDigits: 0,
    }).format(amount);
    
    return language === 'am' ? `${formatted} ብር` : `${formatted} ETB`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US').format(num);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'am' ? 'am-ET' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
