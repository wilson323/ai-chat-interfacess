#!/usr/bin/env tsx

/**
 * 生产环境部署配置脚本
 * 用于配置生产环境、安全检查、性能优化、监控设置
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ProductionSetupOptions {
  checkSecurity?: boolean;
  optimizePerformance?: boolean;
  setupMonitoring?: boolean;
  generateConfig?: boolean;
  verbose?: boolean;
}

interface SecurityCheck {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  recommendation?: string;
}

class ProductionSetup {
  private options: ProductionSetupOptions;
  private securityChecks: SecurityCheck[] = [];

  constructor(options: ProductionSetupOptions = {}) {
    this.options = {
      checkSecurity: true,
      optimizePerformance: true,
      setupMonitoring: true,
      generateConfig: true,
      verbose: false,
      ...options,
    };
  }

  /**
   * 检查生产环境配置
   */
  checkProductionConfiguration(): void {
    console.log('🔍 检查生产环境配置...');

    const requiredEnvVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'DB_HOST',
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'REDIS_URL',
    ];

    let missingVars = 0;
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        this.addSecurityCheck(
          '环境变量',
          'fail',
          `缺少必需的环境变量: ${varName}`
        );
        missingVars++;
      } else {
        this.addSecurityCheck('环境变量', 'pass', `✓ ${varName} 已设置`);
      }
    }

    // 检查NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
      this.addSecurityCheck(
        '环境配置',
        'warning',
        'NODE_ENV 不是 production',
        '建议设置为 production'
      );
    }

    // 检查JWT密钥强度
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      this.addSecurityCheck(
        '安全配置',
        'fail',
        'JWT_SECRET 太短',
        '建议使用至少32个字符的强密钥'
      );
    } else if (jwtSecret) {
      this.addSecurityCheck('安全配置', 'pass', '✓ JWT_SECRET 长度合适');
    }

    console.log(`✅ 生产环境配置检查完成，${missingVars} 个问题`);
  }

  /**
   * 添加安全检查结果
   */
  private addSecurityCheck(
    category: string,
    status: 'pass' | 'fail' | 'warning',
    message: string,
    recommendation?: string
  ): void {
    this.securityChecks.push({ category, status, message, recommendation });
  }

  /**
   * 执行安全检查
   */
  performSecurityChecks(): void {
    console.log('🔒 执行安全检查...');

    // 检查敏感文件
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    for (const file of sensitiveFiles) {
      if (fs.existsSync(file)) {
        this.addSecurityCheck(
          '文件安全',
          'warning',
          `敏感文件存在: ${file}`,
          '确保文件权限正确设置'
        );
      }
    }

    // 检查依赖漏洞
    try {
      const output = execSync('npm audit --audit-level moderate', {
        encoding: 'utf8',
      });
      if (output.includes('found 0 vulnerabilities')) {
        this.addSecurityCheck('依赖安全', 'pass', '✓ 没有发现依赖漏洞');
      } else {
        this.addSecurityCheck(
          '依赖安全',
          'warning',
          '发现依赖漏洞',
          '运行 npm audit fix 修复'
        );
      }
    } catch (error) {
      this.addSecurityCheck(
        '依赖安全',
        'fail',
        '依赖安全检查失败',
        '手动运行 npm audit'
      );
    }

    // 检查HTTPS配置
    const apiUrl = process.env.API_BASE_URL;
    if (apiUrl && !apiUrl.startsWith('https://')) {
      this.addSecurityCheck(
        '网络安全',
        'warning',
        'API_BASE_URL 不是HTTPS',
        '生产环境建议使用HTTPS'
      );
    } else if (apiUrl) {
      this.addSecurityCheck('网络安全', 'pass', '✓ API_BASE_URL 使用HTTPS');
    }

    // 检查CORS配置
    const corsOrigins = process.env.CORS_ORIGINS;
    if (corsOrigins && corsOrigins.includes('*')) {
      this.addSecurityCheck(
        '网络安全',
        'fail',
        'CORS_ORIGINS 包含通配符',
        '生产环境不应使用通配符CORS'
      );
    } else if (corsOrigins) {
      this.addSecurityCheck('网络安全', 'pass', '✓ CORS_ORIGINS 配置正确');
    }

    console.log('✅ 安全检查完成');
  }

  /**
   * 性能优化配置
   */
  async optimizePerformance(): Promise<void> {
    if (!this.options.optimizePerformance) {
      console.log('⏭️ 跳过性能优化');
      return;
    }

    console.log('⚡ 配置性能优化...');

    try {
      // 检查Next.js配置
      const nextConfigPath = 'next.config.mjs';
      if (fs.existsSync(nextConfigPath)) {
        const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

        if (!nextConfig.includes("output: 'standalone'")) {
          console.log('  ⚠️ 建议启用 standalone 模式以优化生产构建');
        }

        if (!nextConfig.includes('experimental.optimizePackageImports')) {
          console.log('  ⚠️ 建议启用包导入优化');
        }
      }

      // 检查TypeScript配置
      const tsConfigPath = 'tsconfig.json';
      if (fs.existsSync(tsConfigPath)) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));

        if (!tsConfig.compilerOptions?.strict) {
          console.log('  ⚠️ 建议启用严格模式');
        }
      }

      // 运行构建测试
      console.log('  🔨 测试生产构建...');
      try {
        execSync('npm run build', {
          stdio: this.options.verbose ? 'inherit' : 'pipe',
        });
        console.log('  ✅ 生产构建成功');
      } catch (error) {
        console.error('  ❌ 生产构建失败:', error);
        throw error;
      }

      console.log('✅ 性能优化配置完成');
    } catch (error) {
      console.error('❌ 性能优化配置失败:', error);
      throw error;
    }
  }

  /**
   * 设置监控配置
   */
  setupMonitoring(): void {
    if (!this.options.setupMonitoring) {
      console.log('⏭️ 跳过监控设置');
      return;
    }

    console.log('📊 设置监控配置...');

    // 创建监控配置文件
    const monitoringConfig = {
      enabled: true,
      metrics: {
        enabled: true,
        endpoint: process.env.MONITORING_ENDPOINT || 'http://localhost:9090',
        interval: 30000,
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        outputs: ['console', 'file'],
      },
      alerts: {
        enabled: true,
        thresholds: {
          cpu: 80,
          memory: 80,
          disk: 90,
          responseTime: 5000,
        },
      },
    };

    const configPath = 'monitoring.config.json';
    fs.writeFileSync(configPath, JSON.stringify(monitoringConfig, null, 2));
    console.log(`  ✅ 监控配置已保存到: ${configPath}`);

    // 创建健康检查端点
    const healthCheckCode = `
// 健康检查端点
export async function GET() {
  try {
    // 检查数据库连接
    // 检查Redis连接
    // 检查磁盘空间
    // 检查内存使用
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
`;

    const healthCheckPath = 'app/api/health/route.ts';
    const healthCheckDir = path.dirname(healthCheckPath);
    if (!fs.existsSync(healthCheckDir)) {
      fs.mkdirSync(healthCheckDir, { recursive: true });
    }
    fs.writeFileSync(healthCheckPath, healthCheckCode);
    console.log(`  ✅ 健康检查端点已创建: ${healthCheckPath}`);

    console.log('✅ 监控设置完成');
  }

  /**
   * 生成生产环境配置
   */
  generateProductionConfig(): void {
    if (!this.options.generateConfig) {
      console.log('⏭️ 跳过配置生成');
      return;
    }

    console.log('📝 生成生产环境配置...');

    // 生成Docker配置
    const dockerfile = `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
`;

    fs.writeFileSync('Dockerfile.production', dockerfile);
    console.log('  ✅ Dockerfile.production 已创建');

    // 生成docker-compose配置
    const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=\${DB_NAME}
      - POSTGRES_USER=\${DB_USER}
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
`;

    fs.writeFileSync('docker-compose.production.yml', dockerCompose);
    console.log('  ✅ docker-compose.production.yml 已创建');

    // 生成nginx配置
    const nginxConfig = `server {
    listen 80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 代理到Next.js应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;

    fs.writeFileSync('nginx.conf', nginxConfig);
    console.log('  ✅ nginx.conf 已创建');

    console.log('✅ 生产环境配置生成完成');
  }

  /**
   * 生成部署脚本
   */
  generateDeploymentScripts(): void {
    console.log('🚀 生成部署脚本...');

    // 生成部署脚本
    const deployScript = `#!/bin/bash

# 生产环境部署脚本
set -e

echo "🚀 开始生产环境部署..."

# 1. 检查环境变量
echo "🔍 检查环境变量..."
required_vars=("NODE_ENV" "JWT_SECRET" "DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD")
for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
        echo "❌ 缺少必需的环境变量: $var"
        exit 1
    fi
done

# 2. 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 3. 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
npm run db:migrate

# 4. 构建应用
echo "🔨 构建应用..."
npm run build

# 5. 运行测试
echo "🧪 运行测试..."
npm run test:ci

# 6. 启动应用
echo "▶️ 启动应用..."
pm2 start ecosystem.config.js --env production

echo "✅ 部署完成!"
`;

    fs.writeFileSync('deploy.sh', deployScript);
    fs.chmodSync('deploy.sh', '755');
    console.log('  ✅ deploy.sh 已创建');

    // 生成PM2配置
    const pm2Config = `module.exports = {
  apps: [{
    name: 'ai-chat-interface',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
`;

    fs.writeFileSync('ecosystem.config.js', pm2Config);
    console.log('  ✅ ecosystem.config.js 已创建');

    console.log('✅ 部署脚本生成完成');
  }

  /**
   * 生成安全报告
   */
  generateSecurityReport(): string {
    const report = [];
    report.push('# 生产环境安全检查报告\n');
    report.push(`生成时间: ${new Date().toISOString()}\n`);

    // 按类别分组安全检查
    const categories = [...new Set(this.securityChecks.map(c => c.category))];

    for (const category of categories) {
      const categoryChecks = this.securityChecks.filter(
        c => c.category === category
      );
      const passCount = categoryChecks.filter(c => c.status === 'pass').length;
      const failCount = categoryChecks.filter(c => c.status === 'fail').length;
      const warningCount = categoryChecks.filter(
        c => c.status === 'warning'
      ).length;

      report.push(`## ${category}`);
      report.push(`- ✅ 通过: ${passCount}`);
      report.push(`- ❌ 失败: ${failCount}`);
      report.push(`- ⚠️ 警告: ${warningCount}\n`);

      for (const check of categoryChecks) {
        const icon =
          check.status === 'pass'
            ? '✅'
            : check.status === 'fail'
              ? '❌'
              : '⚠️';
        report.push(`- ${icon} ${check.message}`);
        if (check.recommendation) {
          report.push(`  - 建议: ${check.recommendation}`);
        }
      }
      report.push('');
    }

    // 总结
    const totalPass = this.securityChecks.filter(
      c => c.status === 'pass'
    ).length;
    const totalFail = this.securityChecks.filter(
      c => c.status === 'fail'
    ).length;
    const totalWarning = this.securityChecks.filter(
      c => c.status === 'warning'
    ).length;

    report.push('## 总结');
    report.push(`- 总检查项: ${this.securityChecks.length}`);
    report.push(`- 通过: ${totalPass}`);
    report.push(`- 失败: ${totalFail}`);
    report.push(`- 警告: ${totalWarning}`);

    if (totalFail === 0) {
      report.push('\n🎉 所有安全检查都通过了！');
    } else {
      report.push(`\n❌ 有 ${totalFail} 个安全检查失败，请修复后部署。`);
    }

    return report.join('\n');
  }

  /**
   * 执行完整的生产环境设置
   */
  async setup(): Promise<void> {
    console.log('🚀 开始生产环境设置...\n');

    try {
      // 1. 检查生产环境配置
      this.checkProductionConfiguration();

      // 2. 执行安全检查
      this.performSecurityChecks();

      // 3. 性能优化
      await this.optimizePerformance();

      // 4. 设置监控
      this.setupMonitoring();

      // 5. 生成配置
      this.generateProductionConfig();

      // 6. 生成部署脚本
      this.generateDeploymentScripts();

      // 7. 生成安全报告
      const securityReport = this.generateSecurityReport();
      fs.writeFileSync('production-security-report.md', securityReport);
      console.log('📄 安全报告已保存到: production-security-report.md');

      console.log('\n🎉 生产环境设置完成!');
      console.log('\n📋 下一步:');
      console.log('1. 检查 production-security-report.md');
      console.log('2. 配置环境变量');
      console.log('3. 运行 ./deploy.sh 进行部署');
    } catch (error) {
      console.error('❌ 生产环境设置失败:', error);
      throw error;
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options: ProductionSetupOptions = {
    checkSecurity: !args.includes('--no-security'),
    optimizePerformance: !args.includes('--no-performance'),
    setupMonitoring: !args.includes('--no-monitoring'),
    generateConfig: !args.includes('--no-config'),
    verbose: args.includes('--verbose'),
  };

  try {
    const setup = new ProductionSetup(options);
    await setup.setup();
    process.exit(0);
  } catch (error) {
    console.error('设置失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { ProductionSetup };
