# PowerShell script to start the Torrent Video Streamer Frontend
# Note: This assumes the backend server is running separately

Write-Host "🚀 Starting Torrent Video Streamer Frontend..." -ForegroundColor Green

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

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "   Please create .env.local with your backend URL:" -ForegroundColor Yellow
    Write-Host "   VITE_API_URL=http://localhost:4000/api" -ForegroundColor Yellow
    Write-Host "   VITE_WS_URL=ws://localhost:4000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   For remote backend (Tailscale):" -ForegroundColor Yellow
    Write-Host "   VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api" -ForegroundColor Yellow
    Write-Host "   VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000" -ForegroundColor Yellow
    Write-Host ""
}

# Check if backend is running
Write-Host "🔍 Checking if backend server is running..." -ForegroundColor Cyan
$backendRunning = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if (-not $backendRunning) {
    Write-Host "⚠️  Warning: Backend server doesn't appear to be running on port 4000!" -ForegroundColor Yellow
    Write-Host "   Please start the backend server first." -ForegroundColor Yellow
    Write-Host "   See the backend repository for instructions." -ForegroundColor Yellow
    Write-Host ""
}

# Start frontend
Write-Host "🎨 Starting frontend server..." -ForegroundColor Cyan
Write-Host "   Frontend will start on http://localhost:3000" -ForegroundColor Gray
Write-Host ""

npm run dev

