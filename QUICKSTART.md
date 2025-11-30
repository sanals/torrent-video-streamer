# Quick Start Guide

## 🚀 Running the Application

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend running on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running on http://localhost:3000

### Open Browser
Go to: **http://localhost:3000**

---

## 📖 How to Use

### 1. Add a Torrent
Paste a magnet link in the input field and click "Add"

**Test Magnet Link:**
```
magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com
```

### 2. Watch Progress
- Progress bar shows download status
- Real-time updates for speed and peers
- Metadata loads automatically

### 3. Play Video
- Click the ▶️ play button next to any video file
- Video player appears at the top
- Use controls to play, pause, seek, adjust volume

### 4. Remove Torrent
Click the 🗑️ trash icon to remove a torrent

---

## ✅ What's Working

- ✅ Add any magnet link
- ✅ Real-time progress (updates every second)
- ✅ Multiple torrents at once
- ✅ Video streaming with seeking
- ✅ Remove torrents

---

## 🎯 Next Steps

### Optional Enhancements
1. **Add torrent search** - Find torrents by name
2. **Save torrent list** - Remember torrents in localStorage
3. **Download progress bar** - Show buffer status
4. **Quality selection** - Choose video quality
5. **Subtitles** - SRT/VTT subtitle support

### Production Deployment
1. Build frontend: `npm run build`
2. Use PM2 for backend: `pm2 start server/src/server.js`
3. Setup nginx reverse proxy
4. Use environment variables for URLs

---

## 🔧 Configuration

### Change Ports

**Backend Port (in `server/.env`):**
```env
PORT=5000  # Change from 4000
```

**Frontend Port (in `vite.config.ts`):**
```typescript
server: {
  port: 3001,  // Change from 3000
}
```

Remember to update `.env.local` to match!

---

## 📝 Notes

- Backend runs WebTorrent server-side (no browser limitations!)
- Any torrent works (not just WebRTC-enabled ones)
- Video seeking works via HTTP range requests
- WebSocket provides real-time updates
