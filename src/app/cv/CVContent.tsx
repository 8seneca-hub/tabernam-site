'use client';

import type { PageTexts } from '@/lib/directus';
import HeroHeader from '../about/HeroHeader';
import CVSection from './CVSection';

interface Props {
  texts: PageTexts;
}

export default function CVContent({ texts }: Props) {
  return (
    <main className="cv-page pt-[var(--header-height)] pb-24">
      <HeroHeader texts={texts} />
      <CVSection backHref="/about" texts={texts} />
    </main>
  );
}
