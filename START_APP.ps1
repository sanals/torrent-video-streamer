# PowerShell script to start the Torrent Video Streamer app
# This script starts both backend and frontend in separate windows

Write-Host "🚀 Starting Torrent Video Streamer..." -ForegroundColor Green

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "server\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "   Please create .env.local with your Tailscale IP:" -ForegroundColor Yellow
    Write-Host "   VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api" -ForegroundColor Yellow
    Write-Host "   VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000" -ForegroundColor Yellow
    Write-Host ""
}

# Check if server/.env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  Warning: server/.env not found!" -ForegroundColor Yellow
    Write-Host "   Please create server/.env with configuration" -ForegroundColor Yellow
    Write-Host ""
}

# Start backend in a new window
Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\server'; Write-Host '🔧 Backend Server (Port 4000)' -ForegroundColor Cyan; npm start"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; Write-Host '🎨 Frontend Server (Port 3000)' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access the app at:" -ForegroundColor Yellow
Write-Host "   Local:    http://localhost:3000" -ForegroundColor White
Write-Host "   Tailscale: http://YOUR_TAILSCALE_IP:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop the app, close both PowerShell windows or run STOP_APP.ps1" -ForegroundColor Gray
Write-Host ""

