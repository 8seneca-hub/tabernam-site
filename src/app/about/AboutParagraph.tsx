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
  /** Tailwind gap utility controlling the vertical spacing between paragraphs. */
  paragraphGap?: string;
  /**
   * Split the FIRST selected CMS paragraph into two visual paragraphs after the
   * Nth sentence — lets a single CMS paragraph render as two spaced blocks
   * without editing the CMS body. No-op if it has fewer than N+1 sentences.
   */
  splitAfterSentence?: number;
  /** Drop inline YouTube embeds (used when the video is shown as a block instead). */
  suppressVideos?: boolean;
}

const TOKEN_RE = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\{\{LATIN\}\}|\.{2,}\s*BUTTON\s*\.{2,}|https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
const MD_LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
const BOLD_RE = /^\*\*([^*]+)\*\*$/;
const LATIN_TOKEN_RE = /^\{\{LATIN\}\}$/;
const URL_RE = /^(https?:\/\/[^\s)]+|www\.[^\s)]+)$/;
const YT_RE = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;
// Fixed Latin slogan — rendered from this constant (never the CMS) so it stays
// identical regardless of the selected language.
const LATIN_SLOGAN = '"Honeste lucra, nobiliter dona"';

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

// Named inline link: the visible label is the descriptive name; the address is
// the (hidden) href. Inline styles (not Tailwind utilities) on purpose:
// globals.css has an unlayered `a { color: inherit; text-decoration: none }`
// reset that would silently override `text-brand`/`underline` utilities here.
function MarkdownLink({ label, url }: { label: string; url: string }) {
  const href = url.startsWith('http') ? url : `https://${url}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words"
      style={{
        color: 'var(--color-brand)',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        textDecorationSkipInk: 'none',
      }}
    >
      {label}
    </a>
  );
}

// Bold, brand-colored emphasis — used for the Latin slogan and its translation.
function QuoteEmphasis({ children }: { children: string }) {
  return <strong style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{children}</strong>;
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
      const md = part.match(MD_LINK_RE);
      if (md) return <MarkdownLink key={i} label={md[1]} url={md[2]} />;
      if (LATIN_TOKEN_RE.test(part)) return <QuoteEmphasis key={i}>{LATIN_SLOGAN}</QuoteEmphasis>;
      const bold = part.match(BOLD_RE);
      if (bold) return <QuoteEmphasis key={i}>{bold[1]}</QuoteEmphasis>;
      if (YT_RE.test(part)) {
        if (suppressVideos) return null;
        const id = getYouTubeId(part);
        const title = id ? titleMap.get(id) : undefined;
        return <InlineYouTube key={i} url={part} title={title} />;
      }
      // A bare address (not wrapped in a [name](url) link) renders as plain text —
      // we never style a raw URL as the link itself.
      if (URL_RE.test(part)) return <Fragment key={i}>{part}</Fragment>;
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
  paragraphGap = 'gap-[40px]',
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
    <div className={`flex flex-col ${paragraphGap}`}>
      {paragraphs.map((p, i) => (
        <div key={i} className={`${paragraphClassName} whitespace-pre-line`}>
          {renderParagraph(p, titleMap, cvLabel, cvAsText, suppressVideos)}
        </div>
      ))}
    </div>
  );
}
