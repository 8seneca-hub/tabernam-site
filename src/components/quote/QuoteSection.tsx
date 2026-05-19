'use client';

import { useRef, useMemo, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import type { PageTexts, Feature } from '@/lib/directus';

interface Props {
  texts?: PageTexts;
  features?: Feature[];
}

const FALLBACK_EN = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const FALLBACK_ZH = '\u7F57\u9A6C\u5047\u540D\u75DB\u82E6\u5750\u5728\u8FD9\u91CC\uFF0C\u6784\u6210\u4E86\u4E00\u4E2A\u7CBE\u81F4\u7684\u5B66\u672F\u754C\u3002\u4E3A\u4E86\u5DE5\u4F5C\u548C\u75DB\u82E6\u7684\u5DE8\u5927\u5229\u76CA\uFF0C\u8FDB\u884C\u4E86\u4E00\u4E9B\u4E34\u65F6\u7684\u5DE5\u4F5C\u3002\u4E3A\u4E86\u6700\u5C0F\u5316\u8BF7\u6C42\uFF0C\u8C01\u4E5F\u4E0D\u60F3\u8FDB\u884C\u4E0D\u5FC5\u8981\u7684\u52B3\u52A8\uFF0C\u9664\u975E\u662F\u4E3A\u4E86\u83B7\u5F97\u67D0\u79CD\u4FBF\u5229\u3002';

const FALLBACK_FEATURES: Feature[] = [
  { iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>', text: 'Morbi leo risus porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.' },
  { iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17 8.5 14.5a2 2 0 0 1 0-2.83l3.67-3.67a2 2 0 0 1 2.83 0L17.5 10.5"/><path d="m13 19 1.5 1.5a2 2 0 0 0 2.83 0L21 17a2 2 0 0 0 0-2.83L18.5 11.5"/><path d="M3 14.5 5.5 17a2 2 0 0 0 2.83 0l1.17-1.17"/><path d="M2 11.5 5.5 8 9 11.5"/></svg>', text: 'Morbi leo risus porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.' },
  { iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>', text: 'Morbi leo risus porta ac consectetur ac, vestibulum at eros. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.' },
];

function RevealText({ text, splitBy }: { text: string; splitBy: 'word' | 'char' }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setProgress(v));

  const tokens = useMemo(() => {
    if (splitBy === 'word') {
      return text.split(/(\s+)/).filter(Boolean);
    }
    return [...text];
  }, [text, splitBy]);

  const nonSpaceCount = useMemo(
    () => tokens.filter((t) => !/^\s+$/.test(t)).length,
    [tokens],
  );

  let unitIndex = 0;

  return (
    <span ref={ref} className="inline">
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
        const idx = unitIndex++;
        const threshold = idx / nonSpaceCount;
        const visible = progress > threshold;
        return (
          <span
            key={i}
            className="inline-block transition-[opacity,transform] duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            {tok}
          </span>
        );
      })}
    </span>
  );
}

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
  }),
};

export default function QuoteSection({ texts = {}, features }: Props) {
  const enText = texts.quote_en || FALLBACK_EN;
  const zhText = texts.quote_zh || FALLBACK_ZH;
  const items = features && features.length > 0 ? features : FALLBACK_FEATURES;

  return (
    <section className="quote min-h-screen w-[1080px] max-w-[calc(100%-80px)] mx-auto flex flex-col justify-center items-center gap-15 pb-15 max-[1100px]:min-h-auto max-[1100px]:py-20">
      <div className="flex flex-col gap-[30px] w-full text-center">
        <p className="text-2xl font-normal text-text leading-snug max-[1100px]:text-[22px]">
          <RevealText text={enText} splitBy="word" />
        </p>
        <p className="font-[var(--font-inter),var(--font-noto-sc),sans-serif] text-2xl font-normal text-[#868686] leading-relaxed max-[1100px]:text-[22px]">
          <RevealText text={zhText} splitBy="char" />
        </p>
      </div>
      <ul className="list-none flex gap-15 items-start justify-center flex-wrap">
        {items.map((feature, i) => (
          <motion.li
            key={i}
            className="w-[229px] flex flex-col gap-5 items-start text-left"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={featureVariants}
          >
            {feature.iconSvg && (
              <span
                className="feature-icon inline-flex items-center justify-center w-12 h-12 border border-black rounded-[14px] text-black shrink-0"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: feature.iconSvg }}
              />
            )}
            <p className="text-base font-normal text-black leading-normal">{feature.text}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
