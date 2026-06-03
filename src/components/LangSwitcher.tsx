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
      className="lang-switcher ml-1 [&>button]:!text-dark [&>button]:!text-[18px] [&>button]:!font-normal [&>button]:!normal-case [&>button]:!tracking-[-0.007em] [&>button]:hover:!bg-transparent [&>button>svg]:!text-dark"
      options={languages.map((l) => ({
        value: l.code,
        label: l.name,
        icon: l.flag,
      }))}
    />
  );
}
