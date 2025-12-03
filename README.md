# Torrent Video Streamer - Frontend Client

A **React frontend client** for streaming videos directly from torrents. Connects to a backend server that handles WebTorrent downloads and video streaming.

## 🏗️ Architecture

- **Frontend (React + TypeScript)**: Modern UI for managing torrents and playing videos
- **Backend Server**: Separate Node.js server (see [server repository](https://github.com/your-username/torrent-video-streamer-server))
- **WebSocket**: Real-time progress updates from backend

## ✨ Features

- ✅ Stream any torrent (not limited to WebRTC-only torrents)
- ✅ Real-time download progress with peers/speed info
- ✅ Video seeking support via HTTP range requests
- ✅ Multiple concurrent torrents
- ✅ Clean, modern Material-UI interface
- ✅ WebSocket live updates

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🌐 Remote Deployment (Tailscale)

**Want to run this on a server/laptop and access it remotely?**

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide**

📖 **See [QUICK_START.md](./QUICK_START.md) for quick setup**

Quick steps:
1. Install Node.js and Tailscale
2. Configure `.env.local` with your Tailscale IP
3. Run `.\START_APP.ps1` (Windows) or start manually
4. Access from any device via Tailscale: `http://YOUR_TAILSCALE_IP:3000`

## 🚀 Installation

### Install Dependencies
```bash
npm install
```

## 🎬 Running the Application

### Prerequisites
Make sure the backend server is running. See the [backend repository](https://github.com/your-username/torrent-video-streamer-server) for setup instructions.

### Start Frontend
```bash
npm run dev
```
The frontend will start on **http://localhost:3000**

## 📖 Usage

1. **Open your browser** to http://localhost:3000
2. **Paste a magnet link** in the input field
3. **Click "Add"** to start downloading
4. **Watch progress** update in real-time
5. **Click the play button** on any video file to start streaming
6. **Use the video player controls** to play, pause, seek, adjust volume
7. **Click the trash icon** to remove a torrent

## 🔗 Test Magnet Link

Try this WebTorrent-compatible test torrent (Big Buck Bunny):
```
magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com
```

## 🔧 Configuration

### Frontend (.env.local)
Create `.env.local` (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

**For remote backend (Tailscale):**
```env
VITE_API_URL=http://YOUR_TAILSCALE_IP:4000/api
VITE_WS_URL=ws://YOUR_TAILSCALE_IP:4000
```

## 📡 Backend API

This frontend connects to a backend server that provides:
- Torrent management endpoints
- Video streaming with range support
- WebSocket real-time updates
- Torrent search functionality

See the [backend repository](https://github.com/your-username/torrent-video-streamer-server) for API documentation.

## 📁 Project Structure

```
torrent-video-streamer-frontend/
├── src/
│   ├── components/
│   │   ├── VideoPlayer/         # Video player component
│   │   ├── TorrentManager/      # Torrent UI components
│   │   └── TorrentSearch/       # Search UI
│   ├── services/
│   │   ├── apiClient.ts         # HTTP API client
│   │   ├── websocketClient.ts   # WebSocket client
│   │   └── searchService.ts     # Search functionality
│   ├── hooks/                   # Custom React hooks
│   ├── contexts/                # React contexts
│   ├── types/                   # TypeScript types
│   └── App.tsx                   # Main application
├── public/                       # Static assets
├── index.html                    # Entry HTML
└── package.json                  # Dependencies
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Vite** - Build tool and dev server
- **Video.js** - Video player
- **Axios** - HTTP client

## ⚠️ Known Limitations

- **Requires backend server** - This is a frontend-only client
- **Some torrents may be slow** - Depends on seeders/peers availability
- **Large files take time** - Full download needed before seeking works smoothly

## 🚧 Development

### Build for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## 📝 Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:4000/api)
- `VITE_WS_URL` - WebSocket URL (default: ws://localhost:4000)

## 🤝 Contributing

This is a personal project, but feel free to fork and modify!

## 📄 License

MIT

## 🎯 Future Enhancements

- [ ] Torrent search integration
- [ ] Multiple video players
- [ ] Download queue management
- [ ] Subtitle support
- [ ] Mobile responsive design improvements
- [ ] Docker containerization

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend
- Ensure backend server is running
- Verify `VITE_API_URL` in `.env.local` points to correct backend URL
- Check backend CORS settings allow your frontend origin
- Check browser console for connection errors

### Video Won't Play
- Wait for torrent to fetch metadata
- Ensure file is a supported video format
- Check browser console for errors
- Verify backend is streaming the file correctly

---

**Happy Streaming! 🎬**

