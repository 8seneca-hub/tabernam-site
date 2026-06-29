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
  /** Language picked server-side from the `Accept-Language` request header.
   *  Used for the initial render so the first paint matches the user's
   *  browser preference without a flash. */
  initialLang?: string;
}

export function I18nProvider({ children, languages, dictionaries, initialLang }: I18nProviderProps) {
  const defaultLang = useMemo(
    () => languages.find((l) => l.isDefault)?.code || languages[0]?.code || 'en',
    [languages],
  );
  const codes = useMemo(() => languages.map((l) => l.code), [languages]);

  // SSR & first client render: use the language already picked from
  // `Accept-Language` on the server. Falls back to the configured default when
  // the prop is absent (e.g. existing call sites that haven't been updated).
  const ssrLang = initialLang && codes.includes(initialLang) ? initialLang : defaultLang;
  const [lang, setLangState] = useState(ssrLang);

  useEffect(() => {
    // `getLang` honors an existing `localStorage.lang` choice first; if none,
    // falls back to the SSR-picked lang (no flash) and finally to defaultLang.
    const resolved = getLang(codes, ssrLang);
    setLangState(resolved);
    // First-visit persistence: if no `lang` is stored yet, lock in the
    // detected language so it sticks across future visits — even if the
    // browser's Accept-Language preferences change later.
    try {
      if (!localStorage.getItem('lang')) {
        persistLang(resolved);
      }
    } catch {
      // private/incognito mode — localStorage may throw
    }
  }, [codes, ssrLang]);

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
