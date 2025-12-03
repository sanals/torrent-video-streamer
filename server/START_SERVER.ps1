# PowerShell script to start the Torrent Video Streamer Backend Server

Write-Host "🚀 Starting Torrent Video Streamer Backend..." -ForegroundColor Green

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
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env not found!" -ForegroundColor Yellow
    Write-Host "   Please create .env with configuration:" -ForegroundColor Yellow
    Write-Host "   PORT=4000" -ForegroundColor Yellow
    Write-Host "   NODE_ENV=production" -ForegroundColor Yellow
    Write-Host "   CORS_ORIGIN=*" -ForegroundColor Yellow
    Write-Host "   TORRENT_STORAGE_MODE=memory" -ForegroundColor Yellow
    Write-Host ""
}

# Start server
Write-Host "🔧 Starting backend server..." -ForegroundColor Cyan
Write-Host "   Server will start on http://localhost:4000" -ForegroundColor Gray
Write-Host ""

npm start

