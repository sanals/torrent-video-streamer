# Environment Files Guide

## 📁 File Structure

### Frontend (Root Directory)
- **`.env.local`** ⭐ **USE THIS** - Local overrides (highest priority, git-ignored)
- **`.env`** - Default values (if needed, but `.env.local` overrides it)
- **`.env.example`** - Template file (committed to git, shows required variables)

### Backend (server/ Directory)
- **`server/.env`** ⭐ **USE THIS** - Backend configuration (git-ignored)
- **`server/.env.example`** - Template file (committed to git, shows required variables)

## 🔑 Standard Variables

### Frontend Variables (`.env.local`)
```env
# API Configuration
VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api
VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
```

**For local development:**
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

### Backend Variables (`server/.env`)
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Storage Configuration
DOWNLOADS_PATH=./downloads
TORRENT_STORAGE_MODE=memory

# CORS Configuration
CORS_ORIGIN=*

# Torrent Management
AUTO_DELETE_ON_DISCONNECT=true
TORRENT_PAUSE_ON_VIDEO_PAUSE=true
```

## 📝 Priority Order

### Frontend (Vite)
1. `.env.local` (highest priority, git-ignored)
2. `.env` (default, git-ignored)
3. `.env.example` (template only, not loaded)

### Backend (Node.js dotenv)
1. `server/.env` (loaded by dotenv.config)
2. `server/.env.example` (template only, not loaded)

## ⚠️ Common Mistakes

1. **Don't put backend variables in frontend `.env` files**
   - ❌ Wrong: `CORS_ORIGIN` in root `.env`
   - ✅ Correct: `CORS_ORIGIN` in `server/.env`

2. **Use `.env.local` for frontend local overrides**
   - `.env.local` takes priority over `.env`
   - `.env.local` is git-ignored (safe for personal configs)

3. **Backend variables must be in `server/.env`**
   - The backend loads from `server/.env` (not root `.env`)

## 🚀 Quick Setup

### First Time Setup:
1. Copy `.env.example` to `.env.local` (frontend)
2. Copy `server/.env.example` to `server/.env` (backend)
3. Update with your Tailscale IP or localhost

### For Deployment:
- Update `.env.local` with your Tailscale IP
- Update `server/.env` with production settings

