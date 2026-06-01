'use client';

import { useI18n } from '@/app/hook/useI18n';
import Select from '@/components/ui/Select';

export default function LangSwitcher() {
  const { lang, languages, switchLang } = useI18n();

  if (languages.length < 2) return null;

  return (
    <Select
      value={lang}
      onChange={switchLang}
      ariaLabel="Language"
      className="lang-switcher ml-1"
      options={languages.map((l) => ({
        value: l.code,
        label: l.name,
        icon: l.flag,
      }))}
    />
  );
}
