'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from '@/components/ui/Image';
import { useI18n } from '@/app/hook/useI18n';
import LangSwitcher from './LangSwitcher';
import ActivityLink from './activity/ActivityLink';

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Auto-hide header on scroll down
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const header: HTMLElement = headerEl;
    const SHOW_AT_TOP = 80;
    const DELTA = 6;
    let lastY = window.scrollY;
    let raf = 0;

    function tick() {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < DELTA) return;
      if (y < SHOW_AT_TOP) {
        header.classList.remove('is-hidden');
      } else if (dy > 0) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeNav = useCallback(() => {
    navRef.current?.classList.remove('is-open');
    toggleRef.current?.setAttribute('aria-expanded', 'false');
  }, []);

  const toggleNav = useCallback(() => {
    const nav = navRef.current;
    const toggle = toggleRef.current;
    if (!nav || !toggle) return;
    if (nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNav(); };
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node) && !toggleRef.current?.contains(e.target as Node)) {
        closeNav();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [closeNav]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) =>
    `relative text-sm font-medium px-2 py-2 transition-colors duration-200 ${isActive(href)
      ? 'text-brand after:absolute after:left-2 after:right-2 after:-bottom-0.5 after:h-[2px] after:bg-brand after:content-[""]'
      : 'text-text hover:text-brand'
    }`;

  return (
    <header
      ref={headerRef}
      className="site-header fixed top-0 left-0 right-0 z-100 bg-header grid grid-cols-[auto_1fr_auto] items-center gap-6 px-[var(--side-padding)] py-2.5"
    >
      <div className="flex items-center gap-4">
        {/* <button
          ref={toggleRef}
          type="button"
          className="nav-toggle flex w-10 h-10 p-0 bg-transparent border-0 cursor-pointer relative items-center justify-center"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="primary-nav"
          onClick={toggleNav}
        >
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
          <span className="nav-toggle-bar"></span>
        </button> */}

        <Link href="/" className="flex items-center" aria-label="Tabernam home">
          <Image
            src="/tabernam-logo.png"
            alt="Tabernam"
            width={100}
            height={100}
            priority
            className="h-7 max-w-[100px] object-contain max-md:h-6 max-md:max-w-[140px]"
          />
        </Link>
      </div>

      <nav
        ref={navRef}
        className="nav flex items-center justify-center gap-8 max-md:gap-0"
        id="primary-nav"
      >
        <Link href="/" className={linkClass('/')} onClick={closeNav}>{t('nav.home')}</Link>
        <Link href="/about" className={linkClass('/about')} onClick={closeNav}>{t('nav.about')}</Link>
        {/* <ActivityLink className={linkClass('/activities')} onClick={closeNav}>{t('nav.activity')}</ActivityLink> */}
        <Link href="/contact" className={linkClass('/contact')} onClick={closeNav}>{t('nav.contact')}</Link>
      </nav>

      <div className="flex items-center justify-end">
        <LangSwitcher />
      </div>
    </header>
  );
}
