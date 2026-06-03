'use client';

import Link from 'next/link';
import { useI18n } from '@/app/hook/useI18n';
import type { ContactOffice } from '@/lib/data';
import ActivityLink from './activity/ActivityLink';
import { Mail, MapPin } from 'lucide-react';

const colHeaderClass = 'block text-[18px] font-normal tracking-[-0.01em] text-gray-60 mb-2.5';
// Button-like link with the same hover-underline treatment as the header nav
// links. The negative left margin offsets the px-5 padding so the link text
// still aligns with the column label.
const linkClass = 'relative -ml-5 inline-flex w-fit items-center px-5 py-[14px] text-[18px] font-semibold tracking-[-0.007em] text-white whitespace-nowrap after:absolute after:left-5 after:right-5 after:bottom-[8px] after:h-[2px] after:bg-white after:content-[""] after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100';
// Presence email — a plain link (no button/underline treatment).
const emailLinkClass = 'text-[18px] text-white hover:text-accent transition-colors';

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
    <footer className="bg-brand text-white px-[var(--side-padding)] pt-20 pb-10">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20 pb-16">
          {/* Quote block — takes ~half the frame on large screens. */}
          <div className="flex flex-col gap-5 lg:flex-1">
            <p className="text-[36px] leading-tight font-semibold tracking-[-0.01em] text-accent">
              &ldquo;{t('footer.quote')}&rdquo;
            </p>
            {/* TODO: ", CEO Tabernam" is hardcoded — wire the role to an i18n
                key if it needs localizing. */}
            <p className="text-[20px] italic tracking-[-0.01em] text-gray-40">
              <span className="font-semibold">{t('footer.quoteAuthor')}</span>, CEO Tabernam
            </p>
          </div>

          {/* Explore + Presence — share the other half on large screens. They sit
              side by side from the `sm` breakpoint up (incl. tablet, where there's
              room for both), and stack vertically on small phones. */}
          <div className="flex flex-col gap-12 sm:flex-row sm:gap-16 lg:flex-1">
            {/* EXPLORE */}
            <nav className="flex flex-col" aria-label={t('footer.exploreHeading')}>
              <span className={colHeaderClass}>{t('footer.exploreHeading')}</span>
              <ul className="flex flex-col gap-0 list-none">
                <li><Link href="/about" className={linkClass}>{t('nav.about')}</Link></li>
                <li><ActivityLink className={linkClass}>{t('nav.activity')}</ActivityLink></li>
                <li><Link href="/cv" className={linkClass}>{t('btn.viewCV')}</Link></li>
              </ul>
            </nav>

            {/* PRESENCE */}
            <div className="flex flex-col">
              <span className={colHeaderClass}>{t('footer.presenceHeading')}</span>
              <ul className="flex flex-col gap-0 list-none">
                <li className="flex items-center gap-3 py-[14px]">
                  <Mail className="w-[18px] h-[18px] shrink-0 text-white" aria-hidden />
                  <a href={mailHref} className={emailLinkClass}>{email}</a>
                </li>
                <li className="flex items-center gap-3 py-[14px]">
                  <MapPin className="w-[18px] h-[18px] shrink-0 text-white" aria-hidden />
                  <span className="text-[18px] text-white">{location}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 pt-6">
          <p className="text-sm text-white/60">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
