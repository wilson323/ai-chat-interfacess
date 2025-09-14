/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // 修复：启用构建时的ESLint检查
  },
  typescript: {
    ignoreBuildErrors: false, // 修复：启用构建时的TypeScript检查
  },
  images: {
    unoptimized: false, // 修复：启用图片优化
    formats: ['image/webp', 'image/avif'],
  },
  transpilePackages: ['sequelize', 'pg-hstore'],
  // 启用standalone模式以支持Docker部署
  output: 'standalone',
  // 性能优化配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // SWC压缩在Next.js 15中默认启用
  // 优化构建性能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@radix-ui/react-*'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Webpack优化
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
