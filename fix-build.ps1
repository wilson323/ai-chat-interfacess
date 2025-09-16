# PowerShell脚本修复构建和Git问题

Write-Host "开始修复构建问题..." -ForegroundColor Green

# 1. 设置Git不分页
git config core.pager ""

# 2. 添加修改的文件
Write-Host "添加修改的文件..." -ForegroundColor Yellow
git add components/cross-platform/adaptive-layout.tsx

# 3. 检查状态
Write-Host "检查Git状态..." -ForegroundColor Yellow
git status --short

# 4. 提交更改
Write-Host "提交更改..." -ForegroundColor Yellow
git commit -m "fix: 添加NextImage导入修复构建错误"

# 5. 尝试优化构建
Write-Host "尝试优化构建..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run build

Write-Host "修复完成！" -ForegroundColor Green
