# PowerShell script to stop all processes using port 4000
Write-Host "Finding processes using port 4000..." -ForegroundColor Yellow

# Get all processes using port 4000
$processes = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "Found $($processes.Count) process(es) using port 4000" -ForegroundColor Yellow
    foreach ($pid in $processes) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "Stopping process: $($proc.ProcessName) (PID: $pid)" -ForegroundColor Cyan
                taskkill /PID $pid /F | Out-Null
            }
        } catch {
            Write-Host "Could not stop process $pid" -ForegroundColor Red
        }
    }
    Write-Host "All processes stopped!" -ForegroundColor Green
} else {
    Write-Host "No processes found using port 4000" -ForegroundColor Green
}

# Verify port is free
Start-Sleep -Seconds 1
$stillRunning = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($stillRunning) {
    Write-Host "Warning: Some processes may still be using port 4000" -ForegroundColor Red
} else {
    Write-Host "Port 4000 is now free!" -ForegroundColor Green
}

