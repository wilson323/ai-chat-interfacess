param(
  [switch]$Headless = $true
)

$headlessArg = if ($Headless) { "--headless" } else { "" }
Write-Host "Starting Playwright MCP $headlessArg"
# Uses npx to avoid adding project dependency; no code changes.
# This script does NOT modify repository files.
& npx @playwright/mcp@latest $headlessArg
