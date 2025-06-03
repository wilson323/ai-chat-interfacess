"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface FormErrors {
  password: string
  confirmPassword: string
}

// 分离出使用 useSearchParams 的组件
function NewPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({
    password: "",
    confirmPassword: ""
  })

  // 获取 URL 中的重置令牌
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("无效的重置链接")
    }
  }, [token])

  const validateForm = (): boolean => {
    const errors: FormErrors = {
      password: "",
      confirmPassword: ""
    }

    if (password.length < 8) {
      errors.password = "密码至少需要8个字符"
    }

    if (!/[A-Z]/.test(password)) {
      errors.password = "密码必须包含至少一个大写字母"
    }

    if (!/[a-z]/.test(password)) {
      errors.password = "密码必须包含至少一个小写字母"
    }

    if (!/[0-9]/.test(password)) {
      errors.password = "密码必须包含至少一个数字"
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "两次输入的密码不一致"
    }

    setFormErrors(errors)
    return !Object.values(errors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/admin/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "设置新密码失败")
      }

      setSuccess(true)
      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push("/admin/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "设置新密码失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">设置新密码</CardTitle>
          <CardDescription>
            请设置您的新管理员密码
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>
                  密码已成功重置，3秒后将跳转到登录页面
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">新密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={formErrors.password ? "border-red-500" : ""}
                disabled={!token || isLoading || success}
              />
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={formErrors.confirmPassword ? "border-red-500" : ""}
                disabled={!token || isLoading || success}
              />
              {formErrors.confirmPassword && (
                <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!token || isLoading || success}
            >
              {isLoading ? "设置中..." : "设置新密码"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// 主导出组件，用 Suspense 包装
export default function NewPassword() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-2xl">设置新密码</CardTitle>
            <CardDescription>
              正在加载...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <NewPasswordForm />
    </Suspense>
  )
}