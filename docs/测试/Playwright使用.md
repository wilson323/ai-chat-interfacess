# Playwright 使用（Windows）

## 概述
- 端到端测试通过 Playwright 运行，报告默认输出到 `playwright-report/`。
- 报告可通过 `npx playwright show-report --port 9323` 在 `http://localhost:9323/` 查看。

## 运行步骤（Windows PowerShell）
1. 安装浏览器：
   ```powershell
   npm run install:browsers
   ```
2. 启动并运行 E2E 测试（会自动启动本地服务）：
   ```powershell
   npm run test:e2e
   ```
3. 打开报告（端口 9323）：
   ```powershell
   npx playwright show-report --port 9323
   ```

## 关键配置
- `playwright.config.ts`：
  - `baseURL`: `http://localhost:3001`
  - `webServer`: 通过 `npm run dev` 启动，`env.PORT=3001`
- 开发服务器端口：3001（来自项目约定）

## 常见问题
- 3001 端口占用：请释放或修改 `baseURL` 与 `env.PORT` 保持一致。
- 报告目录：`playwright-report/`，亦可直接双击 `index.html` 打开静态报告。
- 首次运行缺浏览器：请执行 `npm run install:browsers`。
