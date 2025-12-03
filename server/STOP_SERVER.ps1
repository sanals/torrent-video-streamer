# PowerShell script to stop the Torrent Video Streamer Backend Server
# This script stops all Node.js processes running on port 4000

Write-Host "🛑 Stopping Torrent Video Streamer Backend..." -ForegroundColor Yellow

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

Write-Host ""
if ($backendStopped) {
    Write-Host "✅ Server stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No running instances found" -ForegroundColor Gray
}
Write-Host ""

