# ⚡ Quick Start Guide - Frontend Client

## 🚀 Fast Setup (5 minutes)

### 1. Prerequisites
- **Node.js**: Download from [nodejs.org](https://nodejs.org/) (v18+)
- **Backend Server**: Make sure the backend server is running (see [backend repository](https://github.com/your-username/torrent-video-streamer-server))

### 2. Install Dependencies
```powershell
npm install
```

### 3. Configure Environment

**Create `.env.local` (replace with YOUR backend URL):**
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

**For remote backend (Tailscale):**
```env
VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api
VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
```

**Find your Tailscale IP (if using Tailscale):**
```powershell
tailscale ip
```

### 4. Start the Frontend

**Option A: Use the startup script**
```powershell
.\START_APP.ps1
```

**Option B: Manual start**
```powershell
npm run dev
```

### 5. Access the App

- **Local**: http://localhost:3000
- **Remote (via Tailscale)**: http://YOUR_TAILSCALE_IP:3000

### 6. Stop the Frontend

```powershell
.\STOP_APP.ps1
```

Or press `Ctrl+C` in the terminal.

---

## 📱 Access from Phone

1. Install Tailscale app on your phone
2. Sign in with the same account
3. Open browser: `http://YOUR_TAILSCALE_IP:3000`

---

## 🔧 Troubleshooting

**Can't connect to backend?**
- Verify backend server is running on port 4000
- Check `.env.local` has correct backend URL
- Ensure backend CORS allows your frontend origin

**Can't access from phone?**
- Check both devices are connected to Tailscale
- Verify `.env.local` has correct Tailscale IP
- Check Windows Firewall allows Node.js

---

**Full details**: See `DEPLOYMENT.md` or the backend repository

