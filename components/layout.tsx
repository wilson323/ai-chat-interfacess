"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { AgentSidebar } from "@/components/agent-sidebar"
import { HistorySidebar } from "@/components/history-sidebar"
import { Header } from "@/components/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAgent } from "@/context/agent-context"
import { useMobile } from "@/hooks/use-mobile"

// Add isAdmin prop to the LayoutProps interface
interface LayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

// Update the Layout function to accept the isAdmin prop
export function Layout({ children, isAdmin = false }: LayoutProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const { sidebarOpen, historySidebarOpen, closeSidebars, toggleSidebar } = useAgent()
  const isMobile = useMobile()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isMobile) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeDistance = touchEndX - touchStartX
      const threshold = 100 // 最小滑动距离

      if (swipeDistance > threshold && !sidebarOpen) {
        // 从左向右滑动，打开侧边栏
        toggleSidebar()
      } else if (swipeDistance < -threshold && sidebarOpen) {
        // 从右向左滑动，关闭侧边栏
        closeSidebars()
      }
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, sidebarOpen, toggleSidebar, closeSidebars])

  if (!mounted) {
    return null
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col",
        "bg-gradient-to-br from-background to-background/80",
        theme === "dark" ? "text-slate-100" : "text-slate-900",
      )}
    >
      {/* Overlay for mobile */}
      {(sidebarOpen || historySidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebars}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Agent Sidebar - only visible when toggled */}
        <AgentSidebar
          isAdmin={isAdmin}
          isOpen={sidebarOpen}
          onClose={closeSidebars}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header isAdmin={isAdmin} />
          <main className="flex-1 overflow-hidden relative" style={{paddingTop: '4rem', minHeight: '0', height: '100%', boxSizing: 'border-box'}}>{children}</main>
        </div>

        {/* History Sidebar */}
        <HistorySidebar isOpen={historySidebarOpen} onClose={closeSidebars} />
      </div>

      {/* Theme toggle button - hide on very small screens */}
      <div className={cn(isMobile ? "hidden sm:block" : "block")}>
        <ThemeToggle />
      </div>
    </div>
  )
}
