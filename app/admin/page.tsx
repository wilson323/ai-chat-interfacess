'use client';

import { Layout } from '@/components/layout';
import { AgentProvider } from '@/context/agent-context';
import { LanguageProvider } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  // 彻底移除前端Cookie校验和跳转逻辑，只依赖中间件
  return (
    <LanguageProvider>
      <AgentProvider>
        <div className='fixed top-4 right-4 z-50'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
            onClick={() => {
              // 退出登录只需清除adminToken即可
              document.cookie = 'adminToken=; path=/; max-age=0';
              window.location.replace('/admin/login');
            }}
          >
            <LogOut className='h-4 w-4' />
            退出登录
          </Button>
        </div>
        <Layout isAdmin={true}>
          <div className='max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>FastGPT 智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  管理所有对接的 FastGPT 智能体，支持编辑、配置和同步。
                </p>
                <Link href='/admin/agent-list/fastgpt'>
                  <Button>进入 FastGPT 智能体管理</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CAD 智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  管理 CAD 智能体配置，支持编辑参数和测试连通性。
                </p>
                <div className='flex gap-2'>
                  <Link href='/admin/cad-analyzer-config'>
                    <Button>配置管理</Button>
                  </Link>
                  <Link href='/admin/cad-analyzer-history'>
                    <Button variant='outline'>历史记录</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>图像编辑智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  管理图像编辑智能体配置，支持编辑参数和测试连通性。
                </p>
                <div className='flex gap-2'>
                  <Link href='/admin/image-editor-config'>
                    <Button>配置管理</Button>
                  </Link>
                  <Link href='/admin/image-editor-history'>
                    <Button variant='outline'>历史记录</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>模型配置管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  统一管理所有AI模型配置，包括参数设置、性能监控和版本管理。
                </p>
                <div className='flex gap-2'>
                  <Link href='/admin/model-config'>
                    <Button>模型配置</Button>
                  </Link>
                  <Link href='/admin/model-config/monitor'>
                    <Button variant='outline'>性能监控</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>性能监控</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  实时监控系统性能指标，包括页面加载、API响应、资源使用等关键指标。
                </p>
                <Link href='/admin/performance'>
                  <Button>进入性能监控</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>安全监控</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  安全漏洞扫描和加固管理，包括代码安全检查和修复建议。
                </p>
                <Link href='/admin/security'>
                  <Button>进入安全监控</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  管理系统用户、角色分配和权限控制，支持用户创建、编辑、删除和批量操作。
                </p>
                <Link href='/admin/users'>
                  <Button>进入用户管理</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>数据分析中心</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  基础数据分析和可视化，包括趋势分析、智能体使用统计和实时监控。
                </p>
                <Link href='/admin/analytics'>
                  <Button>进入数据分析</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>高级数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  深度分析和预测，包括用户行为分析、智能体性能评估、业务价值分析和趋势预测。
                </p>
                <Link href='/admin/analytics-advanced'>
                  <Button>进入高级分析</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>缓存监控</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  Redis缓存状态监控和优化管理，包括缓存策略和性能分析。
                </p>
                <Link href='/admin/cache'>
                  <Button>进入缓存监控</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>自研智能体存储管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  管理自研智能体的存储空间、数据清除、导入导出等功能，包括CAD分析器和图像编辑器的数据管理。
                </p>
                <Link href='/admin/custom-agent-storage'>
                  <Button>进入存储管理</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>数据表结构与同步</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='mb-4 text-muted-foreground'>
                  替代现有数据结构检查机制，支持管理员手动更新表结构。进入页面时自动检测并提示是否需要同步。
                </p>
                <Link href='/admin/db-schema'>
                  <Button>进入数据表结构与同步</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </AgentProvider>
    </LanguageProvider>
  );
}
