# PowerShell脚本 - 启动所有服务
Write-Host "🚀 启动数学视频生成系统服务..." -ForegroundColor Green

# 检查Python是否安装
try {
    python --version
    Write-Host "✅ Python已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ Python未安装，请先安装Python" -ForegroundColor Red
    exit 1
}

# 启动Qwen API服务器
Write-Host "📡 启动Qwen API服务器..." -ForegroundColor Yellow
Start-Process python -ArgumentList "enhanced_qwen_server.py" -WindowStyle Minimized
Start-Sleep -Seconds 3

# 启动Manim API服务器
Write-Host "🎬 启动Manim API服务器..." -ForegroundColor Yellow
Start-Process python -ArgumentList "manim_api_server.py" -WindowStyle Minimized
Start-Sleep -Seconds 3

# 启动TTS服务
Write-Host "🎤 启动TTS服务..." -ForegroundColor Yellow
Start-Process python -ArgumentList "simple_tts_service.py" -WindowStyle Minimized
Start-Sleep -Seconds 3

# 检查端口占用并启动前端
Write-Host "🌐 检查前端端口..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    Write-Host "⚠️ 端口5173已被占用，尝试使用其他端口..." -ForegroundColor Yellow
    npm run dev -- --port 5174
} else {
    Write-Host "✅ 启动前端开发服务器..." -ForegroundColor Green
    npm run dev
}

Write-Host "🎉 所有服务启动完成！" -ForegroundColor Green
Write-Host "📝 前端地址: http://localhost:5173 (或5174)" -ForegroundColor Cyan
Write-Host "📡 Qwen API: http://localhost:8002" -ForegroundColor Cyan
Write-Host "🎬 Manim API: http://localhost:8002" -ForegroundColor Cyan
Write-Host "🎤 TTS服务: http://localhost:8003" -ForegroundColor Cyan 