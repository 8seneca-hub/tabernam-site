'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useI18n } from '@/app/hook/useI18n';
import type { City } from './types';

interface Props {
  isOpen: boolean;
  city: City | null;
  photos: string[] | null;
  photoIdx: number;
  onClose: () => void;
}

export default function DetailPanel({ isOpen, city, photos, photoIdx, onClose }: Props) {
  const { t } = useI18n();
  return (
    <motion.aside
      className="fixed top-1/2 right-12 w-[420px] max-w-[calc(100vw-32px)] z-[11] text-white -translate-y-1/2"
      animate={{
        x: isOpen ? '0%' : '120%',
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        x: { duration: 0.9, ease: [0.65, 0.05, 0.36, 1] },
        opacity: { duration: 0.5, ease: 'easeOut' },
      }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      aria-hidden={!isOpen}
    >
      {city && photos && (
        <article className="relative flex flex-col bg-[#0a1d3a] text-white rounded-[20px] overflow-hidden border-2 border-white/[0.18] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <div className="feathered-image-sm relative w-full aspect-[16/10] shrink-0 overflow-hidden bg-[#111]">
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p + i}
                src={p}
                alt=""
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[600ms] ${i === photoIdx ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2 z-[1] flex gap-1 pointer-events-none" aria-hidden="true">
              {photos.map((p, i) => (
                <span
                  key={p + i}
                  className={`w-[30px] h-[2px] rounded-full transition-colors duration-300 ${i === photoIdx ? 'bg-white/85' : 'bg-white/[0.28]'}`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={t('globe.panel.close')}
              onClick={onClose}
              className="absolute top-[14px] right-[14px] w-[34px] h-[34px] z-[2] flex items-center justify-center bg-black/45 rounded-full text-white p-0 transition-all duration-200 hover:bg-black/70 hover:scale-105 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="px-7 pt-6 pb-7 flex flex-col">
            <h2 className="mb-[18px] text-white font-bold text-[30px] leading-[1.15] tracking-[-0.01em]">
              {city.name}
            </h2>
            <p className="mb-6 text-[#d8dde6] text-[15px] leading-[1.55] font-normal">
              {city.desc}
            </p>
            <Link
              href={`/activities?id=${city.slug}`}
              className="self-start px-[22px] py-[10px] bg-white text-[#0a1d3a] rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:bg-[#e6ecf5] hover:-translate-y-px"
            >
              {t('globe.panel.viewDetails')}
            </Link>
          </div>
        </article>
      )}
    </motion.aside>
  );
}
