'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { UserList } from '@/components/admin/user-management/user-list';

export default function UsersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <LanguageProvider>
      <AgentProvider>
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              // 退出登录只需清除adminToken即可
              document.cookie = 'adminToken=; path=/; max-age=0';
              window.location.replace('/admin/login');
            }}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
        <Layout isAdmin={true}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
                <p className="text-muted-foreground">
                  管理系统用户、角色分配和权限控制
                </p>
              </div>
              <Button onClick={handleRefresh}>
                刷新列表
              </Button>
            </div>
            <UserList refreshTrigger={refreshTrigger} />
          </div>
        </Layout>
      </AgentProvider>
    </LanguageProvider>
  );
}