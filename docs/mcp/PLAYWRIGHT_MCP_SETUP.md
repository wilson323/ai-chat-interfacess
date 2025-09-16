## Playwright MCP 安装与配置（Windows）

本项目已提供 `.cursor/mcp.json` 注册 Playwright MCP。目标：让编辑器通过 MCP 访问真实浏览器页面。

### 先决条件
- 已安装 Node.js（建议 LTS）
- 项目已安装 `@playwright/test`（本仓库已具备）

### 安装浏览器二进制
在 Windows PowerShell 中执行：

```powershell
npm run install:browsers
```

### 编辑器（Cursor）识别 MCP
- 本仓库根目录包含 `.cursor/mcp.json`：
  ```json
  {
    "mcpServers": {
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest", "--headless"],
        "env": { "PWDEBUG": "0" }
      }
    }
  }
  ```
- 打开 Cursor，进入该项目后自动加载该 MCP。

### 手动启动（可选）
提供脚本：`scripts/start-playwright-mcp.ps1`

```powershell
# 以无头模式启动
powershell -ExecutionPolicy Bypass -File scripts/start-playwright-mcp.ps1 -Headless

# 以有头模式启动（便于观察）
powershell -ExecutionPolicy Bypass -File scripts/start-playwright-mcp.ps1 -Headless:$false
```

### 最小验证（在 Cursor 内）
1. 打开 MCP 工具面板，选择 `playwright`。
2. 执行：打开 `https://example.com` 并截图到默认目录（命令与参数以工具面板提示为准）。
3. 若能成功打开页面并得到截图，即表示 MCP 正常工作。

### 备注
- 使用 `npx @playwright/mcp@latest` 以减少项目依赖和自定义实现，遵循“最小自定义、复用成熟能力”的约定。
- 所有脚本仅负责启动与验证，不会修改项目代码。
