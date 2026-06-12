import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tabernam.at';

const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/',            priority: 1.0, changeFrequency: 'weekly' },
  { path: '/about',       priority: 0.9, changeFrequency: 'monthly' },
  { path: '/activities',  priority: 0.8, changeFrequency: 'weekly' },
  { path: '/cv',          priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact',     priority: 0.7, changeFrequency: 'monthly' },
  { path: '/globe',       priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
