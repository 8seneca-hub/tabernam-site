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

export function assetUrl(value: string | null | undefined): string {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return value;
  return `${directusUrl}/assets/${value}`;
}
