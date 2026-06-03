'use client';

import { useState } from 'react';
import { useI18n } from '@/app/hook/useI18n';
import { pickPageTexts, type PageTextsBundle } from '@/lib/directus';
import FadeIn from '@/animations/FadeIn';
import Image from '@/components/ui/Image';
import { ChevronLeft, ChevronRight, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactOffice } from '@/lib/data';

interface Props {
  texts: PageTextsBundle;
  office: ContactOffice | null;
}

const MAP_VISIBLE = 2;

export default function ContactContent({ texts: bundle, office: active }: Props) {
  const { lang, t } = useI18n();
  const texts = pickPageTexts(bundle, lang);
  const [mapIndex, setMapIndex] = useState(0);

  if (!active) {
    return (
      <main className="contact-page pt-[calc(var(--header-height)+40px)] pb-20">
        <section className="w-[80%] mx-auto">
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

  return (
    <main className="contact-page pt-[calc(var(--header-height)+40px)] pb-0">
      <h1 className="text-[3.25rem] text-brand font-semibold text-center mb-6">
        {headingTitle}
      </h1>
      <p className="text-lg text-text text-center mb-6 max-w-4xl mx-auto">
        {subheadingTitle}
      </p>
      <section className="w-[80%] max-w-[1100px] mx-auto grid grid-cols-[1fr_auto] gap-12 pt-8 pb-16">
        <FadeIn delay={0.15} className="flex flex-col self-center ml-auto">
          <div className="flex flex-col gap-8 mb-12">
            {active.workEmail && active.personalEmail && (
              <div className="flex items-start gap-5">
                <span className="w-10 h-10 rounded-2 flex items-center justify-center text-brand shrink-0">
                  <Mail size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-brand uppercase tracking-[0.25em]">
                    {workEmailLabel}
                  </span>
                  <a
                    href={workMailHref}
                    className="text-base text-text hover:text-brand transition-colors break-all"
                  >
                    {active.workEmail}
                  </a>
                  <a
                    href={personalMailHref}
                    className="text-base text-text hover:text-brand transition-colors break-all"
                  >
                    {active.personalEmail}
                  </a>
                </div>
              </div>
            )}
            {active.phone && (
              <div className="flex items-start gap-5">
                <span className="w-10 h-10 rounded-2 flex items-center justify-center text-brand shrink-0">
                  <Phone size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-brand uppercase tracking-[0.25em]">
                    {phoneLabel}
                  </span>
                  <a
                    href={phoneHref}
                    className="text-base text-text hover:text-brand transition-colors"
                  >
                    {active.phone}
                  </a>
                  {active.whatsapp && (
                    <a
                      href={active.whatsapp}
                      className="text-base text-text hover:text-brand transition-colors"
                    >
                      {active.whatsapp}
                    </a>
                  )}
                </div>
              </div>
            )}
            {active.addressLines.length > 0 && (
              <div className="flex items-start gap-5">
                <span className="w-10 h-10 rounded-2 flex items-center justify-center text-brand shrink-0">
                  <MapPin size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-brand uppercase tracking-[0.25em]">
                    {addressLabel}
                  </span>
                  <div className="flex flex-col">
                    {active.addressLines.map((line, i) => (
                      <span key={i} className="text-base text-text leading-snug">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {active.websiteUrl && (
              <div className="flex items-start gap-5">
                <span className="w-10 h-10 rounded-2 flex items-center justify-center text-brand shrink-0">
                  <Globe size={20} />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-brand uppercase tracking-[0.25em]">
                    {websiteLabel}
                  </span>
                  <div className="flex flex-col">
                    <a href={websiteUrl} className="text-base text-text hover:text-brand transition-colors">
                      {websiteUrl}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="sticky top-[calc(var(--header-height)+40px)]">
          <div className="feathered-image-sm w-[300px] h-[300px] mx-auto overflow-hidden">
            <Image
              src={texts.portrait_image || '/tibor_image.png'}
              alt="Tibor Buček Professional Portrait"
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          <figure className="mt-6 pl-5">
            <blockquote className="text-md italic text-text leading-relaxed">
              “{texts.contact_quote_text || 'Be diligent in your work, honest in your heart, and kind to people.'}”
            </blockquote>
            <figcaption className="mt-2 text-[11px] font-semibold text-brand uppercase tracking-[0.25em]">
              — {texts.contact_quote_author || 'Confucius'}
            </figcaption>
          </figure>
        </FadeIn>
      </section>

      {active.mapImages.length > 0 && (
        <section className="w-[80%] max-w-[1100px] mx-auto pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text">
              {texts.contact_maps_title || 'Travel routes'}
            </h2>
            {active.mapImages.length > MAP_VISIBLE && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMapIndex((i) => Math.max(0, i - 1))}
                  disabled={mapIndex === 0}
                  aria-label="Previous maps"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:text-brand hover:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMapIndex((i) =>
                      Math.min(active.mapImages.length - MAP_VISIBLE, i + 1),
                    )
                  }
                  disabled={mapIndex >= active.mapImages.length - MAP_VISIBLE}
                  aria-label="Next maps"
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text hover:text-brand hover:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(calc(${-mapIndex} * (100% / ${MAP_VISIBLE} + ${24 / MAP_VISIBLE}px)))`,
              }}
            >
              {active.mapImages.map((src, i) => (
                <div
                  key={i}
                  className="feathered-image-sm shrink-0 overflow-hidden rounded-2"
                  style={{ width: `calc((100% - ${(MAP_VISIBLE - 1) * 24}px) / ${MAP_VISIBLE})` }}
                >
                  <Image
                    src={src}
                    alt={`Travel map ${i + 1}`}
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main >
  );
}
