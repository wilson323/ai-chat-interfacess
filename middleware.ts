import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 在生产环境中阻止访问开发模式端点
  if (process.env.NODE_ENV === 'production') {
    // 阻止访问webpack-hmr和其他开发模式端点
    if (pathname.startsWith('/_next/webpack-hmr') ||
        pathname.startsWith('/_next/static/chunks/webpack') ||
        pathname.includes('hot-reload')) {
      return new NextResponse(null, { status: 404 })
    }
  }

  // 彻底放行所有其他路由
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/_next/:path*", // 添加_next路径匹配以处理开发模式端点
  ],
}
