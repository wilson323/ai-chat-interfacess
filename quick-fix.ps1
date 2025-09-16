# 快速修复脚本
# 解决 Next.js 版本和构建问题

Write-Host "快速修复开始..." -ForegroundColor Green

Set-Location "F:\ss\ai-chat-interfacess"

# 1. 清理所有缓存
Write-Host "步骤1: 清理缓存..." -ForegroundColor Yellow
npm cache clean --force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 2. 设置环境变量
Write-Host "步骤2: 设置环境变量..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NPM_CONFIG_CACHE = "C:\temp\npm-cache"

# 3. 创建缓存目录
New-Item -ItemType Directory -Force -Path "C:\temp\npm-cache"

# 4. 重新安装
Write-Host "步骤3: 重新安装依赖..." -ForegroundColor Yellow
npm install --no-optional --legacy-peer-deps

# 5. 检查版本
Write-Host "步骤4: 检查版本..." -ForegroundColor Yellow
npm list next

# 6. 构建
Write-Host "步骤5: 构建项目..." -ForegroundColor Yellow
npm run build

Write-Host "修复完成！" -ForegroundColor Green
