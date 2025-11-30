# Torrent Video Streamer

A **client-server torrent streaming application** that allows you to stream videos directly from torrents with seeking support. Built with React frontend and Node.js backend running WebTorrent.

## 🏗️ Architecture

- **Backend (Node.js + Express)**: Runs WebTorrent server-side, handles torrent downloads, streams videos via HTTP
- **Frontend (React + TypeScript)**: Modern UI for managing torrents and playing videos
- **WebSocket**: Real-time progress updates

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

## 🚀 Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

## 🎬 Running the Application

You need **TWO terminals** running simultaneously:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
The backend will start on **http://localhost:4000**

### Terminal 2: Frontend
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

### Backend (.env)
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=4000
NODE_ENV=development
DOWNLOADS_PATH=./downloads
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
Create `.env.local` (or copy from `.env.example`):
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
```

## 📡 API Endpoints

### Torrent Management
- `POST /api/torrents` - Add a torrent
- `GET /api/torrents` - Get all torrents
- `GET /api/torrents/:infoHash` - Get specific torrent
- `DELETE /api/torrents/:infoHash` - Remove a torrent
- `GET /api/torrents/:infoHash/progress` - Get progress

### Video Streaming
- `GET /api/stream/:infoHash/:fileIndex` - Stream video with range support

### Utility
- `GET /api/health` - Health check
- `GET /` - API information

## 🌐 WebSocket Events

- `torrent:progress` - Real-time progress updates (1-second interval)
- `torrent:update` - Initial torrent list

## 📁 Project Structure

```
torrent-video-streamer/
├── src/                          # Frontend (React)
│   ├── components/
│   │   ├── VideoPlayer/         # Video player component
│   │   └── TorrentManager/      # Torrent UI components
│   ├── services/
│   │   ├── apiClient.ts         # HTTP API client
│   │   └── websocketClient.ts   # WebSocket client
│   └── App.tsx                  # Main application
│
├── server/                       # Backend (Node.js)
│   ├── src/
│   │   ├── config/              # Configuration
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   ├── torrent/             # TorrentManager
│   │   ├── utils/               # Utilities
│   │   ├── websocket/           # WebSocket server
│   │   └── server.js            # Entry point
│   └── package.json
│
└── package.json                 # Frontend dependencies
```

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- Vite

### Backend
- Node.js
- Express
- WebTorrent
- WebSocket (ws)

## ⚠️ Known Limitations

- **Browser-only WebTorrent doesn't work** - That's why we built this with a backend
- **Some torrents may be slow** - Depends on seeders/peers availability
- **Large files take time** - Full download needed before seeking works smoothly
- **No built-in search** - Must provide magnet links manually

## 🚧 Development

### Build for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd server
npm start
```

### Linting
```bash
npm run lint
```

## 📝 Environment Variables

### Backend
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `DOWNLOADS_PATH` - Where to store downloads
- `CORS_ORIGIN` - Allowed frontend origin

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL

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

### Port Already in Use
If you see `EADDRINUSE` error:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Frontend Can't Connect to Backend
- Ensure backend is running on port 4000
- Check CORS settings in `server/.env`
- Verify `VITE_API_URL` in `.env.local`

### Video Won't Play
- Wait for torrent to fetch metadata
- Ensure file is a supported video format
- Check browser console for errors

---

**Happy Streaming! 🎬**
