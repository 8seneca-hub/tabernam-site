'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import type { ContactOffice } from '@/lib/data';
import ActivityLink from './activity/ActivityLink';
import Logo from './Logo';
import { Earth, Globe, Mail, MapPin } from 'lucide-react';


const colHeaderClass = 'text-[11px] font-semibold uppercase tracking-[0.25em] text-text mb-5';
const linkClass = 'text-sm text-text hover:text-brand transition-colors';

interface Props {
  office: ContactOffice | null;
}

export default function Footer({ office }: Props) {
  const { t } = useI18n();
  const email = office?.workEmail || 'hello@tabernam.com';
  const mailHref = `mailto:${email}`;
  const location = office?.addressLines && office.addressLines.length > 0
    ? office.addressLines.join(', ')
    : t('footer.location');

  return (
    <footer className="mt-20 px-[var(--side-padding)] pt-16 pb-6 bg-footer-bg border-t border-border text-text">
      <div className="max-w-[var(--max-width)] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-12 lg:gap-16 pb-12">
        {/* Brand column */}
        <div className="flex flex-col gap-5 max-w-[360px]">
          <Link href="/" className="inline-flex" aria-label={t('aria.tabernamHome')}>
            <Logo size={64} />
          </Link>
          <p className="text-sm leading-relaxed text-muted">
            {t('footer.tagline')}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text" aria-hidden>
              <Globe />
            </span>
            <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text" aria-hidden>
              <Earth />
            </span>
          </div>
        </div>

        {/* EXPLORE */}
        <nav className="flex flex-col" aria-label={t('footer.exploreHeading')}>
          <h4 className={colHeaderClass}>{t('footer.exploreHeading')}</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li><Link href="/about" className={linkClass}>{t('nav.about')}</Link></li>
            <li><ActivityLink className={linkClass}>{t('nav.activity')}</ActivityLink></li>
            <li><Link href="/cv" className={linkClass}>{t('btn.viewCV')}</Link></li>
          </ul>
        </nav>

        {/* CONNECT */}
        <nav className="flex flex-col" aria-label={t('footer.connectHeading')}>
          <h4 className={colHeaderClass}>{t('footer.connectHeading')}</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn</a></li>
            <li><Link href="/contact" className={linkClass}>{t('nav.contact')}</Link></li>
            <li><Link href="/contact" className={linkClass}>{t('footer.globalOffices')}</Link></li>
          </ul>
        </nav>

        {/* PRESENCE */}
        <div className="flex flex-col">
          <h4 className={colHeaderClass}>{t('footer.presenceHeading')}</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 flex items-center justify-center text-text shrink-0" aria-hidden>
                <Mail />
              </span>
              <a href={mailHref} className={linkClass}>{email}</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 flex items-center justify-center text-text shrink-0" aria-hidden>
                <MapPin />
              </span>
              <span className="text-sm text-text">{location}</span>
            </li>
          </ul>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted mt-6">
            {t('footer.established')}
          </span>
        </div>
      </div>

      <div className="max-w-[var(--max-width)] mx-auto pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">{t('footer.copyright')}</p>
        <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          <Link href="/privacy" className="hover:text-text transition-colors">{t('footer.privacy')}</Link>
          <Link href="/terms" className="hover:text-text transition-colors">{t('footer.terms')}</Link>
        </div>
      </div>
    </footer>
  );
}
