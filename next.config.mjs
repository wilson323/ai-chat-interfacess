/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // 恢复：构建时进行ESLint检查确保代码质量
  },
  typescript: {
    ignoreBuildErrors: false, // 恢复：构建时进行TypeScript检查确保类型安全
  },
  images: {
    unoptimized: false, // 修复：启用图片优化
    formats: ['image/webp', 'image/avif'],
  },
  transpilePackages: [],
  // 启用standalone模式以支持Docker部署
  output: 'standalone',
  // 修复构建错误：确保错误页面正确生成
  trailingSlash: false,
  // 禁用静态导出以避免文件重命名问题
  distDir: '.next',
  // 性能优化配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // SWC压缩在Next.js 15中默认启用
  // 优化构建性能
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-*',
    ],
  },
  // Webpack优化 - 内存优化版本
  webpack: (config, { dev, isServer }) => {
    // 内存优化：减少并行处理
    config.parallelism = 1;

    // 处理 Node.js 内置模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // 服务端：将数据库驱动与 ORM 标记为外部依赖，避免打包导致的 critical dependency 警告
    if (isServer) {
      const externals = [
        'sequelize',
        'mysql2',
        'mariadb',
        'pg',
        'pg-hstore',
        'sqlite3',
        'tedious'
      ];
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, ...externals]
        : [...(config.externals || []), ...externals];
    }

    // 内存优化：简化代码分割
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
          },
        },
      };
    }

    // 内存优化：减少缓存
    config.cache = {
      type: 'memory',
      maxGenerations: 1,
    };

    return config;
  },
};

export default nextConfig;
