# 🚀 Deployment Guide - Frontend Client

Complete guide for deploying the frontend client. **Note:** This requires a separate backend server to be running.

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

```powershell
npm install
```

### Step 3: Configure Environment Variables

**Frontend Configuration (`.env.local`):**
Replace `YOUR_BACKEND_URL` with your backend server URL:

**For local backend:**
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

**For remote backend (Tailscale):**
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
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

Or manually:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js for both Private and Public networks
4. Allow port 3000

## 🎬 Running the Application

**Prerequisites:** Make sure the backend server is running. See the [backend repository](https://github.com/your-username/torrent-video-streamer-server) for setup.

### Manual Start
```powershell
npm run dev
```

### Using Startup Script (Recommended)

See `START_APP.ps1` and `STOP_APP.ps1` scripts for easier management.

## 🌐 Accessing the App

### On the Same Machine:
- Frontend: `http://localhost:3000`

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
   - Arguments: `-File "C:\path\to\torrent-video-streamer-frontend\START_APP.ps1"`
   - Start in: `C:\path\to\torrent-video-streamer-frontend`

3. Check "Run whether user is logged on or not"
4. Set user account with appropriate permissions

### Option 2: Startup Folder

1. Press `Win + R`, type `shell:startup`
2. Create shortcuts to:
   - `START_APP.ps1` (or create a batch file that runs it)

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Can't Access from Other Devices

1. **Check Tailscale:**
   ```powershell
   tailscale status
   ```
   Ensure both devices are connected.

2. **Check Firewall:**
   - Ensure Windows Firewall allows Node.js
   - Check that port 3000 is open

3. **Check IP Address:**
   ```powershell
   tailscale ip
   ```
   Use this IP in your `.env.local` file for the backend URL.

4. **Restart Frontend:**
   - Stop the frontend
   - Restart it

### Frontend Won't Start

1. Check if port 3000 is available
2. Verify `.env.local` exists and is configured
3. Check Node.js version: `node --version` (must be v18+)

### Frontend Can't Connect to Backend

1. Verify backend server is running (check backend repository)
2. Check `.env.local` has correct backend URL
3. Ensure backend CORS is configured to allow your frontend origin
4. Restart frontend after changing `.env.local`
5. Check browser console for connection errors

## 📝 Maintenance

### Updating the App
```powershell
# Pull latest changes (if using Git)
git pull

# Reinstall dependencies (if package.json changed)
npm install

# Restart the app
```

### Viewing Logs
- Frontend logs appear in browser console (F12)
- Frontend dev server logs appear in the terminal

### Stopping the App
- Press `Ctrl+C` in the terminal
- Or use `STOP_APP.ps1` script

## 🔒 Security Notes

1. **Tailscale is Secure:** Your traffic is encrypted between devices
2. **Backend CORS:** Ensure backend is configured to allow your frontend origin
3. **Firewall:** Only allow ports through Tailscale network
4. **Updates:** Keep Tailscale and Node.js updated

## 📱 Mobile Access

1. Install Tailscale app on your phone
2. Sign in with the same account
3. Open browser: `http://YOUR_TAILSCALE_IP:3000`
4. The app should work just like on desktop!

---

**Need Help?** Check the main README.md, the backend repository, or review the error messages in the browser console.

