import type React from 'react';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Nunito_Sans, Montserrat } from 'next/font/google';
import { ThemeProvider as NextThemeProvider } from '../components/theme-provider';
import { ThemeProvider } from '../lib/theme';
import { AgentProvider } from '../context/agent-context';
import { CrossPlatformProvider } from '../components/cross-platform/cross-platform-provider';
import { EnhancedUXProvider } from '../components/modern-ux/enhanced-user-experience';

// 初始化Redis缓存（只在服务器端）
if (typeof window === 'undefined') {
  import('../lib/cache/redis-init').then(({ initializeRedis }) => {
    initializeRedis().catch(console.error);
  });
}

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '熵犇犇智能体',
  description: 'A cross-platform interface for FastGPT API',
  generator: 'v0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '熵犇犇智能体',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='zh-CN' suppressHydrationWarning>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='熵犇犇智能体' />
        <meta name='msapplication-TileColor' content='#6cb33f' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' type='image/svg+xml' href='/favicon.svg' />
      </head>
      <body
        className={`${nunitoSans.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <CrossPlatformProvider>
          <EnhancedUXProvider>
            <AgentProvider>
              <NextThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange
              >
                <ThemeProvider>
                  {children}
                </ThemeProvider>
              </NextThemeProvider>
            </AgentProvider>
          </EnhancedUXProvider>
        </CrossPlatformProvider>
      </body>
    </html>
  );
}
