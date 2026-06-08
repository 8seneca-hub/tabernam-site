'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import { useTheme } from '@/lib/theme-context';
import type { ContactOffice } from '@/lib/data';
import Image from '../ui/Image';
import { Mail, MapPin } from 'lucide-react';

const linkClass = 'relative -ml-5 inline-flex w-fit items-center px-5 py-[14px] text-[18px] font-semibold tracking-[-0.007em] text-text whitespace-nowrap after:absolute after:left-5 after:right-5 after:bottom-[8px] after:h-[2px] after:bg-text after:content-[""] after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100';
const emailLinkClass = 'text-[18px] text-text hover:text-accent transition-colors';

interface Props {
  office: ContactOffice | null;
}

export default function Footer({ office }: Props) {
  const { t } = useI18n();
  const { logoImage, logoText } = useTheme();
  const email = office?.workEmail || 'hello@tabernam.com';
  const mailHref = `mailto:${email}`;
  const location = office?.addressLines && office.addressLines.length > 0
    ? office.addressLines.join(', ')
    : t('footer.location');

  return (
    <footer className="bg-gray-40 text-text px-[var(--side-padding)] max-md:px-[16px] pt-20 pb-10">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 pb-16">
          {/* Quote block — logo, then quote + author. Takes ~half on large screens. */}
          <div className="flex flex-col gap-5 lg:flex-1">
            <Link href="/" className="flex items-center w-fit" aria-label={`${logoText || 'Tabernam'} home`}>
              <Image src={logoImage} alt={logoText || 'Tabernam'} height={80} className="w-auto" style={{ height: '80px', width: 'auto', filter: 'brightness(0)' }} />
            </Link>
            <div className="flex flex-col gap-2">
              <p className="text-[20px] font-semibold tracking-[-0.01em] text-text">
                {t('footer.quote')}
              </p>
              {/* TODO: "— CEO Tabernam" is hardcoded — wire the role to an i18n
                  key if it needs localizing. */}
              <p className="text-[16px] font-light italic tracking-[-0.01em] text-muted">
                {t('footer.quoteAuthor')} — CEO Tabernam
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-16 lg:flex-1">
            <nav className="flex flex-col" aria-label={t('footer.exploreHeading')}>
              <ul className="flex flex-col gap-0 list-none">
                <li><Link href="/about" className={linkClass}>{t('nav.about')}</Link></li>
                <Link href="/" className={linkClass}>{t('nav.home')}</Link>
                <li><Link href="/cv" className={linkClass}>{t('btn.viewCV')}</Link></li>
              </ul>
            </nav>

            {/* PRESENCE */}
            <div className="flex flex-col">
              <ul className="flex flex-col gap-0 list-none">
                <li className="flex items-center gap-3 py-[14px]">
                  <Mail className="w-[18px] h-[18px] shrink-0 text-text" aria-hidden />
                  <a href={mailHref} className={emailLinkClass}>{email}</a>
                </li>
                <li className="flex items-center gap-3 py-[14px]">
                  <MapPin className="w-[18px] h-[18px] shrink-0 text-text" aria-hidden />
                  <span className="text-[18px] text-text">{location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-sm text-muted">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
