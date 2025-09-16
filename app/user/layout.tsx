'use client';
import '../globals.css';
import { ThemeProvider } from '../../components/theme-provider';
import { ReactNode } from 'react';
import { UserProvider } from '../../context/user-context';
import { AgentProvider } from '../../context/agent-context';
import { LanguageProvider } from '../../context/language-context';
import { Layout } from '../../components/layout';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <AgentProvider>
            <Layout>{children}</Layout>
          </AgentProvider>
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
