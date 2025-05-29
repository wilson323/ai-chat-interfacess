/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    'sequelize',
    'pg-hstore',
  ],
  // 启用standalone模式以支持Docker部署
  output: 'standalone',
  // 禁用开发模式特性在生产环境中
  experimental: {
    // 确保在生产环境中不启用热重载
    ...(process.env.NODE_ENV === 'production' && {
      optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    }),
  },
}

export default nextConfig
