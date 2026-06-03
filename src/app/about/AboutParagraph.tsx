'use client';

import { Fragment } from 'react';
import NextLink from 'next/link';
import VideoCard from '@/components/ui/VideoCard';
import Button from '@/components/ui/Button';
import { useI18n } from '@/app/hook/useI18n';
import { PageTexts } from '@/lib/data';

interface Props {
  texts: PageTexts;
  /** Explicit body text (e.g. from a CMS block). Falls back to about_paragraph_body. */
  text?: string;
  /** Slice of the body paragraphs to render (e.g. end={2} for the intro). Ignored when `text` is set. */
  start?: number;
  end?: number;
  /** Render the inline CV "..BUTTON.." token as plain text instead of a button. */
  cvAsText?: boolean;
  /** Typography classes for each paragraph (size/leading/weight/etc). */
  paragraphClassName?: string;
  /**
   * Split the FIRST selected CMS paragraph into two visual paragraphs after the
   * Nth sentence — lets a single CMS paragraph render as two spaced blocks
   * without editing the CMS body. No-op if it has fewer than N+1 sentences.
   */
  splitAfterSentence?: number;
  /** Drop inline YouTube embeds (used when the video is shown as a block instead). */
  suppressVideos?: boolean;
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
      className="text-dark underline underline-offset-2 hover:text-brand break-words"
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

function renderParagraph(text: string, titleMap: Map<string, string>, cvLabel: string, cvAsText = false, suppressVideos = false) {
  const parts = text.split(TOKEN_RE);
  for (let i = 1; i < parts.length; i += 2) {
    if (!YT_RE.test(parts[i])) continue;
    if (i - 1 >= 0) parts[i - 1] = parts[i - 1].replace(/\(\s*$/, '');
    if (i + 1 < parts.length) parts[i + 1] = parts[i + 1].replace(/^\s*\)/, '');
  }
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      if (BUTTON_RE.test(part)) return cvAsText ? <Fragment key={i}>{cvLabel}</Fragment> : <CvButton key={i} label={cvLabel} />;
      if (YT_RE.test(part)) {
        if (suppressVideos) return null;
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

/** Split a single paragraph into two after the Nth sentence (period-delimited). */
function splitParagraphAfterSentence(paragraph: string, after: number): string[] {
  const sentences = paragraph.split(/(?<=\.)\s+/);
  if (sentences.length <= after) return [paragraph];
  return [sentences.slice(0, after).join(' '), sentences.slice(after).join(' ')];
}

/**
 * Renders just the About intro paragraphs (heading + image + section live in
 * SubpageHero, which composes this as its body content).
 */
export default function AboutParagraph({
  texts,
  text,
  start = 0,
  end,
  cvAsText = false,
  paragraphClassName = 'text-[20px] font-medium tracking-[-0.02rem] text-dark leading-relaxed',
  splitAfterSentence,
  suppressVideos = false,
}: Props) {
  const { t } = useI18n();
  const body = text ?? texts.about_paragraph_body;
  if (!body) return null;

  const titleMap = buildTitleMap(texts);
  const cvLabel = t('btn.viewCV');
  const allParagraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Explicit `text` (a CMS block) renders whole; otherwise slice the shared body.
  let paragraphs = text != null ? allParagraphs : allParagraphs.slice(start, end);
  if (paragraphs.length === 0) return null;
  // Optionally break the first selected paragraph into two at a sentence boundary.
  if (splitAfterSentence && paragraphs.length > 0) {
    const [first, ...rest] = paragraphs;
    paragraphs = [...splitParagraphAfterSentence(first, splitAfterSentence), ...rest];
  }

  return (
    <div className="flex flex-col gap-[24px]">
      {paragraphs.map((p, i) => (
        <div key={i} className={`${paragraphClassName} whitespace-pre-line`}>
          {renderParagraph(p, titleMap, cvLabel, cvAsText, suppressVideos)}
        </div>
      ))}
    </div>
  );
}
