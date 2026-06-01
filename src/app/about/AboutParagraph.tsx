'use client';

import { Fragment } from 'react';
import NextLink from 'next/link';
import FadeIn from '@/animations/FadeIn';
import VideoCard from '@/components/ui/VideoCard';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';
import { PageTexts } from '@/lib/data';

interface Props {
  texts: PageTexts;
}

const TOKEN_RE = /(\.{2,}\s*BUTTON\s*\.{2,}|https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
const BUTTON_RE = /^\.{2,}\s*BUTTON\s*\.{2,}$/i;
const URL_RE = /^(https?:\/\/[^\s)]+|www\.[^\s)]+)$/;
const YT_RE = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

function getYouTubeId(url: string): string | null {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const u = new URL(normalized);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.hostname.endsWith('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
    }
  } catch {
  }
  return null;
}

function buildTitleMap(texts: PageTexts): Map<string, string> {
  const pairs: Array<[string | undefined, string | undefined]> = [
    [texts.experience_video_url, texts.experience_video_title],
    [texts.philanthropy_story_1_video_url, texts.philanthropy_story_1_title],
    [texts.philanthropy_story_2_video_url, texts.philanthropy_story_2_title],
  ];
  const map = new Map<string, string>();
  for (const [url, title] of pairs) {
    if (!url || !title) continue;
    const id = getYouTubeId(url);
    if (id) map.set(id, title);
  }
  return map;
}

function Link({ url }: { url: string }) {
  const href = url.startsWith('http') ? url : `https://${url}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand underline-offset-2 hover:underline break-words"
    >
      {url}
    </a>
  );
}

function InlineYouTube({ url, title }: { url: string; title?: string }) {
  return (
    <span className="block my-4">
      <VideoCard videoUrl={url} title={title} />
    </span>
  );
}

function CvButton({ label }: { label: string }) {
  return (
    <Button
      as={NextLink}
      href="/cv"
      variant="primary"
      size="sm"
      shape="pill"
      className="mx-1 text-xs font-semibold !text-white uppercase tracking-[0.2em] shadow-md align-middle"
    >
      {label}
    </Button>
  );
}

function renderParagraph(text: string, titleMap: Map<string, string>, cvLabel: string) {
  const parts = text.split(TOKEN_RE);
  for (let i = 1; i < parts.length; i += 2) {
    if (!YT_RE.test(parts[i])) continue;
    if (i - 1 >= 0) parts[i - 1] = parts[i - 1].replace(/\(\s*$/, '');
    if (i + 1 < parts.length) parts[i + 1] = parts[i + 1].replace(/^\s*\)/, '');
  }
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      if (BUTTON_RE.test(part)) return <CvButton key={i} label={cvLabel} />;
      if (YT_RE.test(part)) {
        const id = getYouTubeId(part);
        const title = id ? titleMap.get(id) : undefined;
        return <InlineYouTube key={i} url={part} title={title} />;
      }
      if (URL_RE.test(part)) return <Link key={i} url={part} />;
    }
    if (!part) return null;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function AboutParagraph({ texts }: Props) {
  const { t } = useI18n();
  const body = texts.about_paragraph_body;
  const eyebrow = texts.about_eyebrow;
  if (!body) return null;

  const titleMap = buildTitleMap(texts);
  const cvLabel = t('btn.viewCV');
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="py-16 md:py-20">
      <div className="w-[80%] max-w-3xl mx-auto flex flex-col gap-5">
        <FadeIn delay={0.05} className="flex flex-col gap-4 items-center text-center">
          {eyebrow && (
            <span className="block text-xs font-semibold text-brand uppercase tracking-[0.2em]">
              {eyebrow}
            </span>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-text tracking-tight leading-tight max-md:text-4xl">
            {t('heading.aboutMe')}
          </h1>
        </FadeIn>
        {paragraphs.map((p, i) => (
          <FadeIn key={i} delay={0.03 + i * 0.02}>
            <div className="text-lg font-normal text-text leading-relaxed whitespace-pre-line">
              {renderParagraph(p, titleMap, cvLabel)}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
