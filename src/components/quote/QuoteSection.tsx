'use client';

import { useEffect, useMemo } from 'react';
import { motion, animate, useMotionValue, useTransform, type MotionValue } from 'motion/react';

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';
const FALLBACK_ZH = '贸易不是一笔交易。它是一种关系——跨越数十年建立，通过信任维持，并以合同签署后仍然持续的事物来衡量。';

interface Props {
  en?: string;
  zh?: string;
}

const SWEEP_DURATION_S = 8;
const HOLD_AT_FULL_S = 1.5;

function RevealChar({
  progress,
  start,
  end,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  children: React.ReactNode;
}) {
  const color = useTransform(
    progress,
    [start, end],
    ['var(--color-surface)', 'var(--brand)']
  );
  return <motion.span style={{ color }}>{children}</motion.span>;
}

export default function QuoteSection({ en, zh }: Props) {
  const progress = useMotionValue(0);

  const enText = en && en.trim() ? en : FALLBACK_EN;
  const zhText = zh && zh.trim() ? zh : FALLBACK_ZH;

  const enChars = useMemo(() => [...enText], [enText]);
  const zhChars = useMemo(() => [...zhText], [zhText]);

  const enLen = enChars.length;
  const zhLen = zhChars.length;
  const overlap = 6;
  const totalSlots = enLen + zhLen + overlap;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        progress.set(0);
        await animate(progress, 1, {
          duration: SWEEP_DURATION_S,
          ease: 'linear',
        });
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, HOLD_AT_FULL_S * 1000));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [progress]);

  return (
    <section className="quote relative w-full min-h-screen flex items-center justify-center px-[var(--side-padding)] py-20">
      <div className="flex flex-col gap-[30px] w-[70vw] max-w-[900px] mx-auto text-center max-[1100px]:w-full max-[1100px]:max-w-none">
        <p className="text-[36px] font-medium leading-snug max-[1100px]:text-[28px]">
          {enChars.map((ch, i) => (
            <RevealChar
              key={`en-${i}`}
              progress={progress}
              start={i / totalSlots}
              end={(i + overlap) / totalSlots}
            >
              {ch}
            </RevealChar>
          ))}
        </p>
        <p
          className="text-[24px] font-light leading-relaxed max-[1100px]:text-[20px]"
          style={{ fontFamily: 'var(--font-dm-sans), var(--font-noto-sc), sans-serif' }}
        >
          {zhChars.map((ch, i) => (
            <RevealChar
              key={`zh-${i}`}
              progress={progress}
              start={(enLen + i) / totalSlots}
              end={(enLen + i + overlap) / totalSlots}
            >
              {ch}
            </RevealChar>
          ))}
        </p>
      </div>
    </section>
  );
}
