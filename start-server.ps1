# MathTutor AI 智能启动脚本
# 自动处理端口占用问题

Write-Host "🚀 MathTutor AI 服务器启动脚本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 检查Python是否安装
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python未安装，请先安装Python" -ForegroundColor Red
    exit 1
}

# 检查server.py是否存在
if (!(Test-Path "server.py")) {
    Write-Host "❌ 找不到server.py文件" -ForegroundColor Red
    Write-Host "请确保在包含server.py的目录中运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查端口8000是否被占用
Write-Host "🔍 检查端口8000状态..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :8000
if ($portCheck) {
    Write-Host "⚠️  端口8000已被占用，正在停止旧进程..." -ForegroundColor Yellow
    
    # 提取PID并终止进程
    $pid = ($portCheck -split '\s+')[4]
    try {
        taskkill /PID $pid /F | Out-Null
        Write-Host "✅ 旧进程已终止 (PID: $pid)" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "❌ 无法终止旧进程，可能需要手动关闭" -ForegroundColor Red
    }
} else {
    Write-Host "✅ 端口8000可用" -ForegroundColor Green
}

# 启动服务器
Write-Host ""
Write-Host "🎯 正在启动MathTutor AI服务器..." -ForegroundColor Cyan
Write-Host "📡 服务器地址: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌐 测试页面: http://localhost:8000/test-server.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  按Ctrl+C可停止服务器" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green

try {
    # 启动Python服务器
    python server.py
} catch {
    Write-Host ""
    Write-Host "❌ 服务器启动失败" -ForegroundColor Red
    Write-Host "请检查Python环境和server.py文件" -ForegroundColor Red
}

Write-Host ""
Write-Host "👋 服务器已停止" -ForegroundColor Yellow 