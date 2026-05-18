'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteSettings } from './directus';

const defaults: SiteSettings = {
  colorBg: '#ffffff',
  colorText: '#2e2e2e',
  colorMuted: '#646464',
  colorSurface: '#c7c7c7',
  colorButton: '#e8e8e8',
  colorButtonText: '#000000',
  colorButtonHover: '#d9d9d9',
  colorHeader: '#ffffff',
  colorBorder: '#c7c7c7',
  colorFooterBg: '#f6f6f6',
  fontFamily: '',
  logoText: 'Tabernam',
  maxWidth: '1512px',
  sidePadding: '40px',
  headerHeight: '60px',
};

const ThemeContext = createContext<SiteSettings>(defaults);

export function ThemeProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  return (
    <ThemeContext.Provider value={settings}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
