# Windows PowerShell 构建脚本
# 解决 WSL 环境下的构建问题

Write-Host "开始 Windows 环境构建..." -ForegroundColor Green

# 切换到项目目录
Set-Location "F:\ss\ai-chat-interfacess"

# 清理缓存
Write-Host "清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force

# 删除可能存在的缓存文件
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 重新安装依赖
Write-Host "重新安装依赖..." -ForegroundColor Yellow
npm install

# 检查 Next.js 版本
Write-Host "检查 Next.js 版本..." -ForegroundColor Yellow
npm list next

# 构建项目
Write-Host "开始构建项目..." -ForegroundColor Yellow
npm run build

Write-Host "构建完成！" -ForegroundColor Green
