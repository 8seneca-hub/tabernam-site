'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/app/hook/useI18n';
import { useTheme } from '@/lib/theme-context';
import Image from './ui/Image';
import LangSwitcher from './LangSwitcher';

export default function Header() {
  const { t } = useI18n();
  const { logoImage, logoText } = useTheme();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Keep the global --header-height in sync with the header's real rendered
  // height. The CMS-provided value (inline style on <html>) is only an SSR
  // guess; the actual height is driven by the header's content, so without this
  // the content offset can be too small and the header overlaps the page.
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const setVar = () => {
      const h = Math.round(headerEl.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(headerEl);
    return () => ro.disconnect();
  }, []);

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

  const linkClass = (href: string) => {
    const active = isActive(href);
    return `relative text-[18px] font-normal tracking-[-0.007em] px-5 py-[14px] after:absolute after:left-5 after:right-5 after:bottom-[8px] after:h-[2px] after:content-[""] after:transition-opacity after:duration-200 ${
      active
        ? '!text-brand after:bg-brand after:opacity-100'
        : '!text-dark after:bg-dark after:opacity-0 hover:after:opacity-100'
    }`;
  };

  return (
    <header
      ref={headerRef}
      className="site-header fixed top-0 left-0 right-0 z-100 bg-gray-20 grid grid-cols-[auto_1fr_auto] items-center gap-6 px-[var(--side-padding)] py-2.5"
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center" aria-label={`${logoText || 'Tabernam'} home`}>
          <Image src={logoImage} alt={logoText || 'Tabernam'} priority width={150} height={150} style={{ filter: 'brightness(0)' }} />
        </Link>
      </div>

      <nav
        ref={navRef}
        className="nav flex items-center justify-center gap-8 max-md:gap-0"
        id="primary-nav"
      >
        <Link href="/" className={linkClass('/')} onClick={closeNav}>{t('nav.home')}</Link>
        <Link href="/about" className={linkClass('/about')} onClick={closeNav}>{t('nav.about')}</Link>
        <Link href="/contact" className={linkClass('/contact')} onClick={closeNav}>{t('nav.contact')}</Link>
      </nav>

      <div className="flex items-center justify-end gap-1">
        <LangSwitcher />
        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-controls="primary-nav"
          aria-expanded="false"
          onClick={toggleNav}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
      </div>
    </header>
  );
}
