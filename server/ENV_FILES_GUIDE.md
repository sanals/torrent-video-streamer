# Environment Files Guide - Backend Server

## 📁 File Structure

### Backend (Root Directory)
- **`.env`** ⭐ **USE THIS** - Backend configuration (git-ignored)
- **`.env.example`** - Template file (committed to git, shows required variables)

## 🔑 Standard Variables

### Backend Variables (`.env`)
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

### Backend (Node.js dotenv)
1. `.env` (loaded by dotenv.config)
2. `.env.example` (template only, not loaded)

## ⚠️ Common Mistakes

1. **Don't put frontend variables in backend `.env` files**
   - ❌ Wrong: `VITE_API_URL` in `.env`
   - ✅ Correct: `VITE_API_URL` in frontend `.env.local`

2. **Backend variables must be in `.env`**
   - The backend loads from `.env` (in the server root directory)

3. **CORS_ORIGIN for Tailscale**
   - Use `CORS_ORIGIN=*` for Tailscale networks
   - Use specific origin for production (e.g., `CORS_ORIGIN=https://yourdomain.com`)

## 🚀 Quick Setup

### First Time Setup:
1. Copy `.env.example` to `.env`
2. Update with your configuration
3. For Tailscale: Set `CORS_ORIGIN=*`

### For Deployment:
- Update `.env` with production settings
- Set appropriate `CORS_ORIGIN` for your frontend URL
- Configure `TORRENT_STORAGE_MODE` (memory for temporary, disk for persistent)

## 📋 Variable Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 4000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DOWNLOADS_PATH` | Path for disk storage | ./downloads | No |
| `TORRENT_STORAGE_MODE` | Storage mode: memory or disk | memory | No |
| `CORS_ORIGIN` | Allowed frontend origin | * | No |
| `AUTO_DELETE_ON_DISCONNECT` | Auto-delete torrents | true | No |
| `TORRENT_PAUSE_ON_VIDEO_PAUSE` | Pause on video pause | true | No |

