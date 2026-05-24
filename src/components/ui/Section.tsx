'use client';

import type { ReactNode } from 'react';
import FadeIn from '@/animations/FadeIn';

interface Props {
  title: string;
  children: ReactNode;
}

export default function Section({ title, children }: Props) {
  return (
    <FadeIn delay={0.05}>
      <section>
        <h2 className="text-2xl font-bold uppercase tracking-wider text-brand pb-3 border-b border-brand/25 mb-6">
          {title}
        </h2>
        {children}
      </section>
    </FadeIn>
  );
}
