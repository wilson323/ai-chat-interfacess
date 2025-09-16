@echo off
REM Windows 超时包装脚本
REM 用法: timeout-wrapper.bat <超时秒数> <命令>

set TIMEOUT_SECONDS=%1
set COMMAND=%2

REM 检查参数
if "%TIMEOUT_SECONDS%"=="" (
    echo 错误: 请提供超时秒数
    exit /b 1
)

if "%COMMAND%"=="" (
    echo 错误: 请提供要执行的命令
    exit /b 1
)

REM 使用 PowerShell 实现超时功能
powershell -Command "& { $job = Start-Job -ScriptBlock { %COMMAND% }; if (Wait-Job -Job $job -Timeout %TIMEOUT_SECONDS%) { Receive-Job -Job $job; Remove-Job -Job $job } else { Stop-Job -Job $job; Remove-Job -Job $job; Write-Error '命令执行超时' } }"
