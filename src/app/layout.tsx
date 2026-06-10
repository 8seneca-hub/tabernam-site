import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Pinyon_Script } from 'next/font/google';
import './globals.css';

// Every route reads live data from Directus via `cache: 'no-store'` so the
// CMS edits show up on the next request. That makes the routes inherently
// dynamic — opt out of Next.js's static pre-rendering at build time.
export const dynamic = 'force-dynamic';
import { I18nProvider } from '@/app/hook/useI18n';
import { ThemeProvider } from '@/lib/theme-context';
import { getLanguages, getDictionaries, getSiteSettings, getContactOffice } from '@/lib/directus';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  /* Variable name kept as `--font-dm-sans` so the rest of the codebase
     (globals.css, inline `style={{ fontFamily: ... }}` references) continues
     to resolve to whatever the body font currently is, without touching every
     call site. */
  variable: '--font-dm-sans',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-noto-sc',
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pinyon-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tabernam - Global activity presence',
  description: 'Tabernam — Global activity presence',
  openGraph: {
    title: 'Tabernam - Global activity presence',
    description: 'Tabernam — Global activity presence',
    images: [{ url: '/tabernam-logo.png', width: 928, height: 164, alt: 'TaberNam' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tabernam - Global activity presence',
    description: 'Tabernam — Global activity presence',
    images: ['/tabernam-logo.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, dictionaries, settings, office] = await Promise.all([
    getLanguages(),
    getDictionaries(),
    getSiteSettings(),
    getContactOffice(),
  ]);

  const themeVars = {
    '--color-bg': settings.colorBg,
    '--color-text': settings.colorText,
    '--color-muted': settings.colorMuted,
    '--color-surface': settings.colorSurface,
    '--color-button': settings.colorButton,
    '--color-button-text': settings.colorButtonText,
    '--color-button-hover': settings.colorButtonHover,
    '--color-header': settings.colorHeader,
    '--color-border': settings.colorBorder,
    '--color-footer-bg': settings.colorFooterBg,
    '--color-brand': settings.colorBrand,
    '--color-accent': settings.colorAccent,
    // Tailwind v4 derives bg-brand / text-brand from --brand and --accent (the
    // base palette names); set those too so the utility classes pick up the
    // override.
    '--brand': settings.colorBrand,
    '--accent': settings.colorAccent,
    '--max-width': settings.maxWidth,
    '--side-padding': settings.sidePadding,
    '--header-height': settings.headerHeight,
    ...(settings.fontFamily ? { '--font-override': `'${settings.fontFamily}'` } : {}),
  } as React.CSSProperties;

  // If the user picked a body font, ask Google Fonts for it server-side so the
  // page renders with the right typeface immediately (no flash of fallback).
  const googleFontHref = settings.fontFamily
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(settings.fontFamily).replace(/%20/g, '+')}:wght@300;400;500;600;700;800&display=swap`
    : null;

  return (
    <html lang="en" className={`${inter.variable} ${notoSansSC.variable} ${pinyonScript.variable}`} style={themeVars}>
      <head>
        {/* Material Icons web font — drives the contact-channel icons set
            via the Directus icon picker. */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        {/* Selected body font from site_settings.font_family. */}
        {googleFontHref && <link rel="stylesheet" href={googleFontHref} />}
      </head>
      <body
        className="bg-bg text-text leading-snug min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <I18nProvider languages={languages} dictionaries={dictionaries}>
          <ThemeProvider settings={settings}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer office={office} />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
