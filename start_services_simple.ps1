# Simple service startup script
Write-Host "Starting all services..." -ForegroundColor Green

# Start QWEN API server
Write-Host "Starting QWEN API server..." -ForegroundColor Cyan
Start-Process python -ArgumentList "enhanced_qwen_server.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Start Manim API server
Write-Host "Starting Manim API server..." -ForegroundColor Cyan
Start-Process python -ArgumentList "manim_api_server.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Start TTS service
Write-Host "Starting TTS service..." -ForegroundColor Cyan
Start-Process python -ArgumentList "simple_tts_service.py" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Start frontend dev server
Write-Host "Starting frontend dev server..." -ForegroundColor Cyan
Start-Process npm -ArgumentList "run", "dev" -WindowStyle Hidden
Start-Sleep -Seconds 5

Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "Checking service status..." -ForegroundColor Yellow

$ports = @(8002, 5001, 8003, 5173)
$services = @("QWEN API", "Manim API", "TTS Service", "Frontend")

$successCount = 0
for ($i = 0; $i -lt $ports.Count; $i++) {
    $port = $ports[$i]
    $service = $services[$i]
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "SUCCESS: $service is running (port: $port)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "FAILED: $service is not running" -ForegroundColor Red
        }
    } catch {
        Write-Host "ERROR: Failed to check $service" -ForegroundColor Red
    }
}

Write-Host "`n" + "="*50
Write-Host "Service Startup Summary" -ForegroundColor Magenta
Write-Host "="*50
Write-Host "Total services: $($services.Count)" -ForegroundColor White
Write-Host "Successfully started: $successCount" -ForegroundColor Green
Write-Host "Failed to start: $($services.Count - $successCount)" -ForegroundColor Red

if ($successCount -eq $services.Count) {
    Write-Host "`nAll services started successfully!" -ForegroundColor Green
    Write-Host "`nService URLs:" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "QWEN API: http://localhost:8002/api/qwen" -ForegroundColor White
    Write-Host "Manim API: http://localhost:5001/api/animate" -ForegroundColor White
    Write-Host "TTS Service: http://localhost:8003/api/tts" -ForegroundColor White
} else {
    Write-Host "`nSome services failed to start. Please check logs." -ForegroundColor Yellow
}

Write-Host "`nService startup script completed!" -ForegroundColor Green 