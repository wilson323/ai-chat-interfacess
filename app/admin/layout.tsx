'use client';

import '../globals.css';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import { Layout } from '@/components/layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AgentProvider>
          <Layout isAdmin>{children}</Layout>
        </AgentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
