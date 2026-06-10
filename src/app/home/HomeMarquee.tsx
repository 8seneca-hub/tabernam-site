'use client';

import { motion } from 'motion/react';
import Image from '@/components/ui/Image';
import type { MarqueeImage } from '@/lib/directus';

interface Props {
  images?: MarqueeImage[];
}

const FALLBACK_ROWS: Record<1 | 2 | 3, MarqueeImage[]> = {
  1: [
    // { image: '/carousel/photo-03.jpg', alt: '', row: 1 },
    // { image: '/carousel/photo-07.jpg', alt: '', row: 1 },
    // { image: '/carousel/photo-11.jpg', alt: '', row: 1 },
    // { image: '/carousel/photo-15.jpg', alt: '', row: 1 },
    // { image: '/carousel/photo-19.jpg', alt: '', row: 1 },
    // { image: '/carousel/photo-23.jpg', alt: '', row: 1 },
  ],
  2: [
    // { image: '/carousel/photo-05.jpg', alt: '', row: 2 },
    // { image: '/carousel/photo-09.jpg', alt: '', row: 2 },
    // { image: '/carousel/photo-13.jpg', alt: '', row: 2 },
    // { image: '/carousel/photo-17.jpg', alt: '', row: 2 },
    // { image: '/carousel/photo-21.jpg', alt: '', row: 2 },
    // { image: '/carousel/photo-25.jpg', alt: '', row: 2 },
  ],
  3: [
    // { image: '/carousel/photo-02.jpg', alt: '', row: 3 },
    // { image: '/carousel/photo-06.jpg', alt: '', row: 3 },
    // { image: '/carousel/photo-10.jpg', alt: '', row: 3 },
    // { image: '/carousel/photo-14.jpg', alt: '', row: 3 },
    // { image: '/carousel/photo-18.jpg', alt: '', row: 3 },
    // { image: '/carousel/photo-22.jpg', alt: '', row: 3 },
  ],
};

function groupByRow(images: MarqueeImage[]): Record<1 | 2 | 3, MarqueeImage[]> {
  const out: Record<1 | 2 | 3, MarqueeImage[]> = { 1: [], 2: [], 3: [] };
  for (const m of images) out[m.row].push(m);
  return out;
}

const ROW_DIRECTIONS: Record<1 | 2 | 3, 'right' | 'left'> = {
  1: 'right',
  2: 'left',
  3: 'right',
};

export default function HomeMarquee({ images }: Props) {
  const grouped = images && images.length > 0 ? groupByRow(images) : FALLBACK_ROWS;
  const rows: Array<1 | 2 | 3> = [1, 2, 3];

  return (
    <motion.section
      className="home-marquee w-full flex flex-col gap-5 py-[120px]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] }}
    >
      {rows.map((row) => {
        const rowImages = grouped[row].length > 0 ? grouped[row] : FALLBACK_ROWS[row];
        const direction = ROW_DIRECTIONS[row];
        return (
          <div key={row} className="marquee">
            <div className={`marquee-track marquee-track--${direction}`} aria-hidden="true">
              {[...rowImages, ...rowImages].map((m, i) => (
                <div key={`row${row}-${i}`} className="marquee-cell bg-gray-40">
                  <Image src={m.image} alt={m.alt} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}
