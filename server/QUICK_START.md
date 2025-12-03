# ⚡ Quick Start Guide - Backend Server

## 🚀 Fast Setup (5 minutes)

### 1. Install Prerequisites
- **Node.js**: Download from [nodejs.org](https://nodejs.org/) (v18+)

### 2. Install Dependencies
```powershell
npm install
```

### 3. Configure Environment

**Create `.env`:**
```env
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*
TORRENT_STORAGE_MODE=memory
AUTO_DELETE_ON_DISCONNECT=true
TORRENT_PAUSE_ON_VIDEO_PAUSE=true
```

### 4. Start the Server

**Option A: Use the startup script (Easiest)**
```powershell
.\START_SERVER.ps1
```

**Option B: Manual start**
```powershell
npm start
```

### 5. Verify Server is Running

- **Health check**: http://localhost:4000/api/health
- **API info**: http://localhost:4000/

### 6. Stop the Server

```powershell
.\STOP_SERVER.ps1
```

Or press `Ctrl+C` in the terminal.

---

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed frontend origin (use `*` for Tailscale)
- `TORRENT_STORAGE_MODE` - `memory` or `disk` (default: memory)
- `AUTO_DELETE_ON_DISCONNECT` - Delete torrents when last client disconnects
- `TORRENT_PAUSE_ON_VIDEO_PAUSE` - Pause download when video pauses

---

## 🐛 Troubleshooting

**Port in use?**
```powershell
.\stop-port-4000.ps1
```

**Can't connect from frontend?**
- Check CORS settings in `.env` (set `CORS_ORIGIN=*` for Tailscale)
- Verify firewall allows port 4000
- Check backend logs for errors

---

**Full details**: See `DEPLOYMENT.md` or `README.md`

