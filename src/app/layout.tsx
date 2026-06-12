import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Pinyon_Script, Crimson_Text } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';
import { I18nProvider } from '@/app/hook/useI18n';
import { ThemeProvider } from '@/lib/theme-context';
import { getLanguages, getDictionaries, getSiteSettings, getContactOffice } from '@/lib/directus';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
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

const crimsonText = Crimson_Text({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-crimson-text',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tabernam.at';
const SITE_NAME = 'Tabernam';
const FALLBACK_TITLE = 'Tabernam — Global activity presence';
const FALLBACK_DESCRIPTION =
  'Tabernam — Four decades of foreign trade, partnerships and consulting across Asia, Europe and the Americas. Founded by Tibor Buček.';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.metaTitle || FALLBACK_TITLE;
  const description = settings.metaDescription || FALLBACK_DESCRIPTION;
  const keywords = settings.metaKeywords?.length
    ? settings.metaKeywords
    : ['Tabernam', 'Tibor Buček', 'foreign trade', 'consulting'];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: 'Tibor Buček' }],
    creator: 'Tibor Buček',
    publisher: SITE_NAME,
    keywords,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: SITE_URL,
      locale: 'en_US',
      // OG image priority: editor-uploaded → bundled fallback.
      images: settings.metaOgImage
        ? [{ url: settings.metaOgImage, alt: 'Tabernam' }]
        : [{ url: '/Tabernam_OG_image.png', width: 1344, height: 768, alt: 'Tabernam' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [settings.metaOgImage || '/Tabernam_OG_image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || '4ql67FCutoX_a48sEzCMQ0zJM0TFtjuwcP6yroWWq2s',
    },
  };
}

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
    '--brand': settings.colorBrand,
    '--accent': settings.colorAccent,
    '--max-width': settings.maxWidth,
    '--side-padding': settings.sidePadding,
    '--header-height': settings.headerHeight,
    ...(settings.fontFamily ? { '--font-override': `'${settings.fontFamily}'` } : {}),
  } as React.CSSProperties;

  const googleFontHref = settings.fontFamily
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(settings.fontFamily).replace(/%20/g, '+')}:wght@300;400;500;600;700;800&display=swap`
    : null;

  return (
    <html lang="en" className={`${inter.variable} ${notoSansSC.variable} ${pinyonScript.variable} ${crimsonText.variable}`} style={themeVars}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
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
