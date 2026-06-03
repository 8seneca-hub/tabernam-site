'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import Button from '@/components/ui/Button';

interface Props {
  className?: string;
}

export default function ContactInfoCard({ className = '' }: Props) {
  const { t } = useI18n();

  return (
    <div
      className={`w-full max-w-[480px] bg-bg text-text rounded-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-border p-7 max-md:p-5 ${className}`.trim()}
    >
      <h3 className="text-2xl font-bold text-text">{t('cv.contact.title')}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        {t('cv.contact.intro')}
      </p>
      <div className="flex items-center justify-end mt-6">
        <Button
          as={Link}
          href="/contact"
          variant="primary"
          size="sm"
          shape="pill"
          icon="→"
          className="font-semibold !text-white shadow-sm"
        >
          {t('cv.contact.cta')}
        </Button>
      </div>
    </div>
  );
}
