'use client';

import { useEffect, useMemo } from 'react';
import { motion, animate, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import Image from '@/components/ui/Image';

const FALLBACK_EN = 'Trade is not a transaction. It is a relationship — built across decades, sustained through trust, and measured by what endures long after the contract is signed.';

interface Props {
  en?: string;
  imageUrl?: string;
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

export default function QuoteSection({ en, imageUrl }: Props) {
  const progress = useMotionValue(0);

  const enText = en && en.trim() ? en : FALLBACK_EN;

  const enChars = useMemo(() => [...enText], [enText]);

  const overlap = 6;
  const totalSlots = enChars.length + overlap;

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
    <section className="quote relative w-full min-h-screen flex items-center px-[var(--side-padding)] py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-[30px] text-left">
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
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="w-[480px] h-[600px] overflow-hidden max-w-full">
            <Image
              src={imageUrl || '/tibor_image.png'}
              alt="Quote illustration"
              width={480}
              height={600}
              className="w-[480px] h-[600px] object-cover max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
