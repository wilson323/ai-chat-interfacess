# 替代构建方案
# 使用 yarn 或 pnpm 避免 npm 问题

Write-Host "使用替代方案构建..." -ForegroundColor Green

Set-Location "F:\ss\ai-chat-interfacess"

# 清理环境
Write-Host "清理环境..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force yarn.lock -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

# 尝试使用 yarn
Write-Host "尝试使用 yarn..." -ForegroundColor Yellow
try {
    npm install -g yarn
    yarn install
    yarn build
    Write-Host "Yarn 构建成功！" -ForegroundColor Green
} catch {
    Write-Host "Yarn 构建失败，尝试 pnpm..." -ForegroundColor Red

    # 尝试使用 pnpm
    try {
        npm install -g pnpm
        pnpm install
        pnpm build
        Write-Host "Pnpm 构建成功！" -ForegroundColor Green
    } catch {
        Write-Host "所有方案都失败了，请检查错误信息" -ForegroundColor Red
    }
}
