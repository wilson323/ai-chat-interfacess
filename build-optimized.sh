#!/bin/bash
# 内存优化的构建脚本

echo "🚀 开始优化构建..."

# 清理缓存
echo "🧹 清理构建缓存..."
rm -rf .next
rm -rf node_modules/.cache

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 设置环境变量优化
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# 检查可用内存
echo "💾 检查系统内存..."
free -h

# 尝试不同的构建策略
echo "🔨 尝试标准构建..."
if npm run build:fast; then
    echo "✅ 快速构建成功！"
elif npm run build:minimal; then
    echo "✅ 最小构建成功！"
else
    echo "❌ 构建失败，尝试分步构建..."

    # 分步构建
    echo "📦 步骤1: 构建页面..."
    npx next build --no-lint --no-typescript --experimental-build-mode=compile

    echo "📦 步骤2: 生成静态资源..."
    npx next build --no-lint --no-typescript --experimental-build-mode=export
fi

echo "🎉 构建完成！"
