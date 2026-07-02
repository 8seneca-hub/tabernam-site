import posthog from 'posthog-js';

export type MediaKind = 'video' | 'image' | 'video-thumbnail' | 'youtube-iframe' | 'bilibili-iframe';

interface MediaErrorContext {
  /** The source URL that failed to load. */
  src?: string;
  /** Whether the China (chinaUrl) variant was being served. */
  useChina?: boolean;
  /** Optional label for where in the UI the media lives (e.g. "home-marquee"). */
  surface?: string;
  /** Any extra properties worth attaching to the issue. */
  [key: string]: unknown;
}

/**
 * Report a media load failure to PostHog Error Tracking.
 *
 * Failed `<video>` / `<img>` loads and blocked embeds do NOT throw JS
 * exceptions, so `capture_exceptions` autocapture never sees them. We surface
 * them explicitly as a tagged synthetic Error so they group into one issue.
 * PostHog auto-enriches events with `$geoip_country_code`, so these can be
 * filtered to China (CN) in the dashboard without any client-side geo logic.
 */
export function captureMediaError(kind: MediaKind, ctx: MediaErrorContext = {}): void {
  // Guard against SSR / posthog not yet loaded — never let reporting throw.
  try {
    const error = new Error(`Media failed to render: ${kind}${ctx.src ? ` (${ctx.src})` : ''}`);
    error.name = 'MediaRenderError';
    posthog.captureException(error, {
      media_kind: kind,
      media_src: ctx.src,
      media_use_china: ctx.useChina,
      media_surface: ctx.surface,
      ...ctx,
    });
  } catch {
    // Reporting must be best-effort.
  }
}
