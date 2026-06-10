'use client';

import { Fragment } from 'react';

interface Props {
  /** Body text to render. Each blank line in the string becomes a new paragraph. */
  text?: string;
  /** Typography classes for each paragraph (size/leading/weight/etc). */
  paragraphClassName?: string;
  /** Tailwind gap utility controlling the vertical spacing between paragraphs. */
  paragraphGap?: string;
}

const TOKEN_RE = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\{\{LATIN\}\}|https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
const MD_LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
const BOLD_RE = /^\*\*([^*]+)\*\*$/;
const LATIN_TOKEN_RE = /^\{\{LATIN\}\}$/;
const URL_RE = /^(https?:\/\/[^\s)]+|www\.[^\s)]+)$/;
// Fixed Latin slogan — rendered from this constant (never the CMS) so it stays
// identical regardless of the selected language.
const LATIN_SLOGAN = '"Honeste lucra, nobiliter dona"';

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

function renderParagraph(text: string) {
  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const md = part.match(MD_LINK_RE);
      if (md) return <MarkdownLink key={i} label={md[1]} url={md[2]} />;
      if (LATIN_TOKEN_RE.test(part)) return <QuoteEmphasis key={i}>{LATIN_SLOGAN}</QuoteEmphasis>;
      const bold = part.match(BOLD_RE);
      if (bold) return <QuoteEmphasis key={i}>{bold[1]}</QuoteEmphasis>;
      // A bare URL (not wrapped in a [name](url) link) renders as plain text.
      if (URL_RE.test(part)) return <Fragment key={i}>{part}</Fragment>;
    }
    if (!part) return null;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function AboutParagraph({
  text,
  paragraphClassName = 'text-[20px] font-medium tracking-[-0.02rem] text-dark leading-relaxed',
  paragraphGap = 'gap-[40px]',
}: Props) {
  if (!text) return null;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return null;

  return (
    <div className={`flex flex-col ${paragraphGap}`}>
      {paragraphs.map((p, i) => (
        <div key={i} className={`${paragraphClassName} whitespace-pre-line`}>
          {renderParagraph(p)}
        </div>
      ))}
    </div>
  );
}
