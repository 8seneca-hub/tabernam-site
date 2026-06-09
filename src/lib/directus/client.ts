import { createDirectus, rest, staticToken } from '@directus/sdk';
import { CMSSchema } from '../type';

const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
const directusToken = process.env.DIRECTUS_TOKEN || '';

const directus = createDirectus<CMSSchema>(directusUrl)
  .with(staticToken(directusToken))
  .with(rest({
    onRequest: (options) => ({ ...options, cache: 'no-store' as RequestCache }),
  }));

export default directus;

/**
 * Build a public URL for a Directus file.
 *
 * `version` (a file's `modified_on`, or any value that changes when the file
 * content changes) is appended as `?v=…`. Directus "Replace File" keeps the
 * same file id — and therefore the same URL — so without a version param,
 * browsers / CDNs / the Next.js image optimizer keep serving the OLD bytes for
 * up to the asset's max-age (30 days). Passing the file's modified_on makes the
 * URL change on every replace, so caches miss and the new image shows.
 */
export function assetUrl(
  value: string | null | undefined,
  version?: string | number | null,
): string {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return value;
  const url = `${directusUrl}/assets/${value}`;
  if (version === undefined || version === null || version === '') return url;
  return `${url}?v=${encodeURIComponent(String(version))}`;
}
