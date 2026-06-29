'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import { useTheme } from '@/lib/theme-context';
import type { ContactOffice } from '@/lib/data';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/layout/MottoQuote';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

// Button-like link with the same hover-underline treatment as the header nav
// links. The negative left margin offsets the px-5 padding so the link text
// still aligns with the column label.
const linkClass = 'relative -ml-5 max-lg:ml-0 inline-flex w-fit items-center px-5 py-[14px] text-[18px] font-semibold tracking-[-0.007em] text-text whitespace-nowrap after:absolute after:left-5 after:right-5 after:bottom-[8px] after:h-[2px] after:bg-text after:content-[""] after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100';
// Presence email — a plain link (no button/underline treatment).
const emailLinkClass = 'text-[18px] text-text hover:text-accent transition-colors';

interface Props {
  office: ContactOffice | null;
}

export default function Footer({ office }: Props) {
  const { t } = useI18n();
  const { logoImage, logoText } = useTheme();
  const workEmail = office?.workEmail || 'hello@tabernam.com';
  const personalEmail = office?.personalEmail || '';
  const phone = office?.phone || '';
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;
  const wechat = office?.wechat || '';
  const addressLines = office?.addressLines && office.addressLines.length > 0
    ? office.addressLines
    : [t('footer.location')];
  const websiteUrl = office?.websiteUrl || '';

  return (
    <footer className="bg-gray-40 text-text px-[var(--side-padding)] max-md:px-[16px] pt-20 pb-10">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 pb-16 max-md:items-center max-md:text-center">
          {/* Quote block — logo, then quote + author. Takes ~half on large screens. */}
          <div className="flex flex-col gap-5 lg:flex-1 max-lg:items-center">
            <Link href="/" className="flex items-center w-fit" aria-label={`${logoText || 'Tabernam'} home`}>
              <Image src={logoImage} alt={logoText || 'Tabernam'} height={80} className="w-auto" style={{ height: '80px', width: 'auto', filter: 'brightness(0)' }} />
            </Link>
            <MottoQuote
              translation={t('footer.quote')}
              author={t('footer.quoteAuthor')}
              authorTranslation={(() => {
                const v = t('footer.quoteAuthorTranslation');
                return v && v !== 'footer.quoteAuthorTranslation' ? v : '';
              })()}
              className="flex flex-col w-fit"
              latinClassName="text-[20px] font-semibold tracking-[-0.01em] text-text text-center"
              translationClassName="text-[16px] font-light tracking-[-0.01em] text-text text-center mt-[10px]"
              authorClassName="text-[25px] tracking-[-0.01em] text-text text-right mt-[16px]"
            />
          </div>

          {/* Explore + Presence — share the other half on large screens. They sit
              side by side from the `sm` breakpoint up (incl. tablet, where there's
              room for both), and stack vertically on small phones. */}
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-16 lg:flex-1 max-md:items-center md:max-lg:items-start">
            {/* EXPLORE */}
            <nav className="flex flex-col max-md:items-center md:max-lg:flex-1" aria-label={t('footer.exploreHeading')}>
              <ul className="flex flex-col gap-0 list-none">
                <li><Link href="/" className={linkClass}>{t('nav.home')}</Link></li>
                <li><Link href="/about" className={linkClass}>{t('nav.about')}</Link></li>
                <li><Link href="/contact" className={linkClass}>{t('nav.contact')}</Link></li>
              </ul>
            </nav>

            {/* PRESENCE */}
            <div className="flex flex-col max-md:items-center max-md:text-left md:max-lg:flex-1">
              <ul className="flex flex-col gap-[10px] list-none pt-[14px]">
                {/* Email(s) — work address, plus personal when present. */}
                <li className="flex items-start gap-3">
                  <Mail className="w-[18px] h-[18px] shrink-0 text-text mt-[4px]" aria-hidden />
                  <div className="flex flex-col">
                    <a href={`mailto:${workEmail}`} className={emailLinkClass}>{workEmail}</a>
                    {personalEmail && (
                      <a href={`mailto:${personalEmail}`} className={emailLinkClass}>{personalEmail}</a>
                    )}
                  </div>
                </li>
                {phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="w-[18px] h-[18px] shrink-0 text-text" aria-hidden />
                    <a href={phoneHref} className={emailLinkClass}>{phone}</a>
                  </li>
                )}
                {wechat && (
                  <li className="flex items-center gap-3">
                    <svg className="w-[18px] h-[18px] shrink-0 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 9.5c0-3.04-2.91-5.5-6.5-5.5S1 6.46 1 9.5c0 1.78 1 3.36 2.55 4.38L3 16.5l2.66-1.4c.58.16 1.2.27 1.84.32" />
                      <path d="M5.5 9h.01M9.5 9h.01" />
                      <path d="M10 15.5c0 2.49 2.46 4.5 5.5 4.5.65 0 1.27-.09 1.84-.26L20 21l-.6-1.96C21.31 18.13 21 16.86 21 15.5c0-2.49-2.46-4.5-5.5-4.5S10 13.01 10 15.5Z" />
                      <path d="M14 15h.01M17.5 15h.01" />
                    </svg>
                    <span className="text-[18px] text-text">{wechat}</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <MapPin className="w-[18px] h-[18px] shrink-0 text-text mt-[4px]" aria-hidden />
                  <div className="flex flex-col">
                    {addressLines.map((line, i) => (
                      <span key={i} className="text-[18px] text-text">{line}</span>
                    ))}
                  </div>
                </li>
                {websiteUrl && (
                  <li className="flex items-center gap-3">
                    <Globe className="w-[18px] h-[18px] shrink-0 text-text" aria-hidden />
                    <a href={websiteUrl} className={emailLinkClass}>{websiteUrl}</a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 max-lg:text-center">
          <p className="text-sm text-muted">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
