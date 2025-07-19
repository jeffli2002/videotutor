# 启动所有服务的PowerShell脚本
Write-Host "🚀 启动所有前后台服务..." -ForegroundColor Green

# 检查端口占用情况
Write-Host "`n🔍 检查端口占用情况..." -ForegroundColor Yellow
$ports = @(8002, 5001, 8003, 5174)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "⚠️ 端口 $port 已被占用，PID: $($process.OwningProcess)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 端口 $port 可用" -ForegroundColor Green
    }
}

# 启动QWEN API服务器
Write-Host "`n🔧 启动QWEN API服务器..." -ForegroundColor Cyan
Start-Process python -ArgumentList "enhanced_qwen_server.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# 启动Manim API服务器
Write-Host "🔧 启动Manim API服务器..." -ForegroundColor Cyan
Start-Process python -ArgumentList "manim_api_server.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# 启动TTS服务
Write-Host "🔧 启动TTS服务..." -ForegroundColor Cyan
Start-Process python -ArgumentList "simple_tts_service.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# 启动前端开发服务器
Write-Host "🔧 启动前端开发服务器..." -ForegroundColor Cyan
Start-Process npm -ArgumentList "run", "dev", "--", "--port", "5174" -WindowStyle Hidden
Start-Sleep -Seconds 5

# 等待服务启动
Write-Host "`n⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 检查服务状态
Write-Host "`n🔍 检查服务状态..." -ForegroundColor Yellow

$services = @(
    @{Name="QWEN API服务器"; Port=8002; URL="http://localhost:8002/api/qwen"},
    @{Name="Manim API服务器"; Port=5001; URL="http://localhost:5001/api/animate"},
    @{Name="TTS服务"; Port=8003; URL="http://localhost:8003/api/tts"},
    @{Name="前端应用"; Port=5174; URL="http://localhost:5174"}
)

$successCount = 0
foreach ($service in $services) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "✅ $($service.Name) 正在运行 (端口: $($service.Port))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ $($service.Name) 未运行" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($service.Name) 检查失败" -ForegroundColor Red
    }
}

Write-Host "`n" + "="*60
Write-Host "📊 服务启动总结" -ForegroundColor Magenta
Write-Host "="*60
Write-Host "总服务数: $($services.Count)" -ForegroundColor White
Write-Host "成功启动: $successCount" -ForegroundColor Green
Write-Host "启动失败: $($services.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $services.Count) {
    Write-Host "`n🎉 所有服务都成功启动！" -ForegroundColor Green
    Write-Host "`n📋 服务访问地址:" -ForegroundColor Cyan
    Write-Host "前端应用: http://localhost:5174" -ForegroundColor White
    Write-Host "QWEN API: http://localhost:8002/api/qwen" -ForegroundColor White
    Write-Host "Manim API: http://localhost:5001/api/animate" -ForegroundColor White
    Write-Host "TTS服务: http://localhost:8003/api/tts" -ForegroundColor White
} else {
    Write-Host "`n⚠️ 部分服务启动失败，请检查日志" -ForegroundColor Yellow
}

Write-Host "`n✅ 服务启动脚本执行完成！" -ForegroundColor Green 