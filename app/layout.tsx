import type React from 'react';
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Nunito_Sans, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { CrossPlatformProvider } from '@/components/cross-platform/cross-platform-provider';
import { EnhancedUXProvider } from '@/components/modern-ux/enhanced-user-experience';

// 初始化Redis缓存（只在服务器端）
if (typeof window === 'undefined') {
  import('@/lib/cache/redis-init').then(({ initializeRedis }) => {
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '熵犇犇智能体',
  },
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
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
      </head>
      <body
        className={`${nunitoSans.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <CrossPlatformProvider>
          <EnhancedUXProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </EnhancedUXProvider>
        </CrossPlatformProvider>
      </body>
    </html>
  );
}
