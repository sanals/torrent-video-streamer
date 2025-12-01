# ⚡ Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### 1. Install Prerequisites
- **Node.js**: Download from [nodejs.org](https://nodejs.org/) (v18+)
- **Tailscale**: Download from [tailscale.com/download](https://tailscale.com/download)

### 2. Install Dependencies
```powershell
npm install
cd server
npm install
cd ..
```

### 3. Configure Environment

**Create `server/.env`:**
```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*
USE_MEMORY_STORAGE=true
AUTO_DELETE_ON_DISCONNECT=true
```

**Create `.env.local` (replace with YOUR Tailscale IP):**
```env
VITE_API_URL=http://100.106.121.5:4000/api
VITE_WS_URL=ws://100.106.121.5:4000
```

**Find your Tailscale IP:**
```powershell
tailscale ip
```

### 4. Start the App

**Option A: Use the startup script (Easiest)**
```powershell
.\START_APP.ps1
```

**Option B: Manual start (Two terminals)**
```powershell
# Terminal 1
cd server
npm start

# Terminal 2 (new terminal)
npm run dev
```

### 5. Access the App

- **Local**: http://localhost:3000
- **Remote (via Tailscale)**: http://YOUR_TAILSCALE_IP:3000

### 6. Stop the App

```powershell
.\STOP_APP.ps1
```

Or press `Ctrl+C` in both terminals.

---

## 📱 Access from Phone

1. Install Tailscale app on your phone
2. Sign in with the same account
3. Open browser: `http://YOUR_TAILSCALE_IP:3000`

---

## 🔧 Troubleshooting

**Port in use?**
```powershell
.\stop-port-4000.ps1
```

**Can't access from phone?**
- Check both devices are connected to Tailscale
- Verify `.env.local` has correct Tailscale IP
- Check Windows Firewall allows Node.js

---

**Full details**: See `DEPLOYMENT.md`

