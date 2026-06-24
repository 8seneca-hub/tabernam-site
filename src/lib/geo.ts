import { headers } from 'next/headers';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { country: string | null; expiresAt: number }>();

function getClientIp(h: Headers): string | null {
  const xff = h.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const xri = h.get('x-real-ip');
  if (xri) return xri.trim();
  return null;
}

async function lookupCountry(ip: string): Promise<string | null> {
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.country;

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: AbortSignal.timeout(2500),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`ipapi ${res.status}`);
    const text = (await res.text()).trim();
    const country = /^[A-Z]{2}$/.test(text) ? text : null;
    cache.set(ip, { country, expiresAt: Date.now() + CACHE_TTL_MS });
    return country;
  } catch {
    cache.set(ip, { country: null, expiresAt: Date.now() + 5 * 60 * 1000 });
    return null;
  }
}

export async function getCountry(): Promise<string | null> {
  const h = await headers();
  const ip = getClientIp(h);
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return null;
  }
  return lookupCountry(ip);
}

export async function isChinaVisitor(): Promise<boolean> {
  return (await getCountry()) === 'CN';
}
