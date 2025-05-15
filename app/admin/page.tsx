"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout"
import { AdminContainer } from "@/components/admin/admin-container"
import { AgentProvider } from "@/context/agent-context"
import { LanguageProvider } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  // 彻底移除前端Cookie校验和跳转逻辑，只依赖中间件
  return (
    <LanguageProvider>
      <AgentProvider>
        <div className="fixed top-4 right-4 z-50">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => {
            // 退出登录只需清除adminToken即可
            document.cookie = "adminToken=; path=/; max-age=0"
            window.location.replace("/admin/login")
          }}>
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
        <Layout isAdmin={true}>
          <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>FastGPT 智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">管理所有对接的 FastGPT 智能体，支持编辑、配置和同步。</p>
                <Link href="/admin/agent-list/fastgpt">
                  <Button>进入 FastGPT 智能体管理</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CAD 智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">管理 CAD 智能体配置，支持编辑参数和测试连通性。</p>
                <Link href="/admin/cad-analyzer-config">
                  <Button>进入 CAD 智能体配置</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>图像编辑智能体管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">管理图像编辑智能体配置，支持编辑参数和测试连通性。</p>
                <Link href="/admin/image-editor-config">
                  <Button>进入图像编辑智能体配置</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>数据表结构与同步</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">替代现有数据结构检查机制，支持管理员手动更新表结构。进入页面时自动检测并提示是否需要同步。</p>
                <Link href="/admin/db-schema">
                  <Button>进入数据表结构与同步</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </AgentProvider>
    </LanguageProvider>
  )
}
