# 重启所有服务的PowerShell脚本
Write-Host "🔄 开始重启所有服务..." -ForegroundColor Green

# 等待端口释放
Write-Host "⏳ 等待端口释放..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 启动QWEN API服务器
Write-Host "🚀 启动QWEN API服务器..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "enhanced_qwen_server.py" -WindowStyle Minimized
Start-Sleep -Seconds 5

# 启动Manim API服务器
Write-Host "🎬 启动Manim API服务器..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "manim_api_server.py" -WindowStyle Minimized
Start-Sleep -Seconds 5

# 启动TTS服务
Write-Host "🎤 启动TTS服务..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "simple_tts_service.py" -WindowStyle Minimized
Start-Sleep -Seconds 5

# 启动前端开发服务器
Write-Host "🌐 启动前端开发服务器..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized

Write-Host "✅ 所有服务启动完成！" -ForegroundColor Green
Write-Host "📋 服务状态:" -ForegroundColor Yellow
Write-Host "   - QWEN API: http://localhost:8002" -ForegroundColor White
Write-Host "   - Manim API: http://localhost:5001" -ForegroundColor White
Write-Host "   - TTS服务: http://localhost:8003" -ForegroundColor White
Write-Host "   - 前端服务: http://localhost:5173" -ForegroundColor White

Write-Host "⏳ 等待服务完全启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🎉 服务重启完成！请检查前端页面。" -ForegroundColor Green 