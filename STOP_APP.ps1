# PowerShell script to stop the Torrent Video Streamer app
# This script stops all Node.js processes running on ports 3000 and 4000

Write-Host "🛑 Stopping Torrent Video Streamer..." -ForegroundColor Yellow

# Function to stop processes on a specific port
function Stop-Port {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processes) {
        foreach ($processId in $processes) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   Stopping process $processId ($($process.ProcessName)) on port $Port..." -ForegroundColor Gray
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
        return $true
    }
    return $false
}

# Stop port 4000 (backend)
Write-Host "🔧 Stopping backend (port 4000)..." -ForegroundColor Cyan
$backendStopped = Stop-Port -Port 4000
if ($backendStopped) {
    Write-Host "   ✅ Backend stopped" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No process found on port 4000" -ForegroundColor Gray
}

# Stop port 3000 (frontend)
Write-Host "🎨 Stopping frontend (port 3000)..." -ForegroundColor Cyan
$frontendStopped = Stop-Port -Port 3000
if ($frontendStopped) {
    Write-Host "   ✅ Frontend stopped" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No process found on port 3000" -ForegroundColor Gray
}

Write-Host ""
if ($backendStopped -or $frontendStopped) {
    Write-Host "✅ App stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No running instances found" -ForegroundColor Gray
}
Write-Host ""

