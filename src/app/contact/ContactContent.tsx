'use client';

import { useState, type ReactNode } from 'react';
import { useI18n } from '@/lib/i18n-context';
import type { PageTexts, ContactAddress, ContactOffice } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';
import Image from '@/components/ui/Image';
import Button from '@/components/ui/Button';

interface Props {
  texts: PageTexts;
  addresses?: ContactAddress[];
  offices: ContactOffice[];
}

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M12 21s-7-6-7-12a7 7 0 1 1 14 0c0 6-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="11" r="2.5" />
    <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
    <path d="M14 19c0-2 2-3.5 5-3.5" />
  </svg>
);

const ICONS: Record<string, ReactNode> = {
  pin: <PinIcon />,
  globe: <GlobeIcon />,
  group: <GroupIcon />,
};

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 7 9-7" />
  </svg>
);

export default function ContactContent({ texts, addresses, offices }: Props) {
  const { t } = useI18n();
  const initialId = offices[0]?.slug ?? '';
  const [activeId, setActiveId] = useState<string>(initialId);
  const active = offices.find((o) => o.slug === activeId) ?? offices[0];

  const portraitSrc = addresses?.[0]?.image || '/tibor_image.png';

  const eyebrow = texts.eyebrow;
  const intro = texts.intro;
  const ceoLabel = texts.ceo_label;
  const ceoQuote = texts.ceo_quote;
  const ceoCtaLabel = texts.ceo_cta;
  const ceoCtaTarget = texts.ceo_cta_target;

  if (!active) {
    return (
      <main className="contact-page pt-[calc(var(--header-height)+40px)] pb-20">
        <section className="w-[80%] mx-auto">
          <h1 className="text-5xl font-semibold text-text">{t('heading.contact')}</h1>
          {intro && <p className="mt-6 text-base text-muted leading-relaxed">{intro}</p>}
        </section>
      </main>
    );
  }

  const phoneHref = `tel:${active.phone.replace(/\s+/g, '')}`;
  const mailHref = `mailto:${active.email}`;

  return (
    <main className="contact-page pt-[calc(var(--header-height)+40px)] pb-20">
      {/* ── Hero split ─────────────────────────────────── */}
      <section className="w-[80%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <FadeIn delay={0.05} className="flex flex-col gap-7 pt-8">
          {eyebrow && (
            <span className="text-xs font-semibold text-muted uppercase tracking-[0.25em]">
              {eyebrow}
            </span>
          )}
          <h1 className="text-5xl md:text-6xl font-semibold text-text tracking-tight leading-none">
            {t('heading.contact')}
          </h1>
          {intro && (
            <p className="text-base font-normal text-muted leading-relaxed max-w-prose">
              {intro}
            </p>
          )}

          {(ceoQuote || ceoLabel) && (
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 flex flex-col gap-5 mt-2">
              <div className="flex gap-5 items-start">
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-70 relative">
                  <Image
                    src={portraitSrc}
                    alt="Tibor Buček"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  {ceoLabel && (
                    <span className="text-[10px] font-semibold text-brand uppercase tracking-[0.25em]">
                      {ceoLabel}
                    </span>
                  )}
                  {ceoQuote && (
                    <p className="text-sm italic text-text leading-relaxed">
                      &ldquo;{ceoQuote}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              {ceoCtaLabel && ceoCtaTarget && offices.some((o) => o.slug === ceoCtaTarget) && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    shape="pill"
                    onClick={() => setActiveId(ceoCtaTarget)}
                    className="text-xs font-semibold"
                  >
                    {ceoCtaLabel}
                  </Button>
                </div>
              )}
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.15} className="lg:sticky lg:top-[calc(var(--header-height)+40px)]">
          <div className="relative w-full aspect-[519/495] rounded-2xl overflow-hidden bg-gray-70 shadow-xl">
            <Image
              src={portraitSrc}
              alt="Tibor Buček Professional Portrait"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </FadeIn>
      </section>

      {/* ── Office category tabs ────────────────────────── */}
      <section className="w-[80%] mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-border">
          {offices.map((office) => {
            const isActive = office.slug === activeId;
            return (
              <Button
                key={office.slug}
                type="button"
                onClick={() => setActiveId(office.slug)}
                className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-colors 
                  ${isActive
                    ? 'border-brand bg-white shadow-sm hover:bg-white/60'
                    : 'border-transparent bg-transparent hover:bg-white/60'
                  }`}
                aria-pressed={isActive}
              >
                <span
                  className={`w-11 h-11 shrink-0 rounded-lg flex items-center justify-center ${isActive ? 'bg-brand text-white' : 'bg-gray-70 text-muted'
                    }`}
                >
                  {ICONS[office.icon] ?? <PinIcon />}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-text uppercase tracking-[0.15em]">
                    {office.region}
                  </span>
                  <span className="text-sm text-muted">
                    {office.label}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </section>

      {/* ── Detail card (changes with active tab) ───────── */}
      <section className="w-[80%] mx-auto mt-8">
        <FadeIn key={active.slug} delay={0.05}>
          <div className="rounded-2xl bg-white shadow-md grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] overflow-hidden border border-border">
            <div className="p-8 md:p-10 flex flex-col gap-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                {active.orgName && (
                  <h2 className="text-2xl md:text-3xl font-semibold italic text-text leading-tight">
                    {active.orgName}
                  </h2>
                )}
                {active.zone && (
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                    {active.zone}
                  </span>
                )}
              </div>

              {(active.roleLabel || active.roleName) && (
                <div className="flex flex-col gap-1.5">
                  {active.roleLabel && (
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                      {active.roleLabel}
                    </span>
                  )}
                  {active.roleName && (
                    <span className="text-xl font-medium text-text">{active.roleName}</span>
                  )}
                </div>
              )}

              {(active.addressLines.length > 0 || active.corporateIds.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {active.addressLines.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                        Address
                      </span>
                      {active.addressLines.map((line, i) => (
                        <span key={i} className="text-base text-text leading-snug">
                          {line}
                        </span>
                      ))}
                    </div>
                  )}
                  {active.corporateIds.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                        {active.slug === 'china' ? 'Identifiers' : 'Corporate IDs'}
                      </span>
                      {active.corporateIds.map((row, i) => (
                        <span key={i} className="text-base text-text leading-snug">
                          {row.label && <span className="font-medium">{row.label}:</span>} {row.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-70/60 border-t lg:border-t-0 lg:border-l border-border p-8 md:p-10 flex flex-col gap-7">
              {(active.phone || active.email) && (
                <div className="flex flex-col gap-4">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                    Direct Communication
                  </span>
                  <div className="flex flex-col gap-3">
                    {active.phone && (
                      <a
                        href={phoneHref}
                        className="flex items-center gap-3 text-base text-text hover:text-brand transition-colors"
                      >
                        <span className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center text-text shrink-0">
                          <PhoneIcon />
                        </span>
                        <span className="font-medium">{active.phone}</span>
                      </a>
                    )}
                    {active.email && (
                      <a
                        href={mailHref}
                        className="flex items-center gap-3 text-base text-text hover:text-brand transition-colors break-all"
                      >
                        <span className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center text-text shrink-0">
                          <MailIcon />
                        </span>
                        <span className="font-medium">{active.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {active.bankCredentials.length > 0 && (
                <div className="flex flex-col gap-3 pt-5 border-t border-border">
                  <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.2em]">
                    Bank Credentials
                  </span>
                  <div className="rounded-lg bg-white border border-border p-4 font-mono text-xs text-text flex flex-col gap-1.5">
                    {active.bankCredentials.map((row, i) => (
                      <div key={i}>
                        {row.label && <span className="text-muted">{row.label}:</span>} {row.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
