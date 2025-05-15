"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex items-center justify-center" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-4 sm:h-5 w-4 sm:w-5 text-pantone369-500 dark:text-pantone369-200 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 cursor-pointer" />
      <Moon className="absolute h-4 sm:h-5 w-4 sm:w-5 text-pantone369-700 dark:text-pantone369-100 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 cursor-pointer" />
      <span className="sr-only">切换主题</span>
    </div>
  )
}
