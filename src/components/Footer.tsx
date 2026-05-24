'use client';

import Link from 'next/link';
import Image from '@/components/ui/Image';
import { useI18n } from '@/lib/i18n-context';
import ActivityLink from './activity/ActivityLink';
import { Earth, Globe, Mail, MapPin } from 'lucide-react';


const colHeaderClass = 'text-[11px] font-semibold uppercase tracking-[0.25em] text-text mb-5';
const linkClass = 'text-sm text-text hover:text-brand transition-colors';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-20 px-[var(--side-padding)] pt-16 pb-6 bg-footer-bg border-t border-border text-text">
      <div className="max-w-[var(--max-width)] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-12 lg:gap-16 pb-12">
        {/* Brand column */}
        <div className="flex flex-col gap-5 max-w-[360px]">
          <Link href="/" className="inline-flex" aria-label="Tabernam home">
            <Image
              src="/tabernam-logo.png"
              alt="Tabernam"
              width={928}
              height={164}
              className="h-8 w-auto max-w-[200px] object-contain"
            />
          </Link>
          <p className="text-sm leading-relaxed text-muted">
            Consulting for international trade and investments, bridging connections between Slovakia and the Asian market. Stately, Diplomatic, and Precision-Oriented Expertise.
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
        <nav className="flex flex-col" aria-label="Explore">
          <h4 className={colHeaderClass}>Explore</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li><Link href="/about" className={linkClass}>{t('nav.about')}</Link></li>
            <li><ActivityLink className={linkClass}>{t('nav.activity')}</ActivityLink></li>
            <li><Link href="/cv" className={linkClass}>{t('btn.viewCV')}</Link></li>
          </ul>
        </nav>

        {/* CONNECT */}
        <nav className="flex flex-col" aria-label="Connect">
          <h4 className={colHeaderClass}>Connect</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className={linkClass}>LinkedIn</a></li>
            <li><Link href="/contact" className={linkClass}>{t('nav.contact')}</Link></li>
            <li><Link href="/contact" className={linkClass}>Global Offices</Link></li>
          </ul>
        </nav>

        {/* PRESENCE */}
        <div className="flex flex-col">
          <h4 className={colHeaderClass}>Presence</h4>
          <ul className="flex flex-col gap-3 list-none">
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 flex items-center justify-center text-text shrink-0" aria-hidden>
                <Mail />
              </span>
              <a href="mailto:hello@tabernam.com" className={linkClass}>hello@tabernam.com</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 flex items-center justify-center text-text shrink-0" aria-hidden>
                <MapPin />
              </span>
              <span className="text-sm text-text">Bratislava, Slovakia</span>
            </li>
          </ul>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted mt-6">
            Established 1984
          </span>
        </div>
      </div>

      <div className="max-w-[var(--max-width)] mx-auto pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">{t('footer.copyright')}</p>
        <div className="flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          <Link href="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-text transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
