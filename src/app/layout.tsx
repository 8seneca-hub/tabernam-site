import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n-context';
import { ThemeProvider } from '@/lib/theme-context';
import { getLanguages, getDictionaries, getSiteSettings } from '@/lib/directus';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-sc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TABERNAM',
  description: 'Tabernam — Global activity presence',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, dictionaries, settings] = await Promise.all([
    getLanguages(),
    getDictionaries(),
    getSiteSettings(),
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
    '--max-width': settings.maxWidth,
    '--side-padding': settings.sidePadding,
    '--header-height': settings.headerHeight,
    ...(settings.fontFamily ? { '--font-override': settings.fontFamily } : {}),
  } as React.CSSProperties;

  return (
    <html lang="en" className={`${inter.variable} ${notoSansSC.variable}`} style={themeVars}>
      <body className="bg-bg text-text leading-snug">
        <I18nProvider languages={languages} dictionaries={dictionaries}>
          <ThemeProvider settings={settings}>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
