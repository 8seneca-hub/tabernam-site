'use client';

import { useI18n } from '@/app/hook/useI18n';

interface Props {
  isOut: boolean;
  onOpen: () => void;
}

export default function GlobeIntro({ isOut, onOpen }: Props) {
  const { t } = useI18n();
  return (
    <div className={`ga-intro${isOut ? ' out' : ''}`}>
      <h2>{t('globeIntro.heading')}</h2>
      <p>{t('globeIntro.body')}</p>
      <button type="button" className="ga-cta" onClick={onOpen}>
        {t('btn.viewCities')}
      </button>
    </div>
  );
}
