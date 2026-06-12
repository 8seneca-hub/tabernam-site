'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { getLang, setLang as persistLang, type LangInfo } from '../../lib/i18n';

interface I18nContextValue {
  lang: string;
  languages: LangInfo[];
  switchLang: (lang: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  languages: [],
  switchLang: () => { },
  t: (key) => key,
});

interface I18nProviderProps {
  children: ReactNode;
  languages: LangInfo[];
  dictionaries: Record<string, Record<string, string>>;
}

export function I18nProvider({ children, languages, dictionaries }: I18nProviderProps) {
  const defaultLang = useMemo(
    () => languages.find((l) => l.isDefault)?.code || languages[0]?.code || 'en',
    [languages],
  );
  const codes = useMemo(() => languages.map((l) => l.code), [languages]);

  const [lang, setLangState] = useState(defaultLang);

  useEffect(() => {
    setLangState(getLang(codes, defaultLang));
  }, [codes, defaultLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const switchLang = useCallback((newLang: string) => {
    setLangState(newLang);
    persistLang(newLang);
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[lang]?.[key] ?? dictionaries[defaultLang]?.[key] ?? key,
    [lang, dictionaries, defaultLang],
  );

  return (
    <I18nContext.Provider value={{ lang, languages, switchLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
