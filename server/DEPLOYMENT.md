# 🚀 Deployment Guide - Backend Server

Complete guide for deploying the backend server on a laptop/server with Tailscale for remote access.

## 📋 Prerequisites

### 1. System Requirements
- **Windows 10/11** (or Linux/Mac)
- **Node.js v18 or higher** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning the repo)

### 2. Install Node.js
1. Download Node.js LTS from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Verify installation:
   ```powershell
   node --version  # Should show v18.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

### 3. Install Tailscale (Optional, for remote access)
1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download)
2. Install and sign in with your Tailscale account
3. Note your Tailscale IP address (e.g., `100.106.121.5`)
   - You can find it in the Tailscale app or by running: `tailscale ip`

## 📦 Installation Steps

### Step 1: Get the Project
If you have the project files:
```powershell
# Navigate to your project directory
cd C:\path\to\torrent-video-streamer-server
```

If you need to clone from Git:
```powershell
git clone <your-repo-url>
cd torrent-video-streamer-server
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables

**Create `.env` file:**
```env
PORT=4000
NODE_ENV=production
DOWNLOADS_PATH=./downloads
CORS_ORIGIN=*
TORRENT_STORAGE_MODE=memory
AUTO_DELETE_ON_DISCONNECT=true
TORRENT_PAUSE_ON_VIDEO_PAUSE=true
```

**For Tailscale deployment:**
- Set `CORS_ORIGIN=*` to allow connections from any Tailscale device

### Step 4: Configure Windows Firewall

Allow Node.js through Windows Firewall:
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js for both Private and Public networks
4. Allow port 4000

## 🎬 Running the Server

### Manual Start
```powershell
npm start
```

### Using Startup Script (Recommended)
```powershell
.\START_SERVER.ps1
```

### Using Stop Script
```powershell
.\STOP_SERVER.ps1
```

## 🌐 Accessing the Server

### On the Same Machine:
- API: `http://localhost:4000/api`
- Health Check: `http://localhost:4000/api/health`

### From Another Device (via Tailscale):
- API: `http://YOUR_TAILSCALE_IP:4000/api`
- Example: `http://100.106.121.5:4000/api`

## 🔄 Auto-Start on Boot (Optional)

### Option 1: Windows Task Scheduler (Recommended)

1. Open Task Scheduler
2. Create Basic Task:
   - Name: "Torrent Video Streamer Backend"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `powershell.exe`
   - Arguments: `-File "C:\path\to\torrent-video-streamer-server\START_SERVER.ps1"`
   - Start in: `C:\path\to\torrent-video-streamer-server`

3. Check "Run whether user is logged on or not"
4. Set user account with appropriate permissions

### Option 2: PM2 (Advanced)

Install PM2:
```powershell
npm install -g pm2
```

Start with PM2:
```powershell
pm2 start src/server.js --name torrent-backend
pm2 save
pm2 startup
```

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F

# Or use the provided script
.\stop-port-4000.ps1
```

### Can't Access from Other Devices

1. **Check Tailscale:**
   ```powershell
   tailscale status
   ```
   Ensure both devices are connected.

2. **Check Firewall:**
   - Ensure Windows Firewall allows Node.js
   - Check that port 4000 is open

3. **Check IP Address:**
   ```powershell
   tailscale ip
   ```
   Use this IP in your frontend configuration.

4. **Restart Server:**
   - Stop the server
   - Restart it

### Server Won't Start

1. Check if port 4000 is available
2. Verify `.env` exists and is configured
3. Check Node.js version: `node --version` (must be v18+)
4. Check server logs for errors

### Frontend Can't Connect

1. Verify server is running on port 4000
2. Check CORS settings (`CORS_ORIGIN=*` for Tailscale)
3. Ensure firewall allows port 4000
4. Verify frontend `.env.local` has correct `VITE_API_URL`

## 📝 Maintenance

### Updating the Server
```powershell
# Pull latest changes (if using Git)
git pull

# Reinstall dependencies (if package.json changed)
npm install

# Restart the server
```

### Viewing Logs
- Server logs appear in the terminal running `npm start`
- For PM2: `pm2 logs torrent-backend`

### Stopping the Server
- Press `Ctrl+C` in the terminal
- Or use `STOP_SERVER.ps1` script
- For PM2: `pm2 stop torrent-backend`

## 🔒 Security Notes

1. **Tailscale is Secure:** Your traffic is encrypted between devices
2. **CORS:** Set `CORS_ORIGIN=*` only for private networks (Tailscale)
3. **Firewall:** Only allow ports through Tailscale network
4. **Updates:** Keep Tailscale and Node.js updated

## 📱 Connecting Frontend

The frontend client needs to be configured to connect to this backend:

**Frontend `.env.local`:**
```env
VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api
VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
```

---

**Need Help?** Check the main README.md or review the error messages in the terminal.

