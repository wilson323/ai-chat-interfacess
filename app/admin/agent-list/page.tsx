'use client';
import { AgentList } from "@/components/admin/agent-list";
import { AgentProvider } from "@/context/agent-context";
import { LanguageProvider } from "@/context/language-context";
import { useEffect, useState } from "react";

export default function AgentListPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    // SSR 首屏和 Hydration 前都渲染 loading，保证 HTML 一致
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <LanguageProvider>
      <AgentProvider>
        <AgentList />
      </AgentProvider>
    </LanguageProvider>
  );
} 