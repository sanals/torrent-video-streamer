# 🚀 Deployment Guide - Torrent Video Streamer

Complete guide for deploying the app on a laptop/server with Tailscale for remote access.

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

### 3. Install Tailscale
1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download)
2. Install and sign in with your Tailscale account
3. Note your Tailscale IP address (e.g., `100.106.121.5`)
   - You can find it in the Tailscale app or by running: `tailscale ip`

## 📦 Installation Steps

### Step 1: Get the Project
If you have the project files:
```powershell
# Navigate to your project directory
cd C:\path\to\torrent-video-streamer
```

If you need to clone from Git:
```powershell
git clone <your-repo-url>
cd torrent-video-streamer
```

### Step 2: Install Dependencies

**Frontend:**
```powershell
npm install
```

**Backend:**
```powershell
cd server
npm install
cd ..
```

### Step 3: Configure Environment Variables

**Backend Configuration (`server/.env`):**
```env
PORT=4000
NODE_ENV=production
DOWNLOADS_PATH=./downloads
CORS_ORIGIN=*
USE_MEMORY_STORAGE=true
AUTO_DELETE_ON_DISCONNECT=true
PAUSE_ON_VIDEO_PAUSE=true
```

**Frontend Configuration (`.env.local`):**
Replace `YOUR_TAILSCALE_IP` with your actual Tailscale IP:
```env
VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api
VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
```

**Example:**
```env
VITE_API_URL=http://100.106.121.5:4000/api
VITE_WS_URL=ws://100.106.121.5:4000
```

### Step 4: Configure Windows Firewall

Allow Node.js through Windows Firewall:
```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js for both Private and Public networks
4. Allow ports 3000 and 4000

## 🎬 Running the Application

### Manual Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd server
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Using Startup Scripts (Recommended)

See `START_APP.ps1` and `STOP_APP.ps1` scripts below for easier management.

## 🌐 Accessing the App

### On the Same Laptop:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`

### From Another Device (via Tailscale):
- Frontend: `http://YOUR_TAILSCALE_IP:3000`
- Example: `http://100.106.121.5:3000`

### From Your Phone:
1. Install Tailscale on your phone
2. Connect to the same Tailscale network
3. Open browser: `http://YOUR_TAILSCALE_IP:3000`

## 🔄 Auto-Start on Boot (Optional)

### Option 1: Windows Task Scheduler (Recommended)

1. Open Task Scheduler
2. Create Basic Task:
   - Name: "Torrent Video Streamer"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `powershell.exe`
   - Arguments: `-File "C:\path\to\torrent-video-streamer\START_APP.ps1"`
   - Start in: `C:\path\to\torrent-video-streamer`

3. Check "Run whether user is logged on or not"
4. Set user account with appropriate permissions

### Option 2: Startup Folder

1. Press `Win + R`, type `shell:startup`
2. Create shortcuts to:
   - `START_APP.ps1` (or create a batch file that runs it)

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
   - Check that ports 3000 and 4000 are open

3. **Check IP Address:**
   ```powershell
   tailscale ip
   ```
   Use this IP in your `.env.local` file.

4. **Restart Services:**
   - Stop both frontend and backend
   - Restart them

### Backend Won't Start

1. Check if port 4000 is available
2. Verify `server/.env` exists and is configured
3. Check Node.js version: `node --version` (must be v18+)

### Frontend Can't Connect to Backend

1. Verify backend is running on port 4000
2. Check `.env.local` has correct Tailscale IP
3. Ensure CORS is configured (`CORS_ORIGIN=*` in `server/.env`)
4. Restart frontend after changing `.env.local`

## 📝 Maintenance

### Updating the App
```powershell
# Pull latest changes (if using Git)
git pull

# Reinstall dependencies (if package.json changed)
npm install
cd server
npm install
cd ..

# Restart the app
```

### Viewing Logs
- Backend logs appear in the terminal running `npm start`
- Frontend logs appear in browser console (F12)

### Stopping the App
- Press `Ctrl+C` in both terminals
- Or use `STOP_APP.ps1` script

## 🔒 Security Notes

1. **Tailscale is Secure:** Your traffic is encrypted between devices
2. **CORS:** Set `CORS_ORIGIN=*` only for private networks (Tailscale)
3. **Firewall:** Only allow ports through Tailscale network
4. **Updates:** Keep Tailscale and Node.js updated

## 📱 Mobile Access

1. Install Tailscale app on your phone
2. Sign in with the same account
3. Open browser: `http://YOUR_TAILSCALE_IP:3000`
4. The app should work just like on desktop!

---

**Need Help?** Check the main README.md or review the error messages in the terminal.

