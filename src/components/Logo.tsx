'use client';

import { useTheme } from '@/lib/theme-context';

interface Props {
  /** Rendered font size in pixels. Default 32 (header size). */
  size?: number;
  className?: string;
}

/**
 * Shared TaberNam wordmark. Uses the Pinyon Script cursive font + the
 * CMS-driven brand color, so it scales infinitely (vector font, not a
 * bitmap PNG) and stays consistent between header and footer.
 *
 * Size knob lets each placement choose its own visual weight:
 *   <Logo size={32} />  → header (compact)
 *   <Logo size={64} />  → footer (prominent)
 */
export default function Logo({ size = 32, className = '' }: Props) {
  const { logoText } = useTheme();

  return (
    <span
      className={`text-brand leading-none select-none whitespace-nowrap ${className}`}
      style={{
        fontFamily: 'var(--font-pinyon-script), cursive',
        fontSize: `${size}px`,
        // Slightly lift the baseline so the descenders ('p', 'g' if used)
        // don't get clipped by parent containers with tight heights.
        paddingBottom: `${Math.round(size * 0.08)}px`,
      }}
    >
      {logoText || 'TaberNam'}
    </span>
  );
}
