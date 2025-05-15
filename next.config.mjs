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
  // output: 'standalone', // 添加此行以支持Docker部署
}

export default nextConfig
