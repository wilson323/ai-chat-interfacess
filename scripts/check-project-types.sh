#!/bin/bash

echo "🔍 开始项目代码类型检查..."

# 创建临时tsconfig只检查项目文件
cat > tsconfig-project-only.json << EOF
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "types": []
  },
  "include": ["next-env.d.ts", "app/**/*", "components/**/*", "lib/**/*", "hooks/**/*", "types/**/*"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
}
EOF

# 运行类型检查
echo "📋 检查项目文件..."
npx tsc --noEmit -p tsconfig-project-only.json

# 清理临时文件
rm tsconfig-project-only.json

if [ $? -eq 0 ]; then
    echo "✅ 项目代码类型检查通过！"
else
    echo "❌ 项目代码类型检查失败！"
    exit 1
fi