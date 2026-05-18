'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { getLang, setLang as persistLang, I18N as FALLBACK_I18N, type Lang } from './i18n';

interface I18nContextValue {
  lang: Lang;
  switchLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  switchLang: () => {},
  t: (key) => key,
});

interface I18nProviderProps {
  children: ReactNode;
  dictionaries?: Record<Lang, Record<string, string>>;
}

export function I18nProvider({ children, dictionaries }: I18nProviderProps) {
  const [lang, setLangState] = useState<Lang>('en');

  // Merge CMS dictionaries over fallback
  const merged: Record<Lang, Record<string, string>> = {
    en: { ...FALLBACK_I18N.en, ...dictionaries?.en },
    sk: { ...FALLBACK_I18N.sk, ...dictionaries?.sk },
  };

  useEffect(() => {
    setLangState(getLang());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const switchLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    persistLang(newLang);
  }, []);

  const t = useCallback(
    (key: string) => merged[lang]?.[key] ?? merged.en[key] ?? key,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, dictionaries],
  );

  return (
    <I18nContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
