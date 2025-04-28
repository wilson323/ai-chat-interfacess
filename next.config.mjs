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
  // serverExternalPackages: ['pg', 'pg-native'], // 移除，避免与 transpilePackages 冲突
  transpilePackages: [
    'sequelize',
  //  'pg',
    'pg-hstore',
   // 'pg-native',
  ],
}

export default nextConfig
