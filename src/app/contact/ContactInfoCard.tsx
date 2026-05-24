'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import Button from '@/components/ui/Button';
import InfoRow from '@/components/ui/Card';
import { Mail, MapPin, MessageCircleCheck, Phone } from 'lucide-react';
import Card from '@/components/ui/Card';

interface Props {
  email?: string;
  phone?: string;
  wechat?: string;
  address?: string;
  className?: string;
}

export default function ContactInfoCard({ email, phone, wechat, address, className = '' }: Props) {
  const { t } = useI18n();
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined;
  const mailHref = email ? `mailto:${email}` : undefined;

  return (
    <div
      className={`w-full max-w-[480px] bg-bg text-text rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-border p-7 max-md:p-5 ${className}`.trim()}
    >
      <h3 className="text-2xl font-bold text-text">{t('cv.contact.title')}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        {t('cv.contact.intro')}
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {email && (
          <li>
            <Card
              icon={<Mail />}
              label={t('cv.contact.email')}
              value={email}
              href={mailHref}
            />
          </li>
        )}
        {phone && (
          <li>
            <Card
              icon={<Phone />}
              label={t('cv.contact.phone')}
              value={phone}
              href={phoneHref}
            />
          </li>
        )}
        {wechat && (
          <li>
            <Card
              icon={<MessageCircleCheck />}
              label={t('cv.hero.wechat.label')}
              value={wechat}
            />
          </li>
        )}
        {address && (
          <li>
            <Card
              icon={<MapPin />}
              label={t('cv.contact.address')}
              value={address}
            />
          </li>
        )}
      </ul>

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
