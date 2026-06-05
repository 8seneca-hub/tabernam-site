'use client';

import { useI18n } from '@/app/hook/useI18n';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';
import Image from '@/components/ui/Image';
import MottoQuote from '@/components/MottoQuote';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { ContactOffice } from '@/lib/data';

interface Props {
  texts: PageTextsBundle;
  office: ContactOffice | null;
}

export default function ContactContent({ texts: bundle, office: active }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);

  if (!active) {
    return (
      <main className="contact-page pt-[var(--header-height)] pb-20">
        <section className="px-[60px] py-20 max-w-[1320px] mx-auto max-md:px-[40px]">
          <h1 className="text-5xl font-semibold text-text">{t('heading.contact')}</h1>
        </section>
      </main>
    );
  }

  const phoneHref = `tel:${active.phone.replace(/\s+/g, '')}`;
  const workMailHref = active.workEmail ? `mailto:${active.workEmail}` : '';
  const personalMailHref = active.personalEmail ? `mailto:${active.personalEmail}` : '';
  const websiteUrl = active.websiteUrl || "www.tabernam.at";

  const headingTitle = texts.contact_heading_title || 'Get in touch';
  const subheadingTitle =
    texts.contact_subheading
    || 'If you are entering, scaling, or repositioning your business between Europle and China - or simply want a candid second opinion before the next step - I welcome the conversation. Reach me through whichever channel below fits your context.'
  const addressLabel = t('contact.addressLabel');
  const websiteLabel = t('contact.websiteLabel')
  const workEmailLabel = t('contact.emailLabel');
  const phoneLabel = t('contact.phoneLabel');
  const wechatLabel = t('contact.wechatLabel');

  return (
    <main className="contact-page pt-[var(--header-height)]">
      <section className="px-[60px] pt-12 pb-16 max-md:px-[40px]">
        <div className="max-w-[1320px] mx-auto flex flex-col gap-[80px] lg:flex-row lg:items-start">
          {/* Text column — fills the remaining width: heading, intro, and contact details. */}
          <FadeIn delay={0.15} className="w-full lg:flex-1 flex flex-col gap-[30px] pt-[20px]">
            <h1 className="text-5xl md:text-6xl font-bold text-brand tracking-tight leading-tight max-md:text-4xl">
              {headingTitle}
            </h1>
            <p className="text-[20px] font-medium tracking-[-0.02rem] text-dark leading-relaxed">
              {subheadingTitle}
            </p>
            <div className="flex flex-col gap-8 mt-4">
            {active.workEmail && active.personalEmail && (
              <div className="flex items-start gap-5">
                <span className="flex items-center h-6 text-text shrink-0">
                  <Mail size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-normal text-text leading-6">
                    {workEmailLabel}
                  </span>
                  <a
                    href={workMailHref}
                    className="text-[18px] font-semibold text-text hover:text-brand transition-colors break-all"
                  >
                    {active.workEmail}
                  </a>
                  <a
                    href={personalMailHref}
                    className="text-[18px] font-semibold text-text hover:text-brand transition-colors break-all"
                  >
                    {active.personalEmail}
                  </a>
                </div>
              </div>
            )}
            {active.phone && (
              <div className="flex items-start gap-5">
                <span className="flex items-center h-6 text-text shrink-0">
                  <Phone size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-normal text-text leading-6">
                    {phoneLabel}
                  </span>
                  <a
                    href={phoneHref}
                    className="text-[18px] font-semibold text-text hover:text-brand transition-colors"
                  >
                    {active.phone}
                  </a>
                </div>
              </div>
            )}
            {active.wechat && (
              <div className="flex items-start gap-5">
                <span className="flex items-center h-6 text-text shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {/* Back bubble (upper-left), open on the lower-right where the front bubble overlaps. */}
                    <path d="M14 9.5c0-3.04-2.91-5.5-6.5-5.5S1 6.46 1 9.5c0 1.78 1 3.36 2.55 4.38L3 16.5l2.66-1.4c.58.16 1.2.27 1.84.32" />
                    <path d="M5.5 9h.01M9.5 9h.01" />
                    {/* Front bubble (lower-right) with bottom-right tail. */}
                    <path d="M10 15.5c0 2.49 2.46 4.5 5.5 4.5.65 0 1.27-.09 1.84-.26L20 21l-.6-1.96C21.31 18.13 21 16.86 21 15.5c0-2.49-2.46-4.5-5.5-4.5S10 13.01 10 15.5Z" />
                    <path d="M14 15h.01M17.5 15h.01" />
                  </svg>
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-normal text-text leading-6">
                    {wechatLabel}
                  </span>
                  <span className="text-[18px] font-semibold text-text">
                    {active.wechat}
                  </span>
                </div>
              </div>
            )}
            {active.addressLines.length > 0 && (
              <div className="flex items-start gap-5">
                <span className="flex items-center h-6 text-text shrink-0">
                  <MapPin size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-normal text-text leading-6">
                    {addressLabel}
                  </span>
                  <div className="flex flex-col">
                    {active.addressLines.map((line, i) => (
                      <span key={i} className="text-[18px] font-semibold text-text leading-snug">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {active.websiteUrl && (
              <div className="flex items-start gap-5">
                <span className="flex items-center h-6 text-text shrink-0">
                  <Globe size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[16px] font-normal text-text leading-6">
                    {websiteLabel}
                  </span>
                  <div className="flex flex-col">
                    <a href={websiteUrl} className="text-[18px] font-semibold text-text hover:text-brand transition-colors">
                      {websiteUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}
            </div>
          </FadeIn>

          {/* Image column — fixed 45% of the frame: portrait + quotation. */}
          <FadeIn delay={0.15} className="w-full lg:w-[45%] lg:pt-[20px] max-lg:max-w-[440px] max-lg:mx-auto">
            <div className="feathered-image relative aspect-square rounded-4 overflow-hidden bg-surface">
              <Image
                src={texts.portrait_image || '/tibor_image.png'}
                alt="Tibor Buček Professional Portrait"
                fill
                priority
                className="object-cover"
              />
            </div>
            <MottoQuote />
          </FadeIn>
        </div>
      </section>

    </main >
  );
}
